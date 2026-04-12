# ⚡ Professional Financial Intelligence Suite (PFIS)

![Status: Live Production](https://img.shields.io/badge/Status-Live_Production-32c954?style=for-the-badge)
![AI Engine: Claude 3.5 Sonnet](https://img.shields.io/badge/AI_Engine-Claude_3.5_Sonnet-f5c800?style=for-the-badge&logo=anthropic&logoColor=black)
![Framework: React 19](https://img.shields.io/badge/Framework-React_19_Vite-0a0a0a?style=for-the-badge&logo=react)
![Theme: Neo-Brutalism](https://img.shields.io/badge/UI-Neo--Brutalism_Animations-0a0a0a?style=for-the-badge)

PFIS is a fully client-side, high-performance financial operating system designed to elevate beyond basic "budgeting apps." Built entirely on the principles of **Modern Portfolio Theory (MPT)** and **Actuarial Science**, PFIS provides zero-knowledge, mathematically optimized strategies for wealth generation and risk mitigation.

Featuring a premium **White & Yellow Neo-Brutalist** UI with fluid micro-animations powered by **Framer Motion** and **GSAP**.

---

## 🚀 Key Intelligence Modules

### 1. 🧠 Voice-Enabled Fiduciary AI Advisor (Client-Side RAG)
An elite AI advisor powered by **Claude 3.5 Sonnet (via OpenRouter)**. 
- **Dynamic Context:** Uses a Retrieval-Augmented Generation (RAG) pipeline to securely inject your personal financial context (tax brackets, portfolio composition, debt load).
- **Voice Integration:** Speak directly to the unified AI assistant for hands-free financial analysis.
- **Fiduciary Strictness:** Shielded against emotional optimization; strictly mathematical reasoning.

### 2. 🎲 Monte Carlo Sequence of Returns Risk (SORR) Engine
A true 1,000-iteration Monte Carlo simulation engine utilizing a Box-Muller normal distribution sampling algorithm. 
- Models 30+ year horizons with custom Safe Withdrawal Rates (SWR).
- Plots **Confidence Intervals** (10th, 50th, 90th percentiles).
- Models **Sequence of Returns Risk** by stress-testing historical market plunges (e.g., 2008 GFC, 1970s stagflation) in early retirement years.

### 3. ⚖️ Debt Arbitrage Matrix
Compares your specific weighted debt interest rates against expected market yields. 
- Factors your **Marginal Tax Rate** to calculate the *True After-Tax Yield*.
- Generates actionable "Invest vs. Pay Debt" directives with mathematical edge precision.

### 4. 🌊 Dynamic Cash Flow Waterfall
A ten-step visualized allocation waterfall tracking the velocity of your capital. 
- Automatically models timeframe required to reach a 6-month Emergency Fund target.
- Real-time Debt-to-Income (DTI) ratio tracking.

### 5. 📉 Tax-Drag Asset Locator
Simulates the 30-year compounding drag of taxes based on asset location (Taxable vs. Roth vs. Traditional IRA).
- Recommends optimal asset-shifting (e.g., placing high-yield REITs in Roth accounts).
- Avoid hundreds of thousands in structural wealth erosion.

### 6. 📚 Financial Education Center
A curated learning environment transitioning users from fundamental financial concepts (emergency funds, 50/30/20 budget) to advanced actuarial concepts (Efficient Frontier, Sharpe ratios).

---

## 🏗️ Architecture & Security 

### 🔐 Zero-Knowledge Protocol
Treats data with bank-level sovereignty.
- **Local-First Processing:** All Monte Carlo simulations and Matrix calculations occur strictly in the browser. 
- **Encryption:** Ready for Web Crypto API (AES-256) master key encryption for storing state.
- **Stateless Operation:** No vulnerable bank APIs or Plaid hooks. 

### ⚙️ Technology Stack
- **Frontend Core:** React 19 + TypeScript + Vite.
- **Styling & Animation:** Custom CSS Grid Neo-Brutalism + Framer Motion + GSAP.
- **Visualization:** Recharts for high-density actuarial fan charts.
- **AI Processing:** OpenRouter REST API integration.

---

## ☁️ Deployment

Deploy anywhere in seconds, configured for **Serverless Edge Environments**.

### 1. Google Cloud Run (Dockerized)
The repository contains a multi-stage production `Dockerfile` (Node 20 + Nginx).
```bash
gcloud run deploy pfis-app --source . --region us-central1 --allow-unauthenticated
```
### 2. GitHub Pages (Current Live Demo)
Automatic static deployment handled directly through GitHub via automated workflows.
```bash
npm run build
npx gh-pages -d dist
```

### 3. Vercel (Edge Network)
Instant zero-config hosting.
```bash
npx vercel --prod
```

---

## 🛠️ Local Development

Follow these steps to run the application logically on your machine:

```bash
# Clone repository
git clone https://github.com/ashwin8332/PromptWars.git pfis-app
cd pfis-app

# Install dependencies
npm install

# Start local server
npm run dev
```

> **Note on OpenRouter API:** To test the AI Advisor module locally, supply your own OpenRouter API Key for `Anthropic/Claude-3.5-Sonnet` in the environment configuration (`.env`). Create a `.env` file and set `VITE_OPENROUTER_API_KEY=your_key`.
