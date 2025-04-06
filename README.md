# Decimal Time Webapp

A modern web application that displays time in decimal format (as fractions of a day). The application uses Rust for the core logic, WebAssembly for browser integration, and a lightweight Axum web server to serve the application.

[Online demonstration](https://v1d.dk/dt/) (HTML-only version but looks the same)

## Features

- Real-time decimal time display with configurable decimal places (up to 10)
- Optional display of year and day components
- Visual progress indicator for the current time unit
- Customizable appearance (font, color)
- Sound effects for time changes
- Detailed explanation of time units at different decimal precisions
- Keyboard shortcuts for easy interaction
- Settings persistence between sessions

## Technical Architecture

This application demonstrates a modern Rust + WebAssembly architecture:

1. **Core Logic**: Implemented in Rust with the `decimal_time` module
2. **WebAssembly Bridge**: Exposes the Rust functionality to JavaScript
3. **Web Server**: Axum-based server provides static files and optional API endpoints
4. **Frontend**: HTML, CSS, and JavaScript interface

## Getting Started

### Prerequisites

- Rust and Cargo (latest stable version)
- wasm-pack for WebAssembly compilation
- Node.js (optional, for development tools)

### Building the Project

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/decimal-time-webapp.git
   cd decimal-time-webapp
   ```

2. Build the WebAssembly module:
   ```
   cd wasm
   wasm-pack build --target web
   cd ..
   ```

3. Build and run the server:
   ```
   cargo run --release
   ```

4. Open your browser to `http://localhost:3000`

## Time Units

The application can display time at various precisions, each representing a different time scale:

| Decimal Places | Name | Approximate Duration | Analogy |
|----------------|------|----------------------|---------|
| 1 | Deci-Day | 2.4 hours | Quarter of a work day |
| 2 | Quartz | 14.4 minutes | Short break |
| 3 | Chilled minute | 1.44 minutes | Brewing tea |
| 4 | Wave/Breath | 8.64 seconds | Deep breath |
| 5 | Impatient second | 0.86 seconds | Heartbeat |
| 6 | Blink | 0.086 seconds | Eye blink |
| 7 | Neuron | 0.00864 seconds | Neural impulse |
| 8 | Photon | 0.000864 seconds | Light travels 260 km |
| 9 | Quantum | 0.0000864 seconds | Quantum interactions |
| 10 | Planck | 0.00000864 seconds | Approaching fundamental limits |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the decimal time concept
- Inspired by alternative time measurement systems
