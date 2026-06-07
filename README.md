# 🛰️ NASA Mission Analytics Workspace

A high-fidelity, real-time telemetry dashboard designed to centralize, parse, and visualize multi-stream data from diverse NASA API endpoints. This integrated mission control interface allows users to monitor planetary conditions, track near-Earth objects, and audit severe space weather anomalies from a single workspace.

## 🚀 Core Features

- **Multi-Stream Data Ingestion:** Dynamic, context-aware swapping across four distinct NASA APIs: Near-Earth Object (NEO) tracking, Mars InSight atmospheric data, Astronomy Picture of the Day (APOD) metadata, and Space Weather DONKI alerts.
- **Automated Anomaly Audit:** An integrated parsing matrix that scans inbound datasets to instantly flag, count, and isolate critical threats—such as potentially hazardous asteroids or extreme M/X-class solar flare events.
- **Predictive Failover Subsystems:** Built-in telemetry simulation fallbacks for historical or offline data arrays (such as the concluded Mars InSight mission parameters) to ensure continuous chart rendering and unbroken timeline data.
- **Fluid Layout Architecture:** A fully responsive user interface utilizing shadcn/ui navigation structures and dynamic grid column allocation, allowing smooth tracking across standard desktop workstations down to mobile touch viewports.

---

## 🛠️ Tech Stack

- **Framework:** React with TypeScript (for type-safe data modeling and structured telemetry structures)
- **Styling:** Tailwind CSS (built with fluid layout padding and responsive grid profiles)
- **Component Library:** shadcn/ui (leveraging `<SidebarProvider>` and native layout transition hooks)
- **Icons:** Lucide React

---

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and a package manager like `npm` or `bun` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/robot3-track/robot-data-view.git](https://github.com/robot3-track/robot-data-view.git)
   cd robot-data-view
Install dependencies:

Bash
npm install
# or if you are using bun:
bun install
Set up Environment Variables:
Create a .env file in the root directory and add your NASA API key (you can generate one at api.nasa.gov):

Code snippet
VITE_NASA_API_KEY=your_nasa_api_key_here
Run the development server:

Bash
npm run dev
# or:
bun dev
Open your browser to http://localhost:5173 to view your workspace.

📈 Engineering Log & Optimization Fixes
Building the workspace required solving several critical data binding and frontend layout bugs:

1. Data Hydration Syncing
Issue: Changing frontend UI sub-tabs caused charts to go blank because state keys didn't map cleanly to the underlying API keys.

Fix: Overhauled nasa.ts to implement strict key-value pairings for all datasets (neo, mars-weather, etc.) so context loads asynchronously with zero delay.

2. Collapsible Sidebar Layout Freeze
Issue: The workspace layout would get jammed halfway when clicking the hamburger toggle, leaving a blank artifact block on screen.

Fix: Removed hardcoded layout widths from the wrapper component and migrated the state management completely to shadcn's native useSidebar() context hooks.

3. Mobile Fluid Grid Overhaul
Issue: Text labels overlapped, charts clipped, and elements broke entirely on touch resolutions.

Fix: Implemented a horizontally scrollable navigation app-tray for mobile selectors, forced metrics cards to wrap cleanly, and added adaptive padding layout adjustments along the main content canvas flow.

Mission Status: Production build validated. Telemetry online. 🛰️
