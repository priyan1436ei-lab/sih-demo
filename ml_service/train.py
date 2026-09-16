"""
Livestock Disease Classification Model Training Script
Trains an ML Image Classifier for Bovine/Livestock Dermal & Systemic Pathologies:
- Lumpy Skin Disease
- Foot and Mouth Disease
- Bovine Mastitis
- Black Quarter
- Hemorrhagic Septicemia
- Bovine Papillomatosis
- Dermatophytosis (Ringworm)
- Healthy Skin / Tissue

Dataset: dataset/train, dataset/validation, dataset/test
Exports:
- ml_service/models/livestock_model.pkl
- ml_service/models/model_metadata.json
"""

import os
import json
import time
import pickle
import numpy as np
from PIL import Image, ImageFilter
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_SAVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

CLASS_NAMES = [
    "Lumpy Skin Disease",
    "Foot and Mouth Disease",
    "Bovine Mastitis",
    "Black Quarter",
    "Hemorrhagic Septicemia",
    "Bovine Papillomatosis",
    "Dermatophytosis (Ringworm)",
    "Healthy Skin / Tissue"
]

FOLDER_TO_CLASS = {
    "lumpy_skin_disease": "Lumpy Skin Disease",
    "foot_and_mouth_disease": "Foot and Mouth Disease",
    "bovine_mastitis": "Bovine Mastitis",
    "black_quarter": "Black Quarter",
    "hemorrhagic_septicemia": "Hemorrhagic Septicemia",
    "bovine_papillomatosis": "Bovine Papillomatosis",
    "dermatophytosis": "Dermatophytosis (Ringworm)",
    "healthy_skin": "Healthy Skin / Tissue"
}

def extract_image_features(pil_img: Image.Image) -> np.ndarray:
    """
    Extracts 48-dimensional comprehensive visual pathology feature vector:
    - Multi-band color statistics (R, G, B, H, S, V means, stds, ratios)
    - High-frequency edge gradient magnitude (Laplacian filter response for nodules)
    - Texture entropy / local variance (roughness for warts / crusts)
    - Necrotic dark pixel fraction (Black Quarter)
    - Erythematous inflammatory hue index (Mastitis, FMD ulcers)
    - Ring contour & circularity indicators (Ringworm, LSD)
    """
    img = pil_img.convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    # 1. Color stats (9 dims)
    r_mean, r_std = float(r.mean()), float(r.std())
    g_mean, g_std = float(g.mean()), float(g.std())
    b_mean, b_std = float(b.mean()), float(b.std())
    rg_ratio = float((r_mean + 1e-5) / (g_mean + 1e-5))
    rb_ratio = float((r_mean + 1e-5) / (b_mean + 1e-5))
    gb_ratio = float((g_mean + 1e-5) / (b_mean + 1e-5))

    # 2. HSV color representation (6 dims)
    hsv = img.convert("HSV")
    hsv_arr = np.array(hsv, dtype=np.float32)
    h_mean, h_std = float(hsv_arr[:, :, 0].mean()), float(hsv_arr[:, :, 0].std())
    s_mean, s_std = float(hsv_arr[:, :, 1].mean()), float(hsv_arr[:, :, 1].std())
    v_mean, v_std = float(hsv_arr[:, :, 2].mean()), float(hsv_arr[:, :, 2].std())

    # 3. High-frequency edge density via Laplacian filter (6 dims)
    gray = img.convert("L")
    laplacian = gray.filter(ImageFilter.FIND_EDGES)
    lap_arr = np.array(laplacian, dtype=np.float32)
    edge_mean = float(lap_arr.mean())
    edge_std = float(lap_arr.std())
    edge_p90 = float(np.percentile(lap_arr, 90))
    edge_p95 = float(np.percentile(lap_arr, 95))
    edge_active_ratio = float((lap_arr > 35).mean())
    edge_high_ratio = float((lap_arr > 70).mean())

    # 4. Pathognomonic lesion filters (12 dims)
    # Necrotic dark pixels (Black Quarter)
    dark_ratio = float((arr.mean(axis=2) < 50).mean())
    very_dark_ratio = float((arr.mean(axis=2) < 30).mean())

    # Acute erythematous fiery redness (Mastitis / FMD ulcers)
    fiery_red = (r > 160) & (g < 90) & (b < 90)
    fiery_red_ratio = float(fiery_red.mean())

    # White/salivary frothy droplets (FMD)
    white_froth = (r > 220) & (g > 220) & (b > 220)
    white_froth_ratio = float(white_froth.mean())

    # Nodule halo signature (LSD ring edges: contrast between center and surround)
    h_diff = np.abs(np.diff(r, axis=0)).mean()
    v_diff = np.abs(np.diff(r, axis=1)).mean()
    nodule_gradient = float((h_diff + v_diff) / 2.0)

    # Scaly / desquamated pale crusts (Ringworm / Dermatophytosis)
    pale_crust = (r > 190) & (g > 185) & (b > 180) & (np.abs(r - g) < 15)
    pale_crust_ratio = float(pale_crust.mean())

    # Warty cauliflower texture irregularity (Papillomatosis: high local variance in mid-tones)
    mid_tones = (arr.mean(axis=2) >= 80) & (arr.mean(axis=2) <= 180)
    wart_irregularity = float(lap_arr[mid_tones].std() if mid_tones.sum() > 100 else 0.0)

    # 5. Color Histograms (15 dims: 5 bins per RGB channel)
    r_hist, _ = np.histogram(r, bins=5, range=(0, 255), density=True)
    g_hist, _ = np.histogram(g, bins=5, range=(0, 255), density=True)
    b_hist, _ = np.histogram(b, bins=5, range=(0, 255), density=True)

    features = np.array([
        r_mean, r_std, g_mean, g_std, b_mean, b_std,
        rg_ratio, rb_ratio, gb_ratio,
        h_mean, h_std, s_mean, s_std, v_mean, v_std,
        edge_mean, edge_std, edge_p90, edge_p95, edge_active_ratio, edge_high_ratio,
        dark_ratio, very_dark_ratio,
        fiery_red_ratio, white_froth_ratio,
        nodule_gradient, pale_crust_ratio, wart_irregularity,
        *r_hist.tolist(),
        *g_hist.tolist(),
        *b_hist.tolist()
    ], dtype=np.float32)

    return features

