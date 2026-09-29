"""
Exploratory Data Analysis (EDA) Script for Electricity Consumption System
Performs statistical analysis and generates visualization figures into reports/figures/
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set visual style
plt.style.use("ggplot")
sns.set_theme(style="darkgrid", palette="viridis")
plt.rcParams["font.sans-serif"] = "Segoe UI"
plt.rcParams["axes.edgecolor"] = "#e2e8f0"
plt.rcParams["axes.linewidth"] = 0.8

def run_eda(dataset_path: str = "data/electricity_consumption.csv", output_dir: str = "reports/figures"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"Loading dataset from {dataset_path} for EDA...")
    
    df = pd.read_csv(dataset_path)
    
    print("\n--- DATASET OVERVIEW ---")
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("\nData Types & Non-Null Counts:")
    print(df.info())
    
    print("\nMissing Values:")
    print(df.isnull().sum())
    
    print("\nDuplicate Rows:", df.duplicated().sum())
    
    print("\nDescriptive Statistics:")
    print(df.describe())
    
    # 1. Target Class Distribution Plot
    plt.figure(figsize=(8, 5))
    class_counts = df["consumption_level"].value_counts()
    class_colors = {"LOW": "#10b981", "MEDIUM": "#3b82f6", "HIGH": "#ef4444"}
    
    bars = plt.bar(class_counts.index, class_counts.values, color=[class_colors[c] for c in class_counts.index], width=0.55)
    plt.title("Target Distribution: Electricity Consumption Levels", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Consumption Level Class", fontsize=12)
    plt.ylabel("Number of Samples", fontsize=12)
    
    for bar in bars:
        yval = bar.get_height()
        pct = yval / len(df) * 100
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 50, f"{yval:,}\n({pct:.1f}%)", ha="center", va="bottom", fontsize=10, fontweight="bold")
        
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "target_distribution.png"), dpi=300)
    plt.close()
    
    # 2. Continuous Consumption Distribution Plot
    plt.figure(figsize=(10, 5))
    sns.histplot(df["consumption_kwh"], kde=True, bins=50, color="#6366f1")
    plt.axvline(df["consumption_kwh"].quantile(0.3333), color="#10b981", linestyle="--", linewidth=2, label="Q1 (33.3% LOW)")
    plt.axvline(df["consumption_kwh"].quantile(0.6667), color="#ef4444", linestyle="--", linewidth=2, label="Q2 (66.7% HIGH)")
    plt.title("Distribution of Electricity Consumption (kWh)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Electricity Consumption (kWh)", fontsize=12)
    plt.ylabel("Frequency", fontsize=12)
    plt.legend(fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "consumption_distribution.png"), dpi=300)
    plt.close()
    
    # 3. Hourly Consumption Analysis
    plt.figure(figsize=(12, 5))
    hourly_avg = df.groupby("hour")["consumption_kwh"].mean().reset_index()
    sns.lineplot(data=hourly_avg, x="hour", y="consumption_kwh", marker="o", color="#3b82f6", linewidth=2.5, markersize=8)
    plt.title("Diurnal Electricity Consumption Profile (Hourly Average)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Hour of Day (0 - 23)", fontsize=12)
    plt.ylabel("Average Consumption (kWh)", fontsize=12)
    plt.xticks(range(0, 24))
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "hourly_analysis.png"), dpi=300)
    plt.close()
    
    # 4. Daily Consumption Analysis (Day of Week & Weekend vs Weekday)
    plt.figure(figsize=(10, 5))
    days_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}
    df["day_name"] = df["day_of_week"].map(days_map)
    daily_avg = df.groupby(["day_of_week", "day_name"])["consumption_kwh"].mean().reset_index()
    
    palette = ["#3b82f6" if d < 5 else "#f59e0b" for d in daily_avg["day_of_week"]]
    bars = plt.bar(daily_avg["day_name"], daily_avg["consumption_kwh"], color=palette, width=0.55)
    plt.title("Daily Average Electricity Consumption by Day of Week", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Day of Week", fontsize=12)
    plt.ylabel("Average Consumption (kWh)", fontsize=12)
    
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 0.05, f"{yval:.2f}", ha="center", va="bottom", fontsize=10)
        
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "daily_analysis.png"), dpi=300)
    plt.close()
    
    # 5. Monthly Consumption Analysis
    plt.figure(figsize=(11, 5))
    month_names = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 
                   7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
    df["month_name"] = df["month"].map(month_names)
    monthly_avg = df.groupby(["month", "month_name"])["consumption_kwh"].mean().reset_index().sort_values("month")
    
    sns.barplot(data=monthly_avg, x="month_name", y="consumption_kwh", palette="crest")
    plt.title("Seasonal Electricity Consumption Trend (Monthly Average)", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Month", fontsize=12)
    plt.ylabel("Average Consumption (kWh)", fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "monthly_analysis.png"), dpi=300)
    plt.close()
    
    # 6. Feature Correlation Matrix Heatmap
    plt.figure(figsize=(10, 8))
    numeric_cols = ["temperature", "humidity", "hour", "day", "month", "is_weekend", "occupancy", "previous_consumption", "appliance_usage", "consumption_kwh"]
    corr = df[numeric_cols].corr()
    
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, linewidths=0.5, square=True)
    plt.title("Pearson Feature Correlation Matrix", fontsize=14, fontweight="bold", pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "correlation_matrix.png"), dpi=300)
    plt.close()
    
    print(f"\nAll EDA charts saved successfully into '{output_dir}' directory.")

if __name__ == "__main__":
    run_eda()
