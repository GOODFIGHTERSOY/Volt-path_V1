## VoltPath — EV Battery Digital Twin & Range Intelligence


🚀 Key Features
🔹 Digital Twin Dashboard
Real-time synchronization with vehicle telemetry. Compare "True Predicted Range" against EPA/WLTP estimates. Monitor cell-group voltages and thermal distribution across the pack.

🔹 Predictive Trip Planner
Advanced route modeling that factors in payload weight, headwind resistance, and elevation changes. View a detailed "Range Forecast" trajectory to see exactly where your state-of-charge will be at every milestone.

🔹 Battery Health Intelligence (SOH)
Granular insight into your battery's longevity. Includes a Cell Matrix Topology to identify voltage sag in specific modules and a Degradation Curve comparing your vehicle against fleet averages.

🔹 Driving Style Analysis
A multi-vector analysis of driving habits (Acceleration, Regen Efficiency, and Climate Usage). The system provides AI-driven recommendations to recover lost miles and extend battery cycle life.

🔹 Charging Optimization & Forecast
Smart scheduling that balances grid costs with battery chemistry preservation. Visualize the "Cost & Health Curve" to find the optimal charging window and monitor internal resistance impacts from DC fast charging.

🎨 Design System: "Space Navy & Electric Cyan"
The interface is built on a custom design system optimized for high-contrast technical environments:

Primary Palette: Deep Space Navy surfaces with Electric Cyan accents for critical telemetry.
Typography: Inter (Sans-serif) for maximum legibility of dense data.
Visual Style: Digital twin wireframes, glowing data vectors, and glassmorphic containers.
🛠 Technical Stack (Conceptual)
**Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+).
**Data Visualization:** Custom SVG-based charting and Radar vectors.
**Mapping:** Dark-themed satellite tiles with custom SVG telemetry overlays.


View our app in AI Studio: https://voltpath-902797606062.asia-southeast1.run.app

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
