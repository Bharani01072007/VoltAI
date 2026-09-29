"""
Electricity Consumption Dataset Generator
Generates a realistic, domain-grounded hourly electricity consumption dataset
with meteorological, temporal, and occupancy features.
"""

import numpy as np
import pandas as pd
import os

def generate_electricity_dataset(num_samples: int = 12000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    
    # Generate continuous timestamp range
    start_date = pd.Timestamp("2025-01-01 00:00:00")
    timestamps = [start_date + pd.Timedelta(hours=i) for i in range(num_samples)]
    
    df = pd.DataFrame({"timestamp": timestamps})
    
    # Temporal features
    df["hour"] = df["timestamp"].dt.hour
    df["day"] = df["timestamp"].dt.day
    df["month"] = df["timestamp"].dt.month
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    
    # Seasonal temperature simulation (°C)
    # Sinusoidal annual curve + diurnal fluctuation + noise
    month_rad = (df["month"] - 1) / 12.0 * 2 * np.pi
    base_temp = 20 + 12 * np.sin(month_rad - np.pi / 2) # Peak summer in July/Aug, coldest in Jan
    diurnal_temp = 5 * np.sin((df["hour"] - 9) / 24.0 * 2 * np.pi)
    temp_noise = np.random.normal(0, 2.5, num_samples)
    df["temperature"] = np.round(np.clip(base_temp + diurnal_temp + temp_noise, -5.0, 42.0), 1)
    
    # Humidity (%) - inversely correlated with temp
    base_humidity = 60 - 0.4 * (df["temperature"] - 20)
    humidity_noise = np.random.normal(0, 6.0, num_samples)
    df["humidity"] = np.round(np.clip(base_humidity + humidity_noise, 20.0, 95.0), 1)
    
    # Occupancy (number of people)
    # Higher during evening and weekends
    is_night = (df["hour"] >= 23) | (df["hour"] <= 6)
    is_work_hours = (df["hour"] >= 9) & (df["hour"] <= 17) & (df["is_weekend"] == 0)
    
    occupancy_base = np.where(is_work_hours, 1, np.where(is_night, 2, 4))
    occupancy_noise = np.random.poisson(1, num_samples)
    df["occupancy"] = np.clip(occupancy_base + occupancy_noise, 1, 12).astype(int)
    
    # Active high-draw appliances (count of appliances running)
    # Higher in evening peak (17:00-22:00) and weekend daytime
    is_evening_peak = (df["hour"] >= 17) & (df["hour"] <= 22)
    appliance_lambda = np.where(is_evening_peak, 4.5, np.where(df["is_weekend"] == 1, 3.2, 1.8))
    df["appliance_usage"] = np.clip(np.random.poisson(appliance_lambda), 0, 15).astype(int)
    
    # Previous consumption (kWh) - continuous autoregressive relationship with random noise
    # We build the raw consumption sequence sequentially to model realistic temporal lag
    raw_kwh = np.zeros(num_samples)
    
    for i in range(num_samples):
        h = df.loc[i, "hour"]
        temp = df.loc[i, "temperature"]
        hum = df.loc[i, "humidity"]
        occ = df.loc[i, "occupancy"]
        app = df.loc[i, "appliance_usage"]
        wknd = df.loc[i, "is_weekend"]
        
        # HVAC thermal load (delta from 21°C comfort point)
        hvac_load = max(0, abs(temp - 21.0) - 3.0) * 0.22
        humidity_load = max(0, hum - 65.0) * 0.02
        
        # Diurnal multiplier
        if 17 <= h <= 21:
            h_mult = 1.7
        elif 8 <= h <= 16:
            h_mult = 1.3
        elif 1 <= h <= 5:
            h_mult = 0.5
        else:
            h_mult = 0.95
            
        wknd_mult = 1.15 if wknd else 1.0
        
        base = (0.8 * occ + 1.1 * app + hvac_load + humidity_load + 0.5) * h_mult * wknd_mult
        
        if i == 0:
            prev = 3.0
        else:
            prev = raw_kwh[i-1]
            
        # Autoregressive blend
        kwh = 0.45 * prev + 0.55 * base + np.random.normal(0, 0.35)
        raw_kwh[i] = max(0.4, np.round(kwh, 2))
        
    df["consumption_kwh"] = raw_kwh
    
    # Derive previous_consumption feature cleanly (lag 1 hour) to avoid temporal data leakage
    df["previous_consumption"] = df["consumption_kwh"].shift(1).fillna(3.0)
    
    # Formulate "Electricity Consumption Level Classification" target using quantiles
    # Quantiles ensure balanced LOW, MEDIUM, HIGH class distributions
    q33 = df["consumption_kwh"].quantile(0.3333)
    q66 = df["consumption_kwh"].quantile(0.6667)
    
    print(f"Quantile Thresholds: LOW <= {q33:.2f} kWh, MEDIUM <= {q66:.2f} kWh, HIGH > {q66:.2f} kWh")
    
    def label_consumption(val):
        if val <= q33:
            return "LOW"
        elif val <= q66:
            return "MEDIUM"
        else:
            return "HIGH"
            
    df["consumption_level"] = df["consumption_kwh"].apply(label_consumption)
    
    return df

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    dataset_path = "data/electricity_consumption.csv"
    print("Generating electricity consumption dataset...")
    df = generate_electricity_dataset(num_samples=12000, seed=42)
    df.to_csv(dataset_path, index=False)
    print(f"Dataset successfully generated and saved to {dataset_path}")
    print(f"Shape: {df.shape}")
    print("Class Distribution:")
    print(df["consumption_level"].value_counts(normalize=True))
