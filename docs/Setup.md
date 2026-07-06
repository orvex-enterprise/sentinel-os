# Sentinel OS — Setup & Local Development Guide

> **Document Class:** Technical Setup Guide  
> **Status:** Authoritative  
> **Target Audience:** Developers, DevOps Engineers, Hackathon Judges

---

## ⚡ Option 1: 60-Second Turnkey Docker Setup (Recommended)

The fastest way to experience Sentinel OS is via our turnkey Docker Compose environment. This starts PostgreSQL (with `pgvector`), Redis, API Gateway, LangGraph Orchestration, Turnkey Simulator, and React Dashboard in isolated containers.

### 1. Prerequisites
- **Docker Desktop** (v4.20+ with Docker Compose v2+)
- **Git**

### 2. Clone & Configure
```bash
# Clone repository
git clone https://github.com/sentinel-os/sentinel-os.git
cd sentinel-os

# Copy sample environment variables
cp example.env .env
```

### 3. Launch Stack
```bash
# Build and start all 6 microservices in background
docker compose -f infra/docker-compose.yml up --build -d
```

### 4. Verify Container Health
```bash
# Check container health status
docker compose -f infra/docker-compose.yml ps
```
You should see all containers reporting `Up (healthy)` or `Up`:
- `sentinel-postgres` (Port `5432`)
- `sentinel-redis` (Port `6379`)
- `sentinel-api-gateway` (Port `4000`)
- `sentinel-orchestration` (Port `5000`)
- `sentinel-dashboard` (Port `3000`)
- `sentinel-simulator` (Background generator)

👉 **Open your browser to [http://localhost:3000](http://localhost:3000) to access Mission Control!**

---

## 🛠️ Option 2: Local Development Setup (Manual Monorepo)

For developers wishing to modify code or run services individually outside Docker.

### 1. Prerequisites
- **Node.js** (v20.0.0+ required per [package.json](../package.json))
- **pnpm** (v9.0.0+ required: `npm install -g pnpm`)
- **Python** (v3.11+ required)
- **Poetry / pip** for Python dependency management
- **PostgreSQL 16** (with `pgvector` extension installed locally or via Docker)
- **Redis 7**

### 2. Install Monorepo Dependencies
```bash
# Install Node.js workspace dependencies (root, schemas, api-gateway, dashboard)
pnpm install

# Build TypeScript schemas and generate JSON Schema for Python
pnpm build
```

### 3. Set Up Python Environment (Orchestration & Simulator)
```bash
# Navigate to orchestration service
cd services/orchestration
pip install -r requirements.txt

# Navigate to simulator
cd ../../ai/simulator
pip install -r requirements.txt
cd ../..
```

### 4. Configure Local Environment Variables
Create `.env` files in each service directory using our provided templates:
```bash
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/orchestration/.env.example services/orchestration/.env
cp ai/simulator/.env.example ai/simulator/.env
```

### 5. Run Database Migrations & Seeding
If running Postgres locally outside Docker, execute the SQL seed scripts:
```bash
psql -U sentinel -d sentinel_db -f infra/seed/01_schema.sql
psql -U sentinel -d sentinel_db -f infra/seed/02_triggers.sql
psql -U sentinel -d sentinel_db -f infra/seed/03_seed_data.sql
psql -U sentinel -d sentinel_db -f infra/seed/inventory_seed.sql
```

### 6. Start Development Servers (Terminal by Terminal)

**Terminal 1: API Gateway (Port 4000)**
```bash
cd services/api-gateway
pnpm dev
```

**Terminal 2: LangGraph Orchestration Engine (Port 5000)**
```bash
cd services/orchestration
python main.py
```

**Terminal 3: Mission Control Dashboard (Port 3000)**
```bash
cd apps/dashboard
pnpm dev
```

**Terminal 4: Turnkey Event Simulator (Optional)**
```bash
cd ai/simulator
python event_generator.py --mode auto
```

---

## 🤖 LLM Configuration & Zero-Cost Strategy (DEV-001)

Sentinel OS supports three LLM execution modes configured via `LLM_PROVIDER` in `services/orchestration/.env`:

### Mode 1: Local Ollama (Zero-Cost Default)
Runs completely offline without API keys or cloud costs.
1. Install Ollama from [https://ollama.com](https://ollama.com).
2. Pull the required model:
   ```bash
   ollama pull llama3
   ```
3. Set `LLM_PROVIDER=ollama` and `OLLAMA_MODEL=llama3` in `.env`.

### Mode 2: Cloud LLM (OpenAI / Groq)
For enterprise cloud inference with ultra-low latency.
1. Set `LLM_PROVIDER=openai` (or `groq`) in `.env`.
2. Add your API key: `OPENAI_API_KEY=sk-...` (or `GROQ_API_KEY=gsk_...`).

### Mode 3: Deterministic Mock Mode (Hackathon Fallback)
If network access is unavailable or LLM APIs rate-limit during a live demo, set:
```env
LLM_PROVIDER=mock
```
In this mode, the orchestration engine returns instant, pre-computed, highly realistic JSON reasoning and remediation plans for Scenarios A, B, and C with zero latency and 100% reliability!

---

## ❓ Troubleshooting & Common Issues

- **Port Conflicts (3000, 4000, 5000, 5432, 6379):** Ensure no local Postgres, Redis, or web servers are occupying these ports before running `docker compose up`.
- **Windows Bash Errors on `npm run validate-schemas`:** If running on Windows PowerShell without Git Bash, run `cd packages/schemas && npm run build` directly.
- **Docker Memory Limits:** Ensure Docker Desktop is allocated at least **4GB RAM** and **2 CPUs** for smooth pgvector and LangGraph execution.
