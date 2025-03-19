// Function to load a WASM module
async function loadWasmModule(modulePath) {
    try {
        // Dynamically import the WebAssembly module
        const wasmModule = await import(modulePath);
        
        // Wait for module initialization
        await wasmModule.default();
        
        return wasmModule;
    } catch (error) {
        console.error('Failed to load WASM module:', error);
        throw error;
    }
}

// Export the WASM module loader
export async function initializeWasm() {
    try {
        // Load the decimal time WASM module
        const wasmModule = await loadWasmModule('/wasm/decimal_time_wasm.js');
        
        // Initialize the WASM panic hook for better error messages
        wasmModule.init_panic_hook();
        
        return wasmModule;
    } catch (error) {
        console.error('Failed to initialize WASM:', error);
        
        // If WASM fails to load, we'll offer a fallback
        document.getElementById('counter').textContent = 'Error loading WASM. Please check console.';
        throw error;
    }
}

// Define the object in global scope for access by other scripts
window.wasmLoader = {
    initializeWasm
};

// Export the initialization function
export default initializeWasm;