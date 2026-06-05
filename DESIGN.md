---
version: "1.1.0"
name: "Modern Telemetry Studio"
description: "A refined, human-centric analytics dashboard moving away from code consoles toward clean editorial aesthetics."

colors:
  background: "#f8fafc"        # Crisp, light Slate 50 background
  card: "#ffffff"              # Pure white dimensional cards
  border: "#e2e8f0"            # Soft, approachable Slate 200 separation lines
  primary: "#0284c7"           # Authoritative, calm Sky 600 focus
  success: "#16a34a"           # Approachable Green 600 health status
  warning: "#ca8a04"           # Muted Amber 600 warning
  destructive: "#dc2626"       # Clean Red 600 attention tag
  muted: "#64748b"             # Deep slate secondary copy

typography:
  fontFamily: "Inter, system-ui, sans-serif" # Humanist sans-serif base
  baseSize: "14px"
  headingSize: "20px"

rounded:
  sm: "8px"
  md: "14px"
  xl: "24px"

components:
  panel-card:
    backgroundColor: "{colors.card}"
    textColor: "#0f172a"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border}"
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)"
---

## Atmosphere
The workspace values calm, empty space and clear visual hierarchy. Data displays act as clean reading canvases rather than blinking control monitors.
