# 🔐 Hexific - Smart Contract Audit Platform

A comprehensive SaaS platform for auditing Ethereum/Solidity smart contracts using static analysis (Slither) and AI (Claude API & Groq).

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│   (Next.js)     │     │  (Python/FastAPI)│     │   (Supabase)    │
│    Vercel       │     │      VPS        │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
hexific-ai/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities & API clients
│   │   └── styles/    # CSS files
│   └── package.json
│
├── backend/           # Python FastAPI server
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── services/  # Business logic
│   │   └── utils/     # Helper functions
│   ├── requirements.txt
│   └── main.py
│
└── client/            # CLI tool
    └── client.js
```

## 🔑 Features

### Free Tier
- **Audit by ZIP**: Upload smart contract source code as ZIP
- **Audit by Address**: Fetch verified contracts from Etherscan
- **AI Assistant**: Ask questions about vulnerabilities (3x free/day)

### Paid Tier
- Unlimited AI-powered audits
- Priority processing
- Advanced vulnerability detection

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📄 License
MIT License
