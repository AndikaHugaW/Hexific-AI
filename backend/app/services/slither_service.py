"""
Slither Static Analysis Service
Runs Slither on smart contracts for vulnerability detection
"""
import os
import json
import shutil
import asyncio
import tempfile
import zipfile
from typing import Optional
from pathlib import Path


class SlitherService:
    """Service for running Slither static analysis on smart contracts"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
    
    async def analyze_zip(self, zip_content: bytes) -> dict:
        """
        Analyze smart contracts from a ZIP file
        
        Args:
            zip_content: ZIP file content as bytes
        
        Returns:
            dict with analysis results
        """
        work_dir = None
        try:
            # Create temporary directory for extraction
            work_dir = tempfile.mkdtemp(prefix="hexific_")
            zip_path = os.path.join(work_dir, "contracts.zip")
            extract_dir = os.path.join(work_dir, "contracts")
            
            # Write ZIP file
            with open(zip_path, "wb") as f:
                f.write(zip_content)
            
            # Extract ZIP
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Find Solidity files
            sol_files = list(Path(extract_dir).rglob("*.sol"))
            
            if not sol_files:
                return {
                    "success": False,
                    "error": "No Solidity files found in the ZIP archive",
                    "vulnerabilities": []
                }
            
            # Run Slither analysis
            results = await self._run_slither(extract_dir)
            
            return {
                "success": True,
                "files_analyzed": [str(f.relative_to(extract_dir)) for f in sol_files],
                "vulnerabilities": results.get("vulnerabilities", []),
                "summary": results.get("summary", {}),
                "raw_output": results.get("raw_output", "")
            }
            
        except zipfile.BadZipFile:
            return {
                "success": False,
                "error": "Invalid ZIP file",
                "vulnerabilities": []
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "vulnerabilities": []
            }
        finally:
            # Cleanup
            if work_dir and os.path.exists(work_dir):
                shutil.rmtree(work_dir, ignore_errors=True)
    
    async def analyze_source(self, source_code: str, filename: str = "Contract.sol") -> dict:
        """
        Analyze a single smart contract source code
        
        Args:
            source_code: Solidity source code
            filename: Name for the contract file
        
        Returns:
            dict with analysis results
        """
        work_dir = None
        try:
            # Create temporary directory
            work_dir = tempfile.mkdtemp(prefix="hexific_")
            sol_path = os.path.join(work_dir, filename)
            
            # Write source code
            with open(sol_path, "w", encoding="utf-8") as f:
                f.write(source_code)
            
            # Run Slither analysis
            results = await self._run_slither(work_dir)
            
            return {
                "success": True,
                "files_analyzed": [filename],
                "vulnerabilities": results.get("vulnerabilities", []),
                "summary": results.get("summary", {}),
                "raw_output": results.get("raw_output", "")
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "vulnerabilities": []
            }
        finally:
            # Cleanup
            if work_dir and os.path.exists(work_dir):
                shutil.rmtree(work_dir, ignore_errors=True)
    
    async def _run_slither(self, target_dir: str) -> dict:
        """
        Run Slither on a directory containing Solidity files
        
        Args:
            target_dir: Directory containing .sol files
        
        Returns:
            dict with parsed Slither results
        """
        # Check if Docker sandboxing is enabled
        use_docker = os.environ.get("USE_DOCKER_SLITHER", "false").lower() == "true"
        
        if use_docker:
            return await self._run_slither_docker(target_dir)
        else:
            return await self._run_slither_local(target_dir)
    
    async def _run_slither_docker(self, target_dir: str) -> dict:
        """
        Run Slither in a Docker container (sandboxed)
        
        This provides isolation and security when analyzing untrusted code
        """
        try:
            # Container name for cleanup
            container_name = f"hexific_slither_{os.getpid()}_{id(target_dir)}"
            
            # Run slither in Docker container
            process = await asyncio.create_subprocess_exec(
                "docker", "run",
                "--rm",                          # Auto-remove container
                "--name", container_name,
                "--network", "none",             # No network access
                "--memory", "512m",              # Memory limit
                "--cpus", "1",                   # CPU limit
                "--read-only",                   # Read-only filesystem
                "--tmpfs", "/tmp:size=100M",    # Temp storage
                "-v", f"{target_dir}:/workspace:ro",  # Mount code read-only
                "hexific-slither:latest",        # Docker image
                "/workspace",
                "--json", "-",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=180  # 3 minute timeout for Docker
            )
            
            # Parse JSON output
            if stdout:
                try:
                    slither_output = json.loads(stdout.decode("utf-8"))
                    return self._parse_slither_output(slither_output)
                except json.JSONDecodeError:
                    pass
            
            # If JSON parsing failed, return raw output
            raw_output = stdout.decode("utf-8") if stdout else stderr.decode("utf-8")
            return self._parse_raw_output(raw_output)
            
        except asyncio.TimeoutError:
            # Kill container if timeout
            try:
                await asyncio.create_subprocess_exec(
                    "docker", "kill", container_name,
                    stdout=asyncio.subprocess.DEVNULL,
                    stderr=asyncio.subprocess.DEVNULL
                )
            except:
                pass
            
            return {
                "vulnerabilities": [],
                "summary": {"error": "Analysis timed out"},
                "raw_output": "Slither analysis timed out after 3 minutes"
            }
        except FileNotFoundError:
            # Docker not available, fallback to local
            return await self._run_slither_local(target_dir)
        except Exception as e:
            return {
                "vulnerabilities": [],
                "summary": {"error": str(e)},
                "raw_output": f"Docker Slither error: {str(e)}"
            }
    
    async def _run_slither_local(self, target_dir: str) -> dict:
        """
        Run Slither locally (original implementation)
        
        Used when Docker is not available or USE_DOCKER_SLITHER is false
        """
        try:
            # Run slither with JSON output
            process = await asyncio.create_subprocess_exec(
                "slither",
                target_dir,
                "--json", "-",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=120  # 2 minute timeout
            )
            
            # Parse JSON output
            if stdout:
                try:
                    slither_output = json.loads(stdout.decode("utf-8"))
                    return self._parse_slither_output(slither_output)
                except json.JSONDecodeError:
                    pass
            
            # If JSON parsing failed, return raw output
            raw_output = stdout.decode("utf-8") if stdout else stderr.decode("utf-8")
            return self._parse_raw_output(raw_output)
            
        except asyncio.TimeoutError:
            return {
                "vulnerabilities": [],
                "summary": {"error": "Analysis timed out"},
                "raw_output": "Slither analysis timed out after 2 minutes"
            }
        except FileNotFoundError:
            return {
                "vulnerabilities": [],
                "summary": {"error": "Slither not installed"},
                "raw_output": "Slither is not installed. Please install with: pip install slither-analyzer"
            }
        except Exception as e:
            return {
                "vulnerabilities": [],
                "summary": {"error": str(e)},
                "raw_output": str(e)
            }
    
    def _parse_slither_output(self, output: dict) -> dict:
        """Parse Slither JSON output into structured format"""
        vulnerabilities = []
        severity_count = {"high": 0, "medium": 0, "low": 0, "informational": 0}
        
        detectors = output.get("results", {}).get("detectors", [])
        
        for detector in detectors:
            severity = detector.get("impact", "informational").lower()
            severity_count[severity] = severity_count.get(severity, 0) + 1
            
            vuln = {
                "id": detector.get("check", "unknown"),
                "title": detector.get("check", "Unknown Issue"),
                "severity": severity,
                "confidence": detector.get("confidence", "unknown"),
                "description": detector.get("description", ""),
                "locations": []
            }
            
            # Extract affected locations
            for element in detector.get("elements", []):
                if "source_mapping" in element:
                    vuln["locations"].append({
                        "file": element.get("source_mapping", {}).get("filename_relative", ""),
                        "lines": element.get("source_mapping", {}).get("lines", []),
                        "type": element.get("type", ""),
                        "name": element.get("name", "")
                    })
            
            vulnerabilities.append(vuln)
        
        return {
            "vulnerabilities": vulnerabilities,
            "summary": {
                "total": len(vulnerabilities),
                "by_severity": severity_count
            },
            "raw_output": json.dumps(output, indent=2)
        }
    
    def _parse_raw_output(self, output: str) -> dict:
        """Parse raw Slither text output (fallback)"""
        # Simple parsing of text output
        vulnerabilities = []
        
        lines = output.split("\n")
        current_vuln = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect severity indicators
            if any(severity in line.lower() for severity in ["high", "medium", "low", "informational"]):
                if current_vuln:
                    vulnerabilities.append(current_vuln)
                
                severity = "informational"
                for s in ["high", "medium", "low", "informational"]:
                    if s in line.lower():
                        severity = s
                        break
                
                current_vuln = {
                    "id": f"raw_{len(vulnerabilities)}",
                    "title": line[:100],
                    "severity": severity,
                    "description": line,
                    "locations": []
                }
        
        if current_vuln:
            vulnerabilities.append(current_vuln)
        
        return {
            "vulnerabilities": vulnerabilities,
            "summary": {
                "total": len(vulnerabilities)
            },
            "raw_output": output
        }


# Singleton instance
slither_service = SlitherService()
