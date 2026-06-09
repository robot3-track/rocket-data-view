![Workspace Image](./Nebula%20Insights%20(1).png)

# 🛰️ NASA Mission Analytics Workspace

A high-fidelity, real-time telemetry dashboard designed to centralize, parse, and visualize multi-stream data from diverse NASA API endpoints. This integrated mission control interface allows users to monitor planetary conditions, track near-Earth objects, and audit severe space weather anomalies from a single workspace.

---

## 🚀 Core Features

### 🌌 Multi-Stream Data Ingestion

Dynamic, context-aware data routing across four distinct NASA APIs:

- ☄️ Near-Earth Object (NEO) Tracking
- 🔴 Mars InSight Atmospheric Data
- 🌠 Astronomy Picture of the Day (APOD) Metadata
- ⚡ Space Weather DONKI Alerts

The dashboard enables seamless source switching while maintaining a consistent telemetry visualization experience.

### 🚨 Automated Anomaly Audit

An integrated parsing matrix continuously scans incoming datasets to:

- Flag potentially hazardous asteroids
- Detect severe solar weather events
- Identify M-Class and X-Class flare activity
- Count and categorize threat-level incidents
- Isolate critical anomalies for rapid review

### 🔄 Predictive Failover Subsystems

Built-in telemetry simulation layers provide fallback data streams when live sources are unavailable.

Features include:

- Historical mission data replay
- Offline telemetry emulation
- Mars InSight mission parameter reconstruction
- Continuous chart rendering during API outages
- Uninterrupted timeline visualizations

### 📱 Fluid Layout Architecture

A fully responsive interface built around modern navigation and adaptive layouts.

Capabilities include:

- Dynamic grid column allocation
- Responsive telemetry panels
- Mobile-first viewport scaling
- shadcn/ui navigation structures
- Seamless desktop-to-mobile transitions

---

## 🛠️ Tech Stack

| Category              | Technology         |
| --------------------- | ------------------ |
| **Framework**         | React + TypeScript |
| **Styling**           | Tailwind CSS       |
| **Component Library** | shadcn/ui          |
| **Icons**             | Lucide React       |

### Framework

**React with TypeScript**

Provides:

- Type-safe data modeling
- Structured telemetry schemas
- Predictable state management
- Strong API contract validation

### Styling

**Tailwind CSS**

Used for:

- Fluid spacing systems
- Responsive grid layouts
- Adaptive viewport behavior
- Utility-first styling architecture

### Component Library

**shadcn/ui**

Key implementations include:

- `<SidebarProvider>`
- Responsive navigation patterns
- Layout transition hooks
- Modular UI composition

### Icons

**Lucide React**

Provides lightweight, scalable SVG icons optimized for telemetry dashboards and mission-control interfaces.

---

## ⚙️ Getting Started

### Prerequisites

Ensure the following tools are installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js) or Bun

Verify installation:

```bash
node -v
npm -v
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/robot3-track/robot-data-view.git
cd robot-data-view
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Start the Development Server

Using npm:

```bash
npm run dev
```

Or using Bun:

```bash
bun run dev
```

### 4. Open the Application

Navigate to:

```text
http://localhost:5173
```

or the URL displayed in your terminal.

---

## 🧩 Data Sources

### ☄️ Near-Earth Object Web Service (NeoWs)

Tracks asteroid approaches and identifies potentially hazardous objects.

### 🔴 Mars InSight Weather Service

Provides atmospheric and environmental telemetry from the Mars InSight mission archive.

### 🌠 Astronomy Picture of the Day (APOD)

Retrieves daily NASA imagery and associated scientific metadata.

### ⚡ DONKI Space Weather Database

Monitors:

- Solar flares
- Coronal mass ejections (CMEs)
- Geomagnetic storms
- High-energy particle events

---

## 📊 Telemetry Monitoring Capabilities

The workspace supports:

- Real-time event visualization
- Threat classification matrices
- Historical timeline analysis
- Space weather anomaly tracking
- Planetary environmental monitoring
- Multi-source telemetry aggregation
- Interactive dashboard filtering

---

## 🏗️ Architecture Overview

```text
┌────────────────────────────────────┐
│        NASA Mission Workspace       │
└────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│      Telemetry Aggregation Layer    │
└────────────────────────────────────┘
                 │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
  NEO API    APOD API   DONKI API
      │
      ▼
 Mars InSight Data
      │
      ▼
┌────────────────────────────────────┐
│      Anomaly Detection Engine       │
└────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│    Responsive Visualization Layer   │
└────────────────────────────────────┘
```

---

## 🎯 Use Cases

- Mission operations monitoring
- Space weather surveillance
- Asteroid threat assessment
- Educational astronomy dashboards
- NASA data visualization projects
- Scientific telemetry exploration
- Public-facing mission analytics portals

---

## 🔮 Future Enhancements

- Live WebSocket telemetry ingestion
- Advanced predictive analytics
- AI-assisted anomaly classification
- Mission event playback controls
- Custom telemetry alert thresholds
- Exportable mission reports
- Extended NASA API integrations

---

## 📄 License

This project is distributed under the terms of the MIT License.

---

## 👨‍🚀 Mission Statement

Deliver a unified mission-control experience that transforms distributed NASA datasets into actionable telemetry intelligence through responsive visualization, anomaly detection, and resilient data-stream architecture.
