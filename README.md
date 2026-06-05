<div align="center">

<!-- Logo / Title Block -->
<img src="assets/trackbets-logo.jpg" alt="TrackBets Logo" width="120" />

# TrackBets

### AI-Driven Financial Intelligence Platform

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-00e5ff?style=for-the-badge&logo=vercel&logoColor=black)](https://trackbets.onrender.com)
[![Pitch Deck](https://img.shields.io/badge/📊_Pitch_Deck-7c3aed?style=for-the-badge&logo=googleslides&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <a href="#-overview">Overview</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-tech-stack">Tech Stack</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-key-features">Features</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-getting-started">Getting Started</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-architecture">Architecture</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-roadmap">Roadmap</a>&nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="#-team">Team</a>
</p>

</div>

---

## <img src="https://api.iconify.design/lucide:scan-eye.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Overview

TrackBets is a full-stack financial analysis prototype that bridges the gap between complex market data and retail investor decision-making. By synthesizing simulated market feeds with AI-driven sentiment analysis, TrackBets delivers a clear, actionable **Buy / Sell / Hold** roadmap — all within a premium neon-dark trading interface.

---

## <img src="https://api.iconify.design/lucide:layers.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Tech Stack

| Layer | Technology | Details |
|:------|:-----------|:--------|
| **Frontend** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | High-fidelity **Neon-Dark UI** with Framer Motion, GSAP, Three.js, Recharts |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Python](https://img.shields.io/badge/Python_3.10-3776AB?style=flat-square&logo=python&logoColor=white) | Hosted on Render · async-first architecture · Uvicorn ASGI |
| **AI Engine** | ![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=googlegemini&logoColor=white) | Financial reasoning, sentiment synthesis, and verdict generation |
| **Data** | ![TwelveData](https://img.shields.io/badge/TwelveData-FF6B00?style=flat-square) ![DuckDuckGo](https://img.shields.io/badge/DuckDuckGo_Search-DE5833?style=flat-square&logo=duckduckgo&logoColor=white) | Hybrid: live market feeds + simulated data for demo stability |
| **DevOps** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black) | Containerized full-stack deployment with multi-stage build |

---

## <img src="https://api.iconify.design/lucide:sparkles.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Key Features

<table>
<tr>
<td width="50%">

### <img src="https://api.iconify.design/lucide:activity.svg?color=%237c3aed&width=20&height=20" /> Dynamic Analysis
Process any ticker (e.g. `ZOMATO.NS`, `TSLA`) through a multi-step financial reasoning engine that evaluates fundamentals, technicals, and sentiment signals.

</td>
<td width="50%">

### <img src="https://api.iconify.design/lucide:wand-sparkles.svg?color=%237c3aed&width=20&height=20" /> Strategy Wizard
User-driven workflow to define entry targets, investment timeframes, and risk tolerance — from Quick Scalp to Long-Term Hold.

</td>
</tr>
<tr>
<td width="50%">

### <img src="https://api.iconify.design/lucide:radar.svg?color=%237c3aed&width=20&height=20" /> Sentiment Synthesis
Aggregates news headlines and social media trends via DuckDuckGo Search to provide a real-time **Market Pulse** percentage score.

</td>
<td width="50%">

### <img src="https://api.iconify.design/lucide:scale.svg?color=%237c3aed&width=20&height=20" /> Actionable Verdicts
Delivers a final **Buy / Sell / Hold** recommendation with a full AI-generated explanation of the reasoning chain.

</td>
</tr>
</table>

---

## <img src="https://api.iconify.design/lucide:terminal.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Getting Started

### Prerequisites

| Tool | Version |
|:-----|:--------|
| Node.js | `≥ 20.x` |
| Python | `≥ 3.10` |
| npm | `≥ 10.x` |

### 1 — Clone the repository

```bash
git clone https://github.com/Arthrevs/TrackBets.git
cd TrackBets
```

### 2 — Backend setup

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### 3 — Frontend setup

```bash
cd frontend
npm install
```

### 4 — Run locally

```bash
# Terminal 1 — Start the backend
uvicorn api.backend.main:app --reload --port 8000

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

> **Open** [http://localhost:5173](http://localhost:5173) in your browser.

### 5 — Docker (alternative)

```bash
docker build -t trackbets .
docker run -p 10000:10000 --env-file .env trackbets
```

---

## <img src="https://api.iconify.design/lucide:network.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │  Neon-Dark │  │  Strategy  │  │  Recharts /      |   │
│  │  Landing   │  │  Wizard    │  │  Three.js Viz    │   │
│  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘   │
│        └───────────────┼──────────────────┘             │
│                        │  Axios HTTP                    │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌────────────────────────┼────────────────────────────────┐
│                   FastAPI  (Uvicorn ASGI)               │
│  ┌─────────────┐  ┌───┴────────┐  ┌─────────────────┐   │
│  │  /analyze   │  │  brain.py  │  │  scrapers.py    │   │
│  │  endpoint   │──│  AI Logic  │──│  News & Data    │   │
│  └─────────────┘  └─────┬──────┘  └─────────────────┘   │
│                         │                               │
│                         ▼                               │
│               ┌─────────────────┐                       │
│               │  Google Gemini  │                       │
│               │  LLM API        │                       │
│               └─────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## <img src="https://api.iconify.design/lucide:folder-tree.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Project Structure

```
TrackBets/
├── api/
│   └── backend/
│       ├── main.py            # FastAPI application & routes
│       ├── brain.py           # AI reasoning engine
│       ├── gemini_client.py   # Google Gemini LLM integration
│       └── scrapers.py        # News & market data scrapers
├── frontend/
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client layer
│   │   ├── App.jsx            # Root application
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Dockerfile                 # Multi-stage container build
├── requirements.txt           # Python dependencies
└── .env                       # Environment variables (git-ignored)
```

---

## <img src="https://api.iconify.design/lucide:map.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Roadmap

| Phase | Milestone | Status |
|:------|:----------|:------:|
| **v1.0** | Core AI verdict engine + Neon-Dark UI | ✅ Done |
| **v1.1** | Live API integration (Polygon.io / Zerodha Kite) | 🔜 Next |
| **v1.2** | Portfolio tracking — real-time P&L via brokerage APIs | 📋 Planned |
| **v2.0** | Custom ML models for technical indicator prediction | 📋 Planned |
| **v2.1** | Mobile-responsive PWA with push notifications | 📋 Planned |

---

## <img src="https://api.iconify.design/lucide:users.svg?color=%2300e5ff&width=24&height=24" alt="icon" /> Team

<table>
<tr>
<td align="center" width="33%">
<br/>
<img src="https://api.iconify.design/lucide:server.svg?color=%2300e5ff&width=48&height=48" /><br/>
<strong>Arindam Nath</strong><br/>
<sub>Backend Architect & AI Integration</sub><br/><br/>
<sub>Engineered the FastAPI infrastructure and integrated the Gemini-based LLM reasoning pipeline.</sub>
</td>
<td align="center" width="33%">
<br/>
<img src="https://api.iconify.design/lucide:palette.svg?color=%237c3aed&width=48&height=48" /><br/>
<strong>Debanga Shivam</strong><br/>
<sub>Lead Frontend Engineer & UI/UX</sub><br/><br/>
<sub>Designed the high-fidelity React interface, Neon-Dark theme system, and Strategy Wizard workflow.</sub>
</td>
<td align="center" width="33%">
<br/>
<img src="https://api.iconify.design/lucide:brain-circuit.svg?color=%2322c55e&width=48&height=48" /><br/>
<strong>Meghank Sanjib Dutta</strong><br/>
<sub>Data Scientist & Financial Analyst</sub><br/><br/>
<sub>Specialized in sentiment analysis parameters and financial logic validation of the verdict engine.</sub>
</td>
</tr>
</table>

---

<div align="center">

<img src="https://api.iconify.design/lucide:heart.svg?color=%23ef4444&width=16&height=16" />

**Built with precision during hackathon crunch time.**

<sub>Made with React · FastAPI · Google Gemini · Vite · Three.js</sub>

</div>
