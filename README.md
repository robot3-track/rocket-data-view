# 🌌 NASA Open-Data Analytics Workspace

A professional-grade telemetry and data visualization dashboard built for the **Hack Club Stardance Challenge**. This application ingests live open-source data from NASA's public APIs, parses complex datasets, and renders them into actionable business intelligence charts and telemetry tables. 

Built using **Vite**, **React**, and **TypeScript**, and fully optimized for continuous deployment on **Vercel**.

---

## 🚀 Features

- **Live NASA API Ingestion:** Direct integration with public space data endpoints (Near-Earth Objects, Space Weather, and Mars Weather).
- **Interactive Telemetry Charts:** Multi-axis charting built with responsive React visualization libraries to track trends and anomalies.
- **Enterprise Data Management:** Clean data grids featuring advanced filtering, pagination, and single-click **CSV data exports**.
- **Secure Secret Handling:** Full abstraction of API credentials using Vite environment variables to prevent token leakage on GitHub.
- **Production-Ready UI:** Responsive, high-fidelity Tailwind CSS dark-mode dashboard designed to mimic real aerospace mission control centers.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Component Engine:** Radix UI / Shadcn
- **Deployment Platform:** Vercel

---

## 💻 Local Development Setup

To run this workspace locally on your machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com
cd YOUR_REPO_NAME
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
1. Get a free API key instantly from the [NASA API Portal](https://nasa.gov).
2. Create a `.env` file in the root directory of your project.
3. Add your key to the file exactly like this:
```env
VITE_NASA_API_KEY=your_actual_nasa_api_key_here
```

### 4. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the workspace.

---

## 🌐 Deploying to Vercel

This repository is structured to compile flawlessly under Vercel's strict build environment rules.

1. Go to your [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
2. Import this GitHub repository.
3. Expand the **Environment Variables** dropdown section.
4. Add the following key-value pair:
   - **Key:** `VITE_NASA_API_KEY`
   - **Value:** *[Your NASA API Key]*
5. Click **Deploy**. Vercel will build and host your application live in under 60 seconds.

---

## 🤝 Acknowledgments

- **Hack Club Stardance** for hosting the summer engineering sprint.
- **NASA** for providing open telemetry access to the public.
