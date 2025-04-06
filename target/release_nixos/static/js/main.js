import { initializeWasm } from './wasm_loader.js';

// Settings and state
let decimalTimeWasm = null;
let settings = {
    font: 'Arial, sans-serif',
    color: '#00ff00',
    soundEnabled: false,
    decimalPlaces: 5,
    showExplanationPanel: false,
    visualizationEnabled: true,
    showYear: true,
    showDay: true
};

// DOM Elements
let counter, formatLabel, fontSelector, colorSelector, soundToggle, vizEnabledToggle,
    tickSound, settingsPanel, settingsIcon, userGuideToggle, guidePanel,
    explanationPanel, explanationToggle, currentDimensionText, closeExplanation,
    progressBar, vizLabel, currentUnitName, vizToggle, vizContainer;

// Store the last fractional part to detect changes
let lastFractionalPart = '';
let updateIntervalId = null;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize DOM elements
    initializeDomElements();
    
    // Load settings from localStorage
    loadSettings();
    
    // Attempt to initialize the WebAssembly module
    try {
        decimalTimeWasm = await initializeWasm();
        console.log('WASM module loaded successfully');
        
        // Start the update interval
        updateIntervalId = setInterval(updateCounter, 10);
        updateCounter();
    } catch (error) {
        console.error('Failed to initialize WASM module:', error);
        counter.textContent = 'Failed to load decimal time module. Please refresh the page.';
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize DOM elements
function initializeDomElements() {
    counter = document.getElementById('counter');
    formatLabel = document.getElementById('formatLabel');
    fontSelector = document.getElementById('fontSelector');
    colorSelector = document.getElementById('colorSelector');
    soundToggle = document.getElementById('soundToggle');
    vizEnabledToggle = document.getElementById('vizEnabledToggle');
    tickSound = document.getElementById('tickSound');
    settingsPanel = document.getElementById('settingsPanel');
    settingsIcon = document.getElementById('settingsIcon');
    userGuideToggle = document.getElementById('userGuideToggle');
    guidePanel = document.getElementById('guidePanel');
    explanationPanel = document.getElementById('explanationPanel');
    explanationToggle = document.getElementById('explanationToggle');
    currentDimensionText = document.getElementById('currentDimensionText');
    closeExplanation = document.getElementById('closeExplanation');
    progressBar = document.getElementById('progressBar');
    vizLabel = document.getElementById('vizLabel');
    currentUnitName = document.getElementById('currentUnitName');
    vizToggle = document.getElementById('vizToggle');
    vizContainer = document.querySelector('.visualization-container');
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('decimalTimeSettings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            settings = { ...settings, ...parsed };
            
            // Apply loaded settings
            applySettings();
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Apply settings to UI
function applySettings() {
    // Apply visual settings
    document.body.style.fontFamily = settings.font;
    counter.style.color = settings.color;
    progressBar.style.backgroundColor = settings.color;
    
    // Apply form control values
    fontSelector.value = settings.font;
    colorSelector.value = settings.color;
    soundToggle.checked = settings.soundEnabled;
    vizEnabledToggle.checked = settings.visualizationEnabled;
    
    // Apply visualization visibility
    updateVisualizationVisibility();
    
    // Apply explanation panel visibility
    if (settings.showExplanationPanel) {
        explanationPanel.classList.add('visible');
    } else {
        explanationPanel.classList.remove('visible');
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('decimalTimeSettings', JSON.stringify(settings));
}

// Update the visualization visibility
function updateVisualizationVisibility() {
    if (settings.visualizationEnabled) {
        vizContainer.classList.remove('hidden');
        vizToggle.textContent = 'Hide Visualization';
    } else {
        vizContainer.classList.add('hidden');
        vizToggle.textContent = 'Show Visualization';
    }
}

// Update the explanation text based on current decimal places
function updateExplanationText() {
    const decimalPlaces = settings.decimalPlaces;
    let dimensionText = "";

    switch(decimalPlaces) {
        case 1:
            dimensionText = "First decimal (2.4 hours)";
            break;
        case 2:
            dimensionText = "Second decimal (14.4 minutes)";
            break;
        case 3:
            dimensionText = "Third decimal (1.44 minutes)";
            break;
        case 4:
            dimensionText = "Fourth decimal (8.64 seconds)";
            break;
        case 5:
            dimensionText = "Fifth decimal (0.86 seconds)";
            break;
        case 6:
            dimensionText = "Sixth decimal (0.086 seconds)";
            break;
        case 7:
            dimensionText = "Seventh decimal (0.00864 seconds)";
            break;
        case 8:
            dimensionText = "Eighth decimal (0.000864 seconds)";
            break;
        case 9:
            dimensionText = "Ninth decimal (0.0000864 seconds)";
            break;
        case 10:
            dimensionText = "Tenth decimal (0.00000864 seconds)";
            break;
        default:
            dimensionText = "Custom precision";
    }

    currentDimensionText.textContent = dimensionText;
    
    // Get unit name from WASM if available
    if (decimalTimeWasm) {
        currentUnitName.textContent = decimalTimeWasm.get_unit_name(decimalPlaces);
    }
}

// Update the visualization based on current time
function updateVisualization(decimalTime) {
    if (!settings.visualizationEnabled) return;

    const decimalPlaces = settings.decimalPlaces;

    // Calculate the decimal day progress
    const fractionalDay = decimalTime.get_decimal_day();
    
    // Calculate the next higher precision unit (one decimal place more precise)
    // This helps synchronize the bar to reach 100% exactly when the displayed digit changes
    const divisor = Math.pow(10, -decimalPlaces);
    const remainder = fractionalDay % divisor;
    
    // This calculation makes the progress bar hit 50% when the displayed digit changes
    // It's calculated by taking the next lower unit's place and mapping it from 0-9 to 0-100%
    const digitValue = Math.floor((remainder / divisor) * 10);
    const subDigitProgress = ((fractionalDay % divisor) - (digitValue * divisor / 10)) / (divisor / 10) * 100;

    // Calculate the progress so that the bar completes a full cycle for each digit
    // and reaches 50% exactly when the digit changes
    let progress = (digitValue * 10) + subDigitProgress / 10;

    // Update linear progress bar
    progressBar.style.width = `${progress}%`;
}

// Update the counter display
function updateCounter() {
    if (!decimalTimeWasm) return;
    
    try {
        // Get current decimal time
        const decimalTime = decimalTimeWasm.DecimalTimeJS.now();
        const decimalPlaces = settings.decimalPlaces;
        
        // Format the decimal time
        const formattedTime = decimalTime.format_full(
            settings.showYear,
            settings.showDay,
            decimalPlaces
        );
        
        // Check if we need to apply fading for high-precision display
        if (decimalPlaces >= 6) {
            // Apply fading to digits from position 6 onwards
            counter.innerHTML = ''; // Clear existing content

            // Add year and day parts if they are shown
            if (settings.showYear) {
                const yearSpan = document.createElement('span');
                yearSpan.textContent = decimalTime.get_year() + '.';
                counter.appendChild(yearSpan);
            }

            if (settings.showDay) {
                const daySpan = document.createElement('span');
                daySpan.textContent = decimalTime.get_day_of_year() + '.';
                counter.appendChild(daySpan);
            }

            // Format the decimal part
            const decimalStr = decimalTime.format_decimal(decimalPlaces);
            const fractionalPart = decimalStr.replace('0.', '');

            // Add each digit of the fractional part with appropriate fading
            for (let i = 0; i < fractionalPart.length; i++) {
                const digitSpan = document.createElement('span');
                digitSpan.textContent = fractionalPart[i];
                digitSpan.className = 'digit';

                // Apply fading classes for digits from position 6 onwards
                if (i >= 5) {
                    // Calculate fade level (1-5)
                    const fadeLevel = Math.min(5, Math.max(1, i - 4));
                    digitSpan.classList.add(`fade-${fadeLevel}`);
                }

                counter.appendChild(digitSpan);
            }
        } else {
            // For 5 or fewer decimal places, display normally
            counter.textContent = formattedTime;
        }

        // Update the visualization
        updateVisualization(decimalTime);

        // Update the explanation panel text
        updateExplanationText();

        // Play sound if a certain decimal place changes and sound is enabled
        const fractionalPart = decimalTime.format_decimal(decimalPlaces);
        if (settings.soundEnabled && lastFractionalPart !== fractionalPart) {
            // Create a fresh audio element for better sound triggering
            try {
                const tempAudio = new Audio(tickSound.querySelector('source').src);
                tempAudio.volume = 0.5; // Reduce volume to 50%
                tempAudio.play().catch(e => {
                    // Handle potential autoplay restrictions
                    console.log("Audio play prevented:", e);
                });
            } catch (e) {
                console.error("Error playing sound:", e);
            }
        }
        lastFractionalPart = fractionalPart;

        // Update document title
        document.title = `DT ${formattedTime}`;

        // Update format label
        let formatString = (settings.showYear ? "Y" : "") + (settings.showDay ? "D" : "") + "DT" + decimalPlaces;
        formatLabel.textContent = `Decimal Time (${formatString})`;
    } catch (error) {
        console.error('Error updating counter:', error);
        
        if (updateIntervalId) {
            clearInterval(updateIntervalId);
            counter.textContent = 'An error occurred. Please refresh the page.';
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Decimal place controls
    document.getElementById("decrease").addEventListener("click", () => {
        if (settings.decimalPlaces > 0) {
            settings.decimalPlaces -= 1;
            saveSettings();
        }
    });

    document.getElementById("increase").addEventListener("click", () => {
        if (settings.decimalPlaces < 10) {
            settings.decimalPlaces += 1;
            saveSettings();
        }
    });

    // Year/Day toggle controls
    document.getElementById("up").addEventListener("click", () => {
        if (!settings.showDay) {
            settings.showDay = true;
        } else if (!settings.showYear) {
            settings.showYear = true;
        }
        saveSettings();
    });

    document.getElementById("down").addEventListener("click", () => {
        if (settings.showYear) {
            settings.showYear = false;
        } else if (settings.showDay) {
            settings.showDay = false;
        }
        saveSettings();
    });

    // Toggle visualization
    vizToggle.addEventListener("click", () => {
        settings.visualizationEnabled = !settings.visualizationEnabled;
        updateVisualizationVisibility();
        saveSettings();
    });

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            document.getElementById("decrease").click();
        } else if (event.key === "ArrowRight") {
            document.getElementById("increase").click();
        } else if (event.key === "ArrowDown") {
            document.getElementById("down").click();
        } else if (event.key === "ArrowUp") {
            document.getElementById("up").click();
        } else if (event.key === "v" || event.key === "V") {
            // Toggle visualization with V key
            vizToggle.click();
        } else if (event.key === " " || event.code === "Space") {
            // Toggle guide panel with spacebar
            guidePanel.classList.toggle('visible');
            // Prevent page scrolling with spacebar
            event.preventDefault();
        }
    });

    // Toggle settings panel
    settingsIcon.addEventListener('click', () => {
        settingsPanel.classList.toggle('expanded');
    });

    // Toggle user guide
    userGuideToggle.addEventListener('click', () => {
        guidePanel.classList.toggle('visible');
    });

    // Toggle explanation panel
    explanationToggle.addEventListener('click', () => {
        explanationPanel.classList.toggle('visible');
        settings.showExplanationPanel = explanationPanel.classList.contains('visible');
        saveSettings();
    });

    // Close explanation panel
    closeExplanation.addEventListener('click', () => {
        explanationPanel.classList.remove('visible');
        settings.showExplanationPanel = false;
        saveSettings();
    });

    // Font selector
    fontSelector.addEventListener('change', () => {
        settings.font = fontSelector.value;
        document.body.style.fontFamily = settings.font;
        saveSettings();
    });

    // Color selector
    colorSelector.addEventListener('input', () => {
        settings.color = colorSelector.value;
        counter.style.color = settings.color;
        progressBar.style.backgroundColor = settings.color;
        saveSettings();
    });

    // Sound toggle
    soundToggle.addEventListener('change', () => {
        settings.soundEnabled = soundToggle.checked;
        saveSettings();
    });

    // Visualization toggle
    vizEnabledToggle.addEventListener('change', () => {
        settings.visualizationEnabled = vizEnabledToggle.checked;
        updateVisualizationVisibility();
        saveSettings();
    });

    // Close guide panel when clicking outside of it
    document.addEventListener('click', (event) => {
        if (guidePanel.classList.contains('visible') &&
            !guidePanel.contains(event.target) &&
            event.target !== userGuideToggle) {
            guidePanel.classList.remove('visible');
        }

        // Close settings panel when clicking outside of it
        if (settingsPanel.classList.contains('expanded') &&
            !settingsPanel.contains(event.target) &&
            event.target !== settingsIcon) {
            settingsPanel.classList.remove('expanded');
        }
    });
}