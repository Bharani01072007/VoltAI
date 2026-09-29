"""
Machine Learning Training, Evaluation & Serialization Pipeline
Trains Logistic Regression, Random Forest, and Support Vector Machine models.
Evaluates using Accuracy, Precision, Recall, F1-score, and Confusion Matrix.
Selects best model and serializes the complete sklearn Pipeline using joblib.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

# Feature definition matching backend schema & frontend forms
FEATURE_COLS = [
    "temperature",
    "humidity",
    "hour",
    "day",
    "month",
    "is_weekend",
    "occupancy",
    "previous_consumption",
    "appliance_usage",
]
TARGET_COL = "consumption_level"
CLASS_LABELS = ["LOW", "MEDIUM", "HIGH"]

def train_and_evaluate(
    dataset_path: str = "data/electricity_consumption.csv",
    reports_dir: str = "reports",
    model_dir: str = "backend/model",
):
    os.makedirs(reports_dir, exist_ok=True)
    os.makedirs(os.path.join(reports_dir, "figures"), exist_ok=True)
    os.makedirs(model_dir, exist_ok=True)

    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    # Stratified Train/Test Split (80/20) - prevents data leakage and preserves class distribution
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Dataset Split: Train={X_train.shape[0]} samples, Test={X_test.shape[0]} samples")

    # Define Preprocessor Transformer (fitted strictly on X_train)
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURE_COLS)
        ],
        remainder="passthrough",
    )

    # Dictionary of candidates to evaluate
    models_config = {
        "Logistic Regression": {
            "family": "Generalized Linear Model",
            "model": LogisticRegression(
                max_iter=1000, solver="lbfgs", random_state=42
            ),
            "hyperparams": {
                "C": 1.0,
                "solver": "lbfgs",
                "max_iter": 1000,
            },
        },
        "Random Forest": {
            "family": "Ensemble Decision Trees (Bagging)",
            "model": RandomForestClassifier(
                n_estimators=150, max_depth=12, min_samples_split=4, random_state=42, n_jobs=-1
            ),
            "hyperparams": {
                "n_estimators": 150,
                "max_depth": 12,
                "min_samples_split": 4,
                "criterion": "gini",
            },
        },
        "Support Vector Machine": {
            "family": "Kernel Machine (RBF Kernel)",
            "model": SVC(
                C=2.0, kernel="rbf", gamma="scale", probability=True, random_state=42
            ),
            "hyperparams": {
                "C": 2.0,
                "kernel": "rbf",
                "gamma": "scale",
                "probability": True,
            },
        },
    }

    results = []
    trained_pipelines = {}
    confusion_matrices = {}
    feature_importances_dict = {}

    for name, config in models_config.items():
        print(f"\n--- Training {name} ---")
        
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", config["model"])
        ])
        
        # Fit on training data ONLY to strictly avoid data leakage
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline

        # Predict on unseen test set
        y_pred = pipeline.predict(X_test)
        
        # Compute exact metrics
        acc = accuracy_score(y_test, y_pred)
        prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
        f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
        
        prec_weighted = precision_score(y_test, y_pred, average="weighted", zero_division=0)
        rec_weighted = recall_score(y_test, y_pred, average="weighted", zero_division=0)
        f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

        cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS)
        confusion_matrices[name] = cm.tolist()

        print(f"Results for {name}:")
        print(f"  Accuracy:         {acc:.4f}")
        print(f"  Precision (Macro):{prec_macro:.4f}")
        print(f"  Recall (Macro):   {rec_macro:.4f}")
        print(f"  F1 Score (Macro): {f1_macro:.4f}")
        print(f"  Confusion Matrix:\n{cm}")

        # Generate and save Confusion Matrix figure
        plt.figure(figsize=(7, 6))
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=CLASS_LABELS,
            yticklabels=CLASS_LABELS,
            cbar=False,
            annot_kws={"size": 14, "weight": "bold"},
        )
        plt.title(f"Confusion Matrix: {name}", fontsize=14, fontweight="bold", pad=12)
        plt.xlabel("Predicted Class", fontsize=12)
        plt.ylabel("Actual Class", fontsize=12)
        plt.tight_layout()
        
        fig_name = f"confusion_matrix_{name.lower().replace(' ', '_')}.png"
        fig_path = os.path.join(reports_dir, "figures", fig_name)
        plt.savefig(fig_path, dpi=300)
        plt.close()

        # Feature importances (if tree-based)
        classifier = pipeline.named_steps["classifier"]
        if hasattr(classifier, "feature_importances_"):
            importances = classifier.feature_importances_
            feat_imp = [
                {
                    "feature": feat,
                    "importance": round(float(imp), 4),
                    "label": feat.replace("_", " ").title(),
                }
                for feat, imp in sorted(zip(FEATURE_COLS, importances), key=lambda x: x[1], reverse=True)
            ]
            feature_importances_dict[name] = feat_imp
            
            # Save feature importance chart for Random Forest
            plt.figure(figsize=(9, 5))
            df_imp = pd.DataFrame(feat_imp)
            sns.barplot(data=df_imp, x="importance", y="label", palette="mako")
            plt.title(f"Feature Importance: {name}", fontsize=14, fontweight="bold", pad=12)
            plt.xlabel("Gini Importance", fontsize=12)
            plt.ylabel("Feature", fontsize=12)
            plt.tight_layout()
            plt.savefig(os.path.join(reports_dir, "figures", "feature_importance.png"), dpi=300)
            plt.close()

        results.append({
            "model_name": name,
            "algorithm_family": config["family"],
            "accuracy": round(float(acc), 4),
            "precision_macro": round(float(prec_macro), 4),
            "recall_macro": round(float(rec_macro), 4),
            "f1_score_macro": round(float(f1_macro), 4),
            "precision_weighted": round(float(prec_weighted), 4),
            "recall_weighted": round(float(rec_weighted), 4),
            "f1_score_weighted": round(float(f1_weighted), 4),
            "hyperparameters": config["hyperparams"],
        })

    # Convert results to DataFrame & Save CSV
    results_df = pd.DataFrame(results)
    results_csv_path = os.path.join(reports_dir, "model_results.csv")
    results_df.to_csv(results_csv_path, index=False)
    print(f"\nModel evaluation metrics saved to {results_csv_path}")

    # Select Best Model based on actual macro F1 Score
    best_result = max(results, key=lambda x: x["f1_score_macro"])
    best_name = best_result["model_name"]
    best_pipeline = trained_pipelines[best_name]

    print(f"\n==================================================")
    print(f"BEST PERFORMING MODEL: {best_name}")
    print(f"  F1 Score (Macro): {best_result['f1_score_macro']}")
    print(f"  Accuracy:         {best_result['accuracy']}")
    print(f"==================================================")

    # Serialize Best Model Pipeline using joblib
    saved_model_path = os.path.join(model_dir, "electricity_prediction_model.pkl")
    joblib.dump(best_pipeline, saved_model_path)
    print(f"Serialized complete ML pipeline saved to: {saved_model_path}")

    # Save detailed metadata JSON for backend serving & frontend synchronization
    metadata = {
        "best_model_name": best_name,
        "feature_cols": FEATURE_COLS,
        "class_labels": CLASS_LABELS,
        "results": results,
        "confusion_matrices": confusion_matrices,
        "feature_importances": feature_importances_dict.get(best_name, []),
        "test_samples": int(X_test.shape[0]),
        "total_samples": int(df.shape[0]),
    }
    
    metadata_path = os.path.join(model_dir, "metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Model metadata JSON saved to: {metadata_path}")

if __name__ == "__main__":
    train_and_evaluate()
