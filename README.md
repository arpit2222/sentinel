# 🛡️ Sentinel

**Sentinel** is an autonomous, AI-driven liquidation protection agent secured by Smart Accounts. It bridges the gap between the lightning-fast execution of Artificial Intelligence and the trustless security of Web3. 

Built for the Hackathon, Sentinel acts as a 24/7 bodyguard for your DeFi lending positions. It monitors market volatility and autonomously executes debt repayments during extreme flash crashes, saving your collateral from liquidation—**without ever requiring your private keys.**

![Sentinel Dashboard Overview](https://sentinel-seven-tau.vercel.app/og-image.png) *(Note: Replace with actual screenshot link if available)*

---

## ⚠️ The Problem

In DeFi, sleeping can be expensive. If the market crashes overnight, your over-leveraged positions get liquidated. 

The current solution is to run a trading bot. However, handing your private keys or unrestricted wallet access over to an AI agent is terrifying and goes against the ethos of Web3. We need the speed of AI, but we need it strictly contained within mathematically enforced cryptographic boundaries.

---

## 💡 The Solution

Sentinel solves this by combining **Venice AI inference** with the **ERC-7715 Smart Account Delegation** standard on the **Base** network.

1. **Seedless Onboarding:** You create a Smart Contract Wallet using a Biometric Passkey (Face ID/Fingerprint). No seed phrases.
2. **Cryptographic Leashes (ERC-7715):** You grant the Sentinel AI *extremely narrow, temporary* permissions. The AI can *only* execute a debt repayment on Aave, up to a specific dollar limit. It cannot physically transfer your funds anywhere else.
3. **AI Brain (Venice AI):** Sentinel constantly monitors your health factor. When volatility spikes, it queries Venice AI to analyze the risk. If the AI determines a rescue is necessary, it authorizes the transaction.
4. **Gasless Execution:** The 1Shot Relayer executes the transaction on the Base network using a Paymaster to sponsor the gas, meaning the rescue works even if you hold zero ETH.

---

## 🏗️ Technical Architecture & Tech Stack

Sentinel is a full-stack Web3 application divided into a responsive Next.js frontend, a robust Node.js monitoring backend, and a suite of smart contracts.

### Frontend
- **Framework:** Next.js (React), TypeScript
- **Styling:** Tailwind CSS (Custom glass-morphism aesthetic)
- **Icons:** Lucide-React
- **Authentication:** 1Shot Passkeys (WebAuthn for seedless login)

### Backend
- **Runtime:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose) for storing User Configurations and the Universal Agent Directory.
- **AI Inference:** Venice AI API (for risk scoring, log generation, and evaluating community-submitted agents).
- **Execution:** Node Cron jobs running 24/7 to simulate market monitoring and trigger the 1Shot Relayer for transaction execution.

### Blockchain & Smart Contracts (Deployed on Base)
- **Account Abstraction (ERC-4337):** 1Shot Smart Account Factory deploys deterministic biometric wallets.
- **Delegation (ERC-7715):** The Sentinel Router contract acts as the secure permission target.
- **Gas Sponsorship:** 1Shot Paymaster.
- **DeFi Protocol:** Aave V3 Lending Pool.

---

## 🌟 Key Features

- **Biometric Login:** Instant, seedless wallet creation.
- **Live Monitoring Dashboard:** Real-time LTV (Loan-to-Value) tracking with simulated crash testing ("Seed Demo" button).
- **ERC-7715 Control Center:** A highly visual settings page where users can manage their exact delegation budgets, Auto-Repay toggles, and preferred stablecoins.
- **Universal AI Agent Directory:** A community-curated "Yelp" for Web3 bots. Users can submit new AI agents (Strategy, Security, Trading), and the community can leave 1-5 star reviews and feedback. Venice AI automatically evaluates all submitted agents and assigns them a Risk Score.

---

## 🚀 Local Setup & Installation

To run this project locally, you will need Node.js and MongoDB installed.

### 1. Clone the Repository
```bash
git clone https://github.com/arpit2222/sentinel.git
cd sentinel
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sentinel
VENICE_API_KEY=your_venice_ai_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
Start the frontend server:
```bash
npm run dev
```

### 4. Seed the Database
Once both servers are running, navigate to `http://localhost:3000/whitelist`. Click the **"Sync Venice AI Ratings"** button to populate the database with mock protocols and community agents.

---

## 🤝 Contributing

This project was built during a Hackathon. We welcome PRs, bug reports, and suggestions from the community!

## 📜 License

MIT License. See `LICENSE` for more information.
