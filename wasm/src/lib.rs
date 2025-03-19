use wasm_bindgen::prelude::*;

// Setup the panic hook for debugging
extern crate console_error_panic_hook;

#[wasm_bindgen]
pub struct DecimalTimeJS {
    year: i32,
    day_of_year: u32,
    decimal_day: f64,
}

#[wasm_bindgen]
impl DecimalTimeJS {
    #[wasm_bindgen(constructor)]
    pub fn new(year: i32, day_of_year: u32, decimal_day: f64) -> Result<DecimalTimeJS, JsValue> {
        if !(0.0..1.0).contains(&decimal_day) {
            return Err(JsValue::from_str("decimal_day must be in [0,1)"));
        }
        if !(1..=366).contains(&day_of_year) {
            return Err(JsValue::from_str("day_of_year must be in [1..=366]"));
        }
        
        Ok(DecimalTimeJS { 
            year, 
            day_of_year, 
            decimal_day 
        })
    }

    #[wasm_bindgen]
    pub fn now() -> DecimalTimeJS {
        // Get current date using JavaScript APIs
        let date = js_sys::Date::new_0();
        
        let year = date.get_full_year() as i32;
        
        // Calculate the day of year
        // Create a date for January 1st of the current year
        let start_of_year_str = format!("{}-01-01", year);
        let start_of_year = js_sys::Date::new(&JsValue::from(start_of_year_str));
        
        // Calculate milliseconds since start of year
        let ms_since_year_start = date.get_time() - start_of_year.get_time();
        let days_since_year_start = (ms_since_year_start / (1000.0 * 60.0 * 60.0 * 24.0)).floor();
        
        // Day of year is 1-based
        let day_of_year = days_since_year_start as u32 + 1;
        
        // Calculate fraction of the day
        let hours = date.get_hours() as f64;
        let minutes = date.get_minutes() as f64;
        let seconds = date.get_seconds() as f64;
        let milliseconds = date.get_milliseconds() as f64;
        
        let total_seconds = hours * 3600.0 + minutes * 60.0 + seconds + milliseconds / 1000.0;
        let decimal_day = total_seconds / 86400.0;  // 86400 seconds in a day
        
        DecimalTimeJS {
            year,
            day_of_year,
            decimal_day,
        }
    }

    #[wasm_bindgen]
    pub fn get_year(&self) -> i32 {
        self.year
    }

    #[wasm_bindgen]
    pub fn get_day_of_year(&self) -> u32 {
        self.day_of_year
    }

    #[wasm_bindgen]
    pub fn get_decimal_day(&self) -> f64 {
        self.decimal_day
    }

    #[wasm_bindgen]
    pub fn format_decimal(&self, decimal_places: usize) -> String {
        format!("{:.1$}", self.decimal_day, decimal_places)
    }

    #[wasm_bindgen]
    pub fn format_full(&self, include_year: bool, include_day: bool, decimal_places: usize) -> String {
        let mut result = String::new();
        
        if include_year {
            result.push_str(&self.year.to_string());
            result.push('.');
        }
        
        if include_day {
            result.push_str(&self.day_of_year.to_string());
            // result.push('.');
        }
        
        // Format the decimal portion with the specified precision, removing leading zero
        let decimal_str = format!("{:.1$}", self.decimal_day, decimal_places);
        result.push_str(decimal_str.trim_start_matches("0"));
        
        result
    }
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn get_unit_name(decimal_places: usize) -> String {
    match decimal_places {
        0 => "Day".to_string(),
        1 => "Deci-Day (2.4 hours)".to_string(),
        2 => "Quartz (14.4 minutes)".to_string(),
        3 => "Chilled minute (1.44 minutes)".to_string(),
        4 => "Wave or Breath (8.64 seconds)".to_string(),
        5 => "Impatient second (0.86 seconds)".to_string(),
        6 => "Blink (0.086 seconds)".to_string(),
        7 => "Neuron (0.00864 seconds)".to_string(),
        8 => "Photon (0.000864 seconds)".to_string(),
        9 => "Quantum (0.0000864 seconds)".to_string(),
        10 => "Planck (0.00000864 seconds)".to_string(),
        _ => format!("Custom precision (10^-{} day)", decimal_places),
    }
}

// Set up the panic hook for better error messages in the browser console
#[wasm_bindgen(start)]
pub fn start() {
    init_panic_hook();
}