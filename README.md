# ⚡ Professional Financial Intelligence Suite (PFIS)

![PFIS Fiduciary AI Suite](https://img.shields.io/badge/Status-Live_Production-32c954?style=for-the-badge)
![Claude 3.5 Sonnet](https://img.shields.io/badge/AI_Engine-Claude_3.5_Sonnet-f5c800?style=for-the-badge&logo=anthropic&logoColor=black)
![React 19](https://img.shields.io/badge/Framework-React_19_Vite-0a0a0a?style=for-the-badge&logo=react)
![Theme](https://img.shields.io/badge/UI-Neo--Brutalism-0a0a0a?style=for-the-badge)

PFIS is a fully-client-side, high-performance financial operating system designed to elevate beyond basic "budgeting apps." Built entirely on the principles of **Modern Portfolio Theory (MPT)** and **Actuarial Science**, PFIS provides zero-knowledge, mathematically optimized strategies for wealth generation and risk mitigation.

Designed with a high-contrast **White & Yellow Neo-Brutalism** tokenized CSS architecture.

---

## 🔥 Key Intelligence Modules

### 1. Fiduciary AI Advisor (Client-Side RAG)
An elite AI advisor powered by **Claude 3.5 Sonnet (via OpenRouter)**. Instead of raw API queries, the system uses a **Retrieval-Augmented Generation (RAG)** pipeline to inject your personal financial context (tax brackets, portfolio composition, debt load, and cash flow constraints) securely into the context window, resulting in hyper-personalized, mathematically sound fiduciary guidance. *Includes strict prompt shielding against emotional or non-mathematical optimization.*

### 2. Monte Carlo Sequence of Returns Risk (SORR) Engine
A true 1,000-iteration Monte Carlo simulation engine utilizing a Box-Muller normal distribution sampling algorithm. 
- Models 30+ year horizons with custom Safe Withdrawal Rates (SWR).
- Plots **Confidence Intervals** (10th, 50th, 90th percentiles).
- Specifically models **Sequence of Returns Risk** by stress-testing historical market plunges (e.g., 2008 GFC, 1970s stagflation) in the critical first 3 years of retirement.

### 3. Debt Arbitrage Matrix
Compares your specific weighted debt interest rates against expected market yields. Because all logic is actuarial-grade, it factors in your **Marginal Tax Rate** to calculate the *True After-Tax Yield*, generating actionable "Invest vs. Pay Debt" directives with mathematical precision.

### 4. Dynamic Cash Flow Waterfall
A 10-step visualized allocation waterfall tracking the velocity of your capital. Automatically models the timeline required to reach a 6-month Emergency Fund target, while tracking your real-time Debt-to-Income (DTI) ratio.

### 5. Tax-Drag Asset Locator
Simulates the 30-year compounding drag of taxes based on asset location (Taxable vs. Roth vs. Traditional IRA). Recommends optimal asset-shifting (e.g., placing high-yield REITs in Roth accounts) to salvage hundreds of thousands in structural wealth erosion.

---

## 🏗️ Architecture & Security 

### Zero-Knowledge Protocol
For a tool to be professional, it must treat data with bank-level sovereignty.
- **Local-First Processing:** All Monte Carlo simulations and Matrix calculations occur strictly in the browser. 
- **Encryption:** Ready for Web Crypto API (AES-256) master key encryption for storing state.
- **Stateless Operation:** No vulnerable bank APIs or Plaid hooks. 

### Technology Stack
- **Frontend Core:** React 19 + TypeScript + Vite.
- **Styling:** Custom CSS Grid Neo-Brutalist library (no Tailwind bloated utility classes).
- **Visualization:** Recharts for high-density actuarial fan charts.
- **AI Processing:** OpenRouter REST API integration.

---

## 🚀 Deployment

The project is structured to deploy anywhere in seconds, perfectly configured for **Serverless Edge Environments**.

### 1. Google Cloud Run (Dockerized)
The repository contains a multi-stage production `Dockerfile` (Node 20 + Nginx).
```bash
gcloud run deploy pfis-app --source . --region us-central1 --allow-unauthenticated
```
### 2. GitHub Pages (Current Live Demo)
Automatic static deployment handled directly through GitHub.
```bash
npm run build
npx gh-pages -d dist
```

### 3. Vercel (Edge Network)
Instant zero-config hosting.
```bash
npx vercel --prod
```

## 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/ashwin8332/PromptWars.git pfis-app
cd pfis-app

# Install dependencies
npm install

# Start local server
npm run dev
```

> **Note on OpenRouter API:** To test the AI Advisor module locally, supply your own OpenRouter API Key for `Anthropic/Claude-3.5-Sonnet` in the environment configuration. No billing or backend endpoints are required.
