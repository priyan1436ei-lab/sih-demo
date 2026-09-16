# Livestock Disease Image Classification Dataset

This directory structure organizes verified veterinary datasets for training lightweight transfer-learning image classification models (EfficientNet / MobileNetV3 / EfficientNet-Lite).

## Directory Structure

```
dataset/
├── train/                      # Training dataset (approx 70-80% of data)
│   ├── lumpy_skin_disease/
│   ├── foot_and_mouth_disease/
│   ├── mastitis/
│   ├── black_quarter/
│   ├── hemorrhagic_septicemia/
│   ├── anthrax/
│   ├── ringworm/
│   └── healthy/
├── validation/                 # Validation dataset (approx 10-15% of data)
│   ├── lumpy_skin_disease/
│   ├── foot_and_mouth_disease/
│   ├── mastitis/
│   ├── black_quarter/
│   ├── hemorrhagic_septicemia/
│   ├── anthrax/
│   ├── ringworm/
│   └── healthy/
└── test/                       # Held-out test dataset (approx 10-15% of data)
    ├── lumpy_skin_disease/
    ├── foot_and_mouth_disease/
    ├── mastitis/
    ├── black_quarter/
    ├── hemorrhagic_septicemia/
    ├── anthrax/
    ├── ringworm/
    └── healthy/
```

## Separation of User Images

> [!IMPORTANT]
> Real farmer uploads and live camera captures are stored exclusively in **Firebase Storage** under `user_images/{userId}/{animalId}/`.
> They are **NEVER** automatically added into the training or validation splits without expert veterinary verification and data labeling consent.

## Recommended Public & Verified Datasets

1. **Lumpy Skin Disease Dataset (Mendeley Data)**:
   - Contains confirmed field images of cutaneous nodules in cattle and buffalo.
   - DOI / Reference: Mendeley Data - Cattle Lumpy Skin Disease Image Dataset.
2. **Cattle Diseases Classification Dataset (Kaggle)**:
   - Images covering Bovine Mastitis, Dermatophytosis (Ringworm), Foot and Mouth Disease (vesicles and lesions), and Healthy livestock skin.
3. **Veterinary Clinical Image Bank (ICAR - Indian Veterinary Research Institute / FAO)**:
   - Clinical mucosal, oral, udder, and skin manifestations for tropical livestock diseases.

## Training the Model

See `ml_service/train.py` for the transfer-learning pipeline using MobileNetV3-Large or EfficientNet-B0.
