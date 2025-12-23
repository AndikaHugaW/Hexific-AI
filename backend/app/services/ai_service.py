"""
AI Service for Smart Contract Auditing
Integrates with Claude (Anthropic) and Groq for AI-powered analysis
"""
from typing import Optional
import httpx
from openai import OpenAI
from groq import Groq
from app.config import settings


class AIService:
    """Service for AI-powered smart contract analysis"""
    
    def __init__(self):
        self.openai_client: Optional[OpenAI] = None
        self.groq_client: Optional[Groq] = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI clients"""
        if settings.openai_api_key:
            try:
                self.openai_client = OpenAI(
                    api_key=settings.openai_api_key,
                    base_url=settings.openai_base_url
                )
            except Exception as e:
                print(f"Failed to initialize OpenAI client: {e}")
        
        if settings.groq_api_key:
            try:
                self.groq_client = Groq(api_key=settings.groq_api_key)
            except Exception as e:
                print(f"Failed to initialize Groq client: {e}")
    
    async def audit_with_ai(self, source_code: str, contract_name: str = "Contract") -> dict:
        """
        Perform AI-powered audit using OpenAI-compatible API (gpt-oss:20b)
        
        Args:
            source_code: Solidity source code
            contract_name: Name of the contract
        
        Returns:
            dict with AI audit results
        """
        if not self.openai_client:
            return {
                "success": False,
                "error": "OpenAI/GPT-OSS API not configured",
                "analysis": None
            }
        
        try:
            prompt = self._create_audit_prompt(source_code, contract_name)
            
            response = self.openai_client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_auditor_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=4096,
                temperature=0.2
            )
            
            response_text = response.choices[0].message.content
            
            return {
                "success": True,
                "analysis": self._parse_ai_response(response_text),
                "raw_response": response_text,
                "model": settings.openai_model,
                "tokens_used": {
                    "input": response.usage.prompt_tokens,
                    "output": response.usage.completion_tokens
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis": None
            }
    
    async def assist_with_groq(self, vulnerability: str, code_snippet: str = None) -> dict:
        """
        Get AI assistance for understanding vulnerabilities using Groq (fast inference)
        
        Args:
            vulnerability: Description of the vulnerability
            code_snippet: Optional code snippet related to vulnerability
        
        Returns:
            dict with AI assistance response
        """
        if not self.groq_client:
            return {
                "success": False,
                "error": "Groq API not configured",
                "response": None
            }
        
        try:
            prompt = self._create_assist_prompt(vulnerability, code_snippet)
            
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": self._get_assistant_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=2048
            )
            
            response_text = chat_completion.choices[0].message.content
            
            return {
                "success": True,
                "response": response_text,
                "model": "llama-3.3-70b-versatile",
                "tokens_used": {
                    "input": chat_completion.usage.prompt_tokens,
                    "output": chat_completion.usage.completion_tokens
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": None
            }
    
    def _get_auditor_system_prompt(self) -> str:
        """System prompt for smart contract auditing"""
        return """You are an expert smart contract security auditor with extensive experience in:
- Solidity and EVM-based smart contracts
- Common vulnerability patterns (reentrancy, overflow, access control, etc.)
- DeFi protocols and their security considerations
- Best practices for secure smart contract development

Your task is to perform a thorough security audit of the provided smart contract code.

For each vulnerability found, provide:
1. **Severity**: Critical, High, Medium, Low, or Informational
2. **Title**: Brief description of the issue
3. **Location**: File and line numbers if identifiable
4. **Description**: Detailed explanation of the vulnerability
5. **Impact**: What could happen if exploited
6. **Recommendation**: How to fix the vulnerability
7. **Code Fix**: Example code showing the fix (if applicable)

Structure your response as a professional audit report with:
- Executive Summary
- Findings (organized by severity)
- Recommendations
- Conclusion

Be thorough but concise. Focus on actionable security issues rather than code style."""
    
    def _get_assistant_system_prompt(self) -> str:
        """System prompt for AI assistant"""
        return """You are a helpful smart contract security assistant. Your role is to:
- Explain vulnerabilities in simple, understandable terms
- Provide practical advice for fixing security issues
- Share best practices for secure smart contract development
- Answer questions about Solidity security patterns

Be concise, practical, and educational. Always prioritize security best practices.
When providing code examples, ensure they follow security best practices."""
    
    def _create_audit_prompt(self, source_code: str, contract_name: str) -> str:
        """Create prompt for audit request"""
        return f"""Please perform a comprehensive security audit of the following smart contract:

**Contract Name**: {contract_name}

```solidity
{source_code}
```

Analyze for:
1. Reentrancy vulnerabilities
2. Integer overflow/underflow (pre-0.8.0)
3. Access control issues
4. Unchecked external calls
5. Denial of Service vectors
6. Front-running vulnerabilities
7. Logic errors
8. Gas optimization issues
9. Centralization risks
10. Any other security concerns

Provide a detailed audit report with severity ratings and fix recommendations."""
    
    def _create_assist_prompt(self, vulnerability: str, code_snippet: str = None) -> str:
        """Create prompt for assistance request"""
        prompt = f"""I need help understanding and fixing this smart contract vulnerability:

**Vulnerability Description**:
{vulnerability}
"""
        
        if code_snippet:
            prompt += f"""
**Related Code**:
```solidity
{code_snippet}
```
"""
        
        prompt += """
Please provide:
1. A clear explanation of what this vulnerability is
2. Why it's dangerous
3. How to fix it
4. Example of the fixed code (if applicable)
5. Best practices to prevent this in the future"""
        
        return prompt
    
    def _parse_ai_response(self, response: str) -> dict:
        """Parse AI response into structured format"""
        # Simple parsing - could be enhanced with more sophisticated parsing
        sections = {
            "executive_summary": "",
            "critical_findings": [],
            "high_findings": [],
            "medium_findings": [],
            "low_findings": [],
            "informational": [],
            "recommendations": "",
            "conclusion": ""
        }
        
        # Extract sections based on common headers
        current_section = None
        current_content = []
        
        for line in response.split("\n"):
            line_lower = line.lower().strip()
            
            if "executive summary" in line_lower:
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "executive_summary"
                current_content = []
            elif "critical" in line_lower and ("finding" in line_lower or "issue" in line_lower):
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "critical_findings"
                current_content = []
            elif "high" in line_lower and ("finding" in line_lower or "issue" in line_lower):
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "high_findings"
                current_content = []
            elif "medium" in line_lower and ("finding" in line_lower or "issue" in line_lower):
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "medium_findings"
                current_content = []
            elif "low" in line_lower and ("finding" in line_lower or "issue" in line_lower):
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "low_findings"
                current_content = []
            elif "recommendation" in line_lower:
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "recommendations"
                current_content = []
            elif "conclusion" in line_lower:
                if current_section and current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = "conclusion"
                current_content = []
            else:
                if current_section:
                    current_content.append(line)
        
        # Don't forget the last section
        if current_section and current_content:
            sections[current_section] = "\n".join(current_content)
        
        return {
            "parsed": sections,
            "raw": response
        }


# Singleton instance
ai_service = AIService()
