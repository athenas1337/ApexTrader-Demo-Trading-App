# ApexTrader - Crypto & Forex Demo Trading Web Application (VST Engine)

A high-performance, secure, local Demo Trading Web Application featuring real-time TradingView Advanced Charting, a Virtual Seed Token (VST) trading engine with leverage and dynamic floating PnL, CoinGecko fundamental analysis, and strict web application security hardening.

![ApexTrader Demo](public/favicon.svg)

---

## Key Features

- **TradingView Advanced Charting Engine**: Real-time interactive charts supporting technical indicators (RSI, Moving Averages, MACD), timeframes, and drawing tools.
- **Supported Trading Assets**:
  - **Crypto**: BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT, XRP/USDT, ADA/USDT, DOGE/USDT.
  - **Forex**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF.
- **VST (Virtual USDT) Trading Engine**:
  - Starts every guest session with an initial balance of **10,000 VST**.
  - Open & Close **Long (Buy)** and **Short (Sell)** positions with Market or Limit orders.
  - Adjustable Leverage (**1x to 100x**), Take-Profit (TP), Stop-Loss (SL), and liquidation pricing.
  - Continuous real-time **Floating PnL** updates powered by live Binance WebSocket streams and market tickers.
- **VST Top-Up System**:
  - Supports typing custom VST amounts from **100 VST up to 100,000 VST**.
  - Quick-preset buttons (+100, +1,000, +5,000, +10,000, +100,000 VST).
- **Crypto Fundamental Analysis**:
  - Integrated with CoinGecko REST data schema for Market Cap, Rank, 24h Volume, Circulating Supply, ATH stats, and Tokenomics breakdown.
- **Zero Real Financial Risk & Guest Privacy**:
  - 100% simulated trading with zero real money deposit requirement.
  - Local storage persistence retains guest trade history, active positions, and wallet balance across page reloads without requiring user login.

---

## Security & Architecture Hardening

- **XSS & Input Sanitization**: All custom amounts, order pricing, and position specifications undergo strict type validation and state sanitization.
- **Production Headers (`netlify.toml`)**:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **No Hardcoded Secrets**: Uses `.env.example` configuration structure.

---

## Local Development & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation
```bash
# 1. Clone or navigate to directory
cd "Demo Trading CryptoXForex"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## Step-by-Step GitHub & Netlify Deployment Guide

### Step 1: Push Project to GitHub

1. Initialize Git repository and commit files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Demo Trading Web Application (VST Engine)"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Connect your local repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

### Step 2: Host on Netlify

1. Log into your [Netlify Console](https://app.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** as your Git provider and authorize Netlify.
4. Choose your `Demo Trading CryptoXForex` repository.
5. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Click **Deploy Site**. Your application will be live with a secure HTTPS custom domain!

---

## License

MIT License - Free for demo, educational, and commercial usage.
