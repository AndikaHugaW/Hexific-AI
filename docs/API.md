# 📚 Hexific API Documentation

## Overview

Hexific is an AI-powered smart contract security auditing platform. This documentation covers all available API endpoints.

**Base URL:** `http://localhost:8000` (development) or your production URL

---

## Authentication

Currently, the API uses IP-based rate limiting for free tier. Premium features require wallet address verification.

### Rate Limits

| Tier | Limit | Window |
|------|-------|--------|
| Free | 3 requests | 24 hours |
| Pro | Unlimited | - |

---

## Endpoints

### Health Check

#### GET /
Returns API information.

**Response:**
```json
{
  "name": "Hexific Smart Contract Audit API",
  "version": "1.0.0",
  "endpoints": {
    "audit": "/audit",
    "ai_assist": "/ai-assist",
    "docs": "/docs"
  }
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "hexific-api"
}
```

---

### Audit Endpoints

#### POST /audit/
Upload a ZIP file for Slither analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (ZIP file containing Solidity files)

**Response:**
```json
{
  "success": true,
  "audit_type": "slither",
  "tier": "free",
  "rate_limit": {
    "remaining": 2,
    "limit": 3
  },
  "results": {
    "files_analyzed": ["Contract.sol"],
    "vulnerabilities": [
      {
        "id": "reentrancy-eth",
        "title": "Reentrancy",
        "severity": "high",
        "confidence": "high",
        "description": "...",
        "locations": [
          {
            "file": "Contract.sol",
            "lines": [45, 46, 47],
            "type": "function",
            "name": "withdraw"
          }
        ]
      }
    ],
    "summary": {
      "total": 1,
      "by_severity": {
        "high": 1,
        "medium": 0,
        "low": 0,
        "informational": 0
      }
    }
  }
}
```

**Error Responses:**
- `400`: Invalid file format
- `429`: Rate limit exceeded
- `422`: Analysis failed

---

#### POST /audit/address-ui
Audit a verified contract by address (Free Tier).

**Request:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "network": "mainnet"
}
```

**Supported Networks:**
- `mainnet` - Ethereum Mainnet
- `polygon` - Polygon
- `arbitrum` - Arbitrum One
- `optimism` - Optimism
- `bsc` - BNB Smart Chain
- `base` - Base
- `sepolia` - Sepolia Testnet

**Response:**
```json
{
  "success": true,
  "audit_type": "ai",
  "tier": "free",
  "rate_limit": {
    "remaining": 2,
    "limit": 3
  },
  "contract": {
    "address": "0x...",
    "network": "mainnet",
    "name": "MyContract",
    "compiler": "v0.8.19",
    "is_proxy": false
  },
  "results": {
    "analysis": {
      "parsed": {...},
      "raw": "..."
    },
    "raw_response": "AI audit report text..."
  }
}
```

---

#### POST /audit/pro
Premium AI audit with source code (Paid Tier).

**Request:**
```json
{
  "source_code": "pragma solidity ^0.8.0; ...",
  "contract_name": "MyContract"
}
```

---

#### POST /audit/address
Comprehensive audit by address (Paid Tier).

**Request:**
```json
{
  "address": "0x...",
  "network": "mainnet",
  "wallet_address": "0x..." 
}
```

**Response includes both Slither and AI analysis.**

---

### AI Assistant Endpoints

#### POST /ai-assist/
Get AI assistance for understanding vulnerabilities.

**Request:**
```json
{
  "vulnerability": "Reentrancy vulnerability in withdraw function",
  "code_snippet": "function withdraw() public { ... }",
  "context": "This is a DeFi lending protocol"
}
```

**Response:**
```json
{
  "success": true,
  "tier": "free",
  "rate_limit": {
    "remaining": 2,
    "limit": 3
  },
  "response": "A reentrancy attack occurs when...",
  "model": "llama-3.1-70b-versatile"
}
```

---

#### POST /ai-assist/chat
General chat for security questions.

**Request:**
```json
{
  "message": "What are common DeFi vulnerabilities?",
  "history": []
}
```

---

#### GET /ai-assist/status
Check rate limit status.

**Response:**
```json
{
  "success": true,
  "service": "ai-assist",
  "status": "operational",
  "rate_limit": {
    "remaining": 3,
    "used": 0,
    "limit": 3,
    "allowed": true
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": {
    "error": "Error type",
    "message": "Human-readable message"
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 402 | Payment Required |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Examples

### cURL - Audit by Address

```bash
curl -X POST "http://localhost:8000/audit/address-ui" \
  -H "Content-Type: application/json" \
  -d '{"address": "0xdAC17F958D2ee523a2206206994597C13D831ec7", "network": "mainnet"}'
```

### cURL - Ask AI

```bash
curl -X POST "http://localhost:8000/ai-assist/" \
  -H "Content-Type: application/json" \
  -d '{"vulnerability": "What is a flash loan attack?"}'
```

### JavaScript

```javascript
const response = await fetch('http://localhost:8000/audit/address-ui', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'mainnet',
  }),
});

const result = await response.json();
console.log(result);
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:8000/audit/address-ui',
    json={
        'address': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'network': 'mainnet',
    }
)

result = response.json()
print(result)
```

---

## SDK / Client Libraries

### CLI Tool

```bash
# Install
npm install -g hexific-cli

# Audit by address
hexific audit-address 0x... --network mainnet

# Ask AI
hexific ask "What is reentrancy?"
```

See [CLI Documentation](./client/README.md) for more details.

---

## Contact

- Website: https://hexific.io
- Twitter: @hexific
- Email: support@hexific.io
