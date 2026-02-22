# Policy Stress Testing Engine

A deterministic fiscal simulation application that leverages dynamic AI extraction to analyze and stress-test public policy documents. This application parses fiscal policies, structures the data, runs mathematical debt and deficit projections, and returns an interactive dashboard displaying warning signals and performance metrics.

---

## 🏗️ Architecture

The platform follows a traditional Client-Server structure:

- **Frontend**: React + Vite application providing the main user interface. Features responsive routing, interactive charts (via Recharts), and native CSS styling reflecting a premium editorial design.
- **Backend API**: Python FastAPI application acting as the logic controller and orchestrator for data processes.
- **Database**: Supabase PostgreSQL database utilized for tracking extracted data points and returning standardized JSON datasets to the frontend.

## 🤖 Modules

### 1. The Analyzer (`extractor.py`)

Responsible for executing real-time document analysis. This module parses uploaded policy documents (PDF, CSV, or Text) and uses an OpenRouter integration (specifically targeting the `openai/gpt-oss-120b:fre` model) to extract crucial fiscal parameters. It strictly returns a structured JSON payload encompassing:

- Spending Commitments
- Revenue Impact
- Lifespan / Duration
- Primary Sector Targets

### 2. The Engine (`simulation.py`)

Responsible for running deterministic math models based on the baseline configuration and the extracted dynamic variables. It performs complex calculations including:

- Continuous compounding interest on debt loads (`P * e^(rt)`).
- Year-over-year nominal deficit escalation tracking.
- Reserve depletion point identification.
- An overarching Risk Categorization assignment based on thresholds.

---

## 🚀 Setting Up the Application

You will require both Node.js (v16+) and Python (3.9+) to run this project smoothly.

### 1. Database Initialization

This application requires an active Supabase project.

1. Create a new Supabase project.
2. In the SQL Editor, execute the contents of the `init_db.sql` file provided in the repository root. This will generate the necessary tables: `policies`, `structured_inputs`, and `simulation_results`.
3. Locate your Supabase URL and anonymous key.

### 2. Backend Configuration

The API leverages the Python FastAPI framework.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the backend directory based on the following variables:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=openai/gpt-oss-120b:fre
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Configuration

The client leverages React via Vite.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the frontend directory based on the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`. You can test the platform utilizing the sample policy pdf file located within `frontend/public/Sample_UBI_Policy.pdf`.