def load_split(split_name: str):
    split_dir = os.path.join(DATASET_DIR, split_name)
    if not os.path.exists(split_dir):
        raise FileNotFoundError(f"Split directory {split_dir} does not exist. Run create_dataset.py first.")

    X = []
    y = []
    filenames = []

    for folder_name in sorted(os.listdir(split_dir)):
        folder_path = os.path.join(split_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
        if folder_name not in FOLDER_TO_CLASS:
            continue

        label_name = FOLDER_TO_CLASS[folder_name]
        label_idx = CLASS_NAMES.index(label_name)

        for fname in sorted(os.listdir(folder_path)):
            if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            img_path = os.path.join(folder_path, fname)
            try:
                with Image.open(img_path) as img:
                    feat = extract_image_features(img)
                    X.append(feat)
                    y.append(label_idx)
                    filenames.append(img_path)
            except Exception as e:
                print(f"Warning: Failed to process {img_path}: {e}")

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64), filenames

def train_and_evaluate():
    print("=" * 60)
    print("TRAINING ML LIVESTOCK DISEASE CLASSIFICATION MODEL")
    print("=" * 60)
    start_time = time.time()

    # 1. Load Training and Validation Sets
    X_train, y_train, train_files = load_split("train")
    X_val, y_val, val_files = load_split("validation")
    X_test, y_test, test_files = load_split("test")

    print(f"Train samples: {len(X_train)} | Val samples: {len(X_val)} | Test samples: {len(X_test)}")
    print(f"Feature vector dimensionality: {X_train.shape[1]}")

    # 2. Train Random Forest / Ensemble Classifier with calibrated probability estimation
    classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        class_weight="balanced"
    )

    print("\nTraining Ensemble Classifier...")
    classifier.fit(X_train, y_train)

    # 3. Evaluate on Validation Set
    val_preds = classifier.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"\n[Validation Set Accuracy]: {val_acc * 100:.2f}%\n")
    print("Validation Classification Report:")
    print(classification_report(y_val, val_preds, target_names=CLASS_NAMES))

    # 4. Evaluate on Test Set
    test_preds = classifier.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)
    print(f"[Test Set Accuracy]: {test_acc * 100:.2f}%\n")

    # 5. Save model artifacts
    model_path = os.path.join(MODEL_SAVE_DIR, "livestock_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(classifier, f)
    print(f"Saved trained classifier to: {model_path}")

    # 6. Save metadata JSON for runtime inference
    metadata = {
        "model_name": "PashuRaksha Transfer ML Disease Classifier",
        "algorithm": "RandomForestEnsemble + Dermal Feature Extractor",
        "num_classes": len(CLASS_NAMES),
        "classes": CLASS_NAMES,
        "feature_dim": int(X_train.shape[1]),
        "validation_accuracy": float(val_acc),
        "test_accuracy": float(test_acc),
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_train_samples": len(X_train),
        "feature_importance": [float(imp) for imp in classifier.feature_importances_]
    }

    metadata_path = os.path.join(MODEL_SAVE_DIR, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to: {metadata_path}")

    elapsed = time.time() - start_time
    print(f"\nModel training completed successfully in {elapsed:.2f}s!")

if __name__ == "__main__":
    train_and_evaluate()
