# 🛰️ NASA Mission Analytics Workspace

![Workspace Image](./Nebula%20Insights%20(1).png)

A lightweight telemetry dashboard for parsing and visualizing data from diverse NASA API endpoints. Monitor planetary conditions, track near-Earth objects, and review space weather anomalies from a single workspace.

---

## 🚀 Core Features

* **Multi-Stream Data Ingestion:** Source switching between four live NASA datasets: Near-Earth Objects (NEO), Mars InSight weather archives, APOD metadata, and DONKI space weather alerts.
* **Anomaly Auditing:** Flags hazardous asteroids, tracks solar flare signatures ($M$-class/$X$-class), and isolates critical events.
* **Fallback Subsystem:** Embedded simulation layers to mimic live streams or replay historical data arrays when external endpoints throttle requests.
* **Clean Theme Architecture:** Built with Shadcn UI components mapping entirely to semantic CSS variables, ensuring clean layout presentation across screen sizes.

---

## 🛠️ Tech Stack

* **Framework:** React + TypeScript (Vite)
* **Components & Styling:** Tailwind CSS + Shadcn/ui
* **Icons & Charts:** Lucide React + Recharts

---

## 🏗️ Architecture Layout

```text
┌────────────────────────────────────┐
│       NASA Mission Workspace       │
└────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│     Telemetry Ingestion Engine     │
└────────────────────────────────────┘
                  │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
   NEO API    APOD API   DONKI API
      │
      ▼
 Mars InSight Data ──► [ Failover Simulation Layer ]
      │
      ▼
┌────────────────────────────────────┐
│      Anomaly Diagnostic Board      │
└────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│      Shadcn UI Theme Viewport      │
└────────────────────────────────────┘
