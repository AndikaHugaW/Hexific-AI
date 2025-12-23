#!/usr/bin/env node

/**
 * Hexific CLI - Smart Contract Audit Tool
 * 
 * Usage:
 *   hexific audit ./contracts           # Audit contracts folder (creates ZIP)
 *   hexific audit -a 0x1234...          # Audit by contract address
 *   hexific audit ./contract.sol        # Audit single file
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const API_URL = process.env.HEXIFIC_API_URL || 'http://localhost:8000';
const VERSION = '1.0.0';

// Create CLI program
const program = new Command();

program
    .name('hexific')
    .description('Hexific - AI-Powered Smart Contract Audit CLI')
    .version(VERSION);

// Audit command
program
    .command('audit')
    .description('Audit smart contracts')
    .argument('[path]', 'Path to contract file or folder')
    .option('-a, --address <address>', 'Contract address to audit')
    .option('-n, --network <network>', 'Network for address audit', 'mainnet')
    .option('-o, --output <file>', 'Output file for report', 'audit-report.md')
    .option('--api-url <url>', 'Custom API URL', API_URL)
    .action(async (contractPath, options) => {
        console.log(chalk.cyan('\n🔍 Hexific Smart Contract Audit\n'));

        const spinner = ora();

        try {
            let result;

            if (options.address) {
                // Audit by address
                spinner.start(`Fetching contract from ${options.network}...`);
                result = await auditByAddress(options.address, options.network, options.apiUrl);
            } else if (contractPath) {
                // Audit by file/folder
                spinner.start('Preparing contracts...');
                result = await auditByPath(contractPath, options.apiUrl);
            } else {
                console.log(chalk.red('Error: Please provide a contract path or address'));
                console.log(chalk.gray('  hexific audit ./contracts'));
                console.log(chalk.gray('  hexific audit -a 0x1234...'));
                process.exit(1);
            }

            spinner.succeed('Audit completed!');

            // Save report
            const report = formatReport(result);
            fs.writeFileSync(options.output, report);
            console.log(chalk.green(`\n✅ Report saved to ${options.output}`));

            // Print summary
            printSummary(result);

        } catch (error) {
            spinner.fail('Audit failed');
            console.error(chalk.red(`\nError: ${error.message}`));
            if (error.response?.data?.detail) {
                console.error(chalk.gray(error.response.data.detail));
            }
            process.exit(1);
        }
    });

// Audit by contract address
async function auditByAddress(address, network, apiUrl) {
    const response = await axios.post(`${apiUrl}/audit/address-ui`, {
        address,
        network
    }, {
        timeout: 300000 // 5 min timeout for AI analysis
    });
    return response.data;
}

// Audit by file path
async function auditByPath(contractPath, apiUrl) {
    const absolutePath = path.resolve(contractPath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Path not found: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    let zipPath;

    if (stats.isDirectory()) {
        // Create ZIP from folder
        zipPath = path.join(process.cwd(), '.hexific-temp.zip');
        console.log(chalk.gray(`  Creating ZIP from ${contractPath}...`));

        // Use PowerShell on Windows, zip on Unix
        if (process.platform === 'win32') {
            execSync(`powershell Compress-Archive -Path "${absolutePath}/*" -DestinationPath "${zipPath}" -Force`, {
                stdio: 'pipe'
            });
        } else {
            execSync(`zip -r "${zipPath}" "${absolutePath}"`, { stdio: 'pipe' });
        }
    } else if (absolutePath.endsWith('.zip')) {
        zipPath = absolutePath;
    } else if (absolutePath.endsWith('.sol')) {
        // Single .sol file - create a temp zip
        zipPath = path.join(process.cwd(), '.hexific-temp.zip');
        const tempDir = path.join(process.cwd(), '.hexific-temp');

        fs.mkdirSync(tempDir, { recursive: true });
        fs.copyFileSync(absolutePath, path.join(tempDir, path.basename(absolutePath)));

        if (process.platform === 'win32') {
            execSync(`powershell Compress-Archive -Path "${tempDir}/*" -DestinationPath "${zipPath}" -Force`, {
                stdio: 'pipe'
            });
        } else {
            execSync(`zip -r "${zipPath}" "${tempDir}"`, { stdio: 'pipe' });
        }

        fs.rmSync(tempDir, { recursive: true });
    } else {
        throw new Error('Please provide a .sol file, .zip file, or folder');
    }

    // Upload ZIP
    const formData = new FormData();
    formData.append('file', fs.createReadStream(zipPath), 'contracts.zip');

    const response = await axios.post(`${apiUrl}/audit/`, formData, {
        headers: formData.getHeaders(),
        timeout: 300000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    // Cleanup temp zip
    if (zipPath.includes('.hexific-temp')) {
        fs.unlinkSync(zipPath);
    }

    return response.data;
}

// Format report as Markdown
function formatReport(result) {
    const lines = [];
    const timestamp = new Date().toISOString();

    lines.push('# Hexific Smart Contract Audit Report');
    lines.push(`\nGenerated: ${timestamp}`);
    lines.push(`Audit Type: ${result.audit_type}`);
    lines.push(`Tier: ${result.tier}`);

    if (result.contract) {
        lines.push('\n## Contract Info');
        lines.push(`- **Name:** ${result.contract.name}`);
        lines.push(`- **Address:** ${result.contract.address}`);
        lines.push(`- **Network:** ${result.contract.network}`);
        if (result.contract.compiler) {
            lines.push(`- **Compiler:** ${result.contract.compiler}`);
        }
    }

    lines.push('\n## Findings');

    if (result.results?.findings) {
        const findings = result.results.findings;

        // Group by severity
        const critical = findings.filter(f => f.severity?.toLowerCase() === 'critical');
        const high = findings.filter(f => f.severity?.toLowerCase() === 'high');
        const medium = findings.filter(f => f.severity?.toLowerCase() === 'medium');
        const low = findings.filter(f => f.severity?.toLowerCase() === 'low');
        const info = findings.filter(f => f.severity?.toLowerCase() === 'informational' || f.severity?.toLowerCase() === 'info');

        if (critical.length) {
            lines.push('\n### 🔴 Critical');
            critical.forEach(f => lines.push(`- **${f.title || f.check}**: ${f.description || f.impact}`));
        }
        if (high.length) {
            lines.push('\n### 🟠 High');
            high.forEach(f => lines.push(`- **${f.title || f.check}**: ${f.description || f.impact}`));
        }
        if (medium.length) {
            lines.push('\n### 🟡 Medium');
            medium.forEach(f => lines.push(`- **${f.title || f.check}**: ${f.description || f.impact}`));
        }
        if (low.length) {
            lines.push('\n### 🟢 Low');
            low.forEach(f => lines.push(`- **${f.title || f.check}**: ${f.description || f.impact}`));
        }
        if (info.length) {
            lines.push('\n### ℹ️ Informational');
            info.forEach(f => lines.push(`- **${f.title || f.check}**: ${f.description || f.impact}`));
        }
    } else if (result.results?.analysis) {
        lines.push('\n' + result.results.analysis);
    } else if (result.results?.raw_output) {
        lines.push('\n```');
        lines.push(result.results.raw_output);
        lines.push('```');
    }

    lines.push('\n---');
    lines.push('*Generated by [Hexific](https://hexific.com) - AI-Powered Smart Contract Audit*');

    return lines.join('\n');
}

// Print summary to console
function printSummary(result) {
    console.log(chalk.cyan('\n📊 Audit Summary'));
    console.log(chalk.gray('─'.repeat(40)));

    if (result.results?.findings) {
        const findings = result.results.findings;
        const critical = findings.filter(f => f.severity?.toLowerCase() === 'critical').length;
        const high = findings.filter(f => f.severity?.toLowerCase() === 'high').length;
        const medium = findings.filter(f => f.severity?.toLowerCase() === 'medium').length;
        const low = findings.filter(f => f.severity?.toLowerCase() === 'low').length;

        if (critical) console.log(chalk.red(`  🔴 Critical: ${critical}`));
        if (high) console.log(chalk.hex('#FFA500')(`  🟠 High: ${high}`));
        if (medium) console.log(chalk.yellow(`  🟡 Medium: ${medium}`));
        if (low) console.log(chalk.green(`  🟢 Low: ${low}`));

        if (!critical && !high && !medium && !low) {
            console.log(chalk.green('  ✅ No major issues found!'));
        }
    }

    if (result.rate_limit) {
        console.log(chalk.gray(`\n  Audits remaining: ${result.rate_limit.remaining}/${result.rate_limit.limit}`));
    }
}

// Run CLI
program.parse();
