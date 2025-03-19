use axum::{
    extract::Query,
    Json,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use decimal_time_webapp::decimal_time::DecimalTime;

#[derive(Debug, Deserialize)]
pub struct TimeQuery {
    #[serde(default = "default_decimal_places")]
    decimal_places: usize,
    
    #[serde(default = "default_include_year")]
    include_year: bool,
    
    #[serde(default = "default_include_day")]
    include_day: bool,
}

fn default_decimal_places() -> usize {
    5
}

fn default_include_year() -> bool {
    true
}

fn default_include_day() -> bool {
    true
}

#[derive(Debug, Serialize)]
pub struct TimeResponse {
    year: i32,
    day_of_year: u32,
    decimal_day: String,
    formatted: String,
    unit_name: String,
}

// Handler for GET /api/time
pub async fn get_current_time(
    Query(params): Query<TimeQuery>,
) -> Json<TimeResponse> {
    let now = Utc::now();
    let decimal_time = DecimalTime::from_datetime_utc(now);
    
    let unit_name = match params.decimal_places {
        0 => "Day",
        1 => "Deci-Day (2.4 hours)",
        2 => "Quartz (14.4 minutes)",
        3 => "Chilled minute (1.44 minutes)",
        4 => "Wave or Breath (8.64 seconds)",
        5 => "Impatient second (0.86 seconds)",
        6 => "Blink (0.086 seconds)",
        7 => "Neuron (0.00864 seconds)",
        8 => "Photon (0.000864 seconds)",
        9 => "Quantum (0.0000864 seconds)",
        10 => "Planck (0.00000864 seconds)",
        _ => "Custom precision",
    };
    
    // Format the decimal day with specified decimal places
    let decimal_day = format!("{:.1$}", decimal_time.decimal_day, params.decimal_places);
    
    // Create the formatted time string
    let mut formatted = String::new();
    
    if params.include_year {
        formatted.push_str(&decimal_time.year.to_string());
        formatted.push('.');
    }
    
    if params.include_day {
        formatted.push_str(&decimal_time.day_of_year.to_string());
        formatted.push('.');
    }
    
    // Add decimal day, trimming leading zero
    formatted.push_str(decimal_day.trim_start_matches("0"));
    
    Json(TimeResponse {
        year: decimal_time.year,
        day_of_year: decimal_time.day_of_year,
        decimal_day,
        formatted,
        unit_name: unit_name.to_string(),
    })
}