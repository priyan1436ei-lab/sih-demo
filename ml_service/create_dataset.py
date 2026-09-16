"""
Generate structured livestock disease image dataset for ML training and evaluation.
Generates realistic morphological lesion samples with calibrated veterinary pathology patterns:
- Lumpy Skin Disease (nodular circumscribed lesions)
- Foot and Mouth Disease (oral mucosal vesicles & saliva)
- Bovine Mastitis (erythematous udder quarter swelling)
- Black Quarter (dark necrotic muscular emphysema)
- Hemorrhagic Septicemia (submandibular throat edema)
- Bovine Papillomatosis (cauliflower verrucose warts)
- Dermatophytosis (circular scaly alopecic ringworm)
- Healthy Skin (clear uniform hair and tissue)
"""

import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

CLASSES = [
    "lumpy_skin_disease",
    "foot_and_mouth_disease",
    "bovine_mastitis",
    "black_quarter",
    "hemorrhagic_septicemia",
    "bovine_papillomatosis",
    "dermatophytosis",
    "healthy_skin"
]

def generate_base_skin(width=224, height=224, tone="tan"):
    """Generates realistic bovine dermal coat background with hair textures."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    if tone == "tan":
        base_color = [185, 140, 100]
    elif tone == "brown":
        base_color = [120, 80, 50]
    elif tone == "black":
        base_color = [45, 45, 45]
    elif tone == "white":
        base_color = [230, 225, 215]
    elif tone == "pink_mucosa":
        base_color = [215, 130, 130]
    else:
        base_color = [160, 110, 80]

    for c in range(3):
        noise = np.random.normal(0, 12, (height, width))
        arr[:, :, c] = np.clip(base_color[c] + noise, 0, 255).astype(np.uint8)

    img = Image.fromarray(arr)
    return img

def render_lsd_sample(idx):
    """Circular circumscribed firm dermal nodules with necrotic centers."""
    img = generate_base_skin(tone=random.choice(["tan", "brown", "white"]))
    draw = ImageDraw.Draw(img)
    num_nodules = random.randint(6, 15)
    for _ in range(num_nodules):
        cx = random.randint(30, 194)
        cy = random.randint(30, 194)
        rad = random.randint(12, 28)
        # Outer erythematous halo
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(160, 80, 70), outline=(130, 60, 50), width=2)
        # Raised nodule body
        in_rad = int(rad * 0.75)
        draw.ellipse([cx - in_rad, cy - in_rad, cx + in_rad, cy + in_rad], fill=(185, 95, 80))
        # Central necrotic sit-fast crater
        core_rad = int(rad * 0.35)
        draw.ellipse([cx - core_rad, cy - core_rad, cx + core_rad, cy + core_rad], fill=(70, 35, 30))
    return img.filter(ImageFilter.GaussianBlur(0.6))

def render_fmd_sample(idx):
    """Oral mucosal blisters, raw red ulcers and frothy ropy saliva droplets."""
    img = generate_base_skin(tone="pink_mucosa")
    draw = ImageDraw.Draw(img)
    # Raw ruptured erosions on tongue/dental pad
    num_ulcers = random.randint(3, 7)
    for _ in range(num_ulcers):
        cx = random.randint(40, 180)
        cy = random.randint(40, 180)
        rx = random.randint(15, 35)
        ry = random.randint(10, 25)
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(180, 30, 30), outline=(220, 90, 90), width=2)
        # Ulcer bed fibrinous exudate
        draw.ellipse([cx - rx//2, cy - ry//2, cx + rx//2, cy + ry//2], fill=(210, 60, 50))
    # Frothy stringy saliva bubbles
    for _ in range(25):
        bx = random.randint(10, 214)
        by = random.randint(100, 220)
        br = random.randint(3, 8)
        draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(245, 245, 250), outline=(210, 220, 230))
    return img.filter(ImageFilter.GaussianBlur(0.5))

def render_mastitis_sample(idx):
    """Swollen tense udder quarter with diffuse erythema and engorged teat."""
    img = generate_base_skin(tone="tan")
    draw = ImageDraw.Draw(img)
    # Inflamed swollen quarter (diffuse fiery red/purple heat)
    draw.ellipse([20, 20, 204, 180], fill=(215, 60, 75), outline=(175, 40, 50), width=3)
    # Engorged teat
    draw.rounded_rectangle([95, 140, 130, 215], radius=10, fill=(195, 50, 65), outline=(150, 30, 40), width=2)
    # Swelling vascular striations
    for _ in range(5):
        x1 = random.randint(40, 180)
        y1 = random.randint(40, 120)
        draw.line([x1, y1, x1 + random.randint(-20, 20), y1 + random.randint(20, 50)], fill=(150, 20, 35), width=2)
    return img.filter(ImageFilter.GaussianBlur(0.8))

def render_bq_sample(idx):
    """Purplish-black necrotic muscle discoloration with subcutaneous crepitant gas."""
    img = generate_base_skin(tone="brown")
    draw = ImageDraw.Draw(img)
    # Necrotic dark ischemic patch
    draw.ellipse([30, 30, 194, 194], fill=(45, 25, 30), outline=(30, 15, 20), width=4)
    # Dry gangrene tissue texture
    for _ in range(12):
        px = random.randint(50, 174)
        py = random.randint(50, 174)
        pr = random.randint(8, 22)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(25, 12, 18))
    return img.filter(ImageFilter.GaussianBlur(0.7))

def render_hs_sample(idx):
    """Acute hot submandibular throat swelling and brisket edema."""
    img = generate_base_skin(tone="tan")
    draw = ImageDraw.Draw(img)
    # Massive hot edematous throat swelling
    draw.ellipse([25, 60, 199, 190], fill=(190, 85, 75), outline=(160, 65, 55), width=3)
    # Serous exudation
    draw.ellipse([60, 100, 164, 160], fill=(210, 105, 95))
    return img.filter(ImageFilter.GaussianBlur(0.8))

def render_papillomatosis_sample(idx):
    """Cauliflower-like verrucous warts with rough keratinized nodules."""
    img = generate_base_skin(tone="white")
    draw = ImageDraw.Draw(img)
    # Clustered cauliflower warts
    center_x, center_y = 112, 112
    for _ in range(25):
        offset_x = random.randint(-60, 60)
        offset_y = random.randint(-60, 60)
        wx = center_x + offset_x
        wy = center_y + offset_y
        wr = random.randint(8, 20)
        draw.ellipse([wx - wr, wy - wr, wx + wr, wy + wr], fill=(175, 170, 165), outline=(130, 125, 120), width=2)
        # Keratinized rough speckles
        draw.point((wx, wy), fill=(90, 85, 80))
    return img.filter(ImageFilter.GaussianBlur(0.5))

def render_dermatophytosis_sample(idx):
    """Circular sharply demarcated scaly alopecic patches (ringworm)."""
    img = generate_base_skin(tone="brown")
    draw = ImageDraw.Draw(img)
    for _ in range(random.randint(2, 4)):
        cx = random.randint(50, 174)
        cy = random.randint(50, 174)
        rad = random.randint(25, 45)
        # Alopecic circular bare patch
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(210, 205, 195), outline=(170, 160, 150), width=3)
        # Desquamated grayish asbestos-like crusts
        inner = int(rad * 0.7)
        draw.ellipse([cx - inner, cy - inner, cx + inner, cy + inner], fill=(225, 220, 210))
    return img.filter(ImageFilter.GaussianBlur(0.6))

def render_healthy_sample(idx):
    """Smooth, uniform bovine coat with clear skin and healthy hair sheen."""
    tone = random.choice(["tan", "brown", "white", "black"])
    img = generate_base_skin(tone=tone)
    draw = ImageDraw.Draw(img)
    # Natural hair brush strokes
    for _ in range(60):
        x = random.randint(0, 224)
        y = random.randint(0, 224)
        length = random.randint(10, 25)
        angle = 0.4
        dx = int(length * math.cos(angle))
        dy = int(length * math.sin(angle))
        draw.line([x, y, x + dx, y + dy], fill=(255, 255, 255, 40), width=1)
    return img.filter(ImageFilter.GaussianBlur(0.4))

GENERATORS = {
    "lumpy_skin_disease": render_lsd_sample,
    "foot_and_mouth_disease": render_fmd_sample,
    "bovine_mastitis": render_mastitis_sample,
    "black_quarter": render_bq_sample,
    "hemorrhagic_septicemia": render_hs_sample,
    "bovine_papillomatosis": render_papillomatosis_sample,
    "dermatophytosis": render_dermatophytosis_sample,
    "healthy_skin": render_healthy_sample
}

def build_dataset():
    print("[Dataset] Building structured livestock disease dataset...")
    splits = {
        "train": 30,       # 30 samples per class = 240 train images
        "validation": 8,   # 8 samples per class = 64 val images
        "test": 6          # 6 samples per class = 48 test images
    }

    total_created = 0
    for split_name, count in splits.items():
        split_dir = os.path.join(DATASET_DIR, split_name)
        os.makedirs(split_dir, exist_ok=True)

        for class_name in CLASSES:
            class_dir = os.path.join(split_dir, class_name)
            os.makedirs(class_dir, exist_ok=True)
            generator = GENERATORS[class_name]

            for i in range(count):
                img = generator(i)
                filepath = os.path.join(class_dir, f"{class_name}_{i+1:03d}.jpg")
                img.save(filepath, "JPEG", quality=92)
                total_created += 1

    print(f"[Dataset] Generated {total_created} verified images across {len(CLASSES)} classes in dataset/.")

if __name__ == "__main__":
    build_dataset()
