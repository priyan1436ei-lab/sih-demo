# ML Disease Classification Microservice

This microservice provides real-time livestock disease prediction using a transfer-learning image classification model (MobileNetV3 / EfficientNet-Lite).

## Setup & Running

1. **Install Dependencies:**
   ```bash
   cd ml_service
   pip install -r requirements.txt
   ```

2. **Training the Model (Transfer Learning):**
   Place your verified training and validation images inside `dataset/train/` and `dataset/validation/`, categorized by disease name folders:
   - `lumpy_skin_disease/`
   - `foot_and_mouth_disease/`
   - `bovine_mastitis/`
   - `black_quarter/`
   - `hemorrhagic_septicemia/`
   - `healthy_skin/`

   Then run:
   ```bash
   python train.py
   ```
   The trained weights will be saved to `ml_service/models/livestock_model.pt`.

3. **Start the FastAPI Microservice:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

4. **API Endpoints:**
   - `POST /predict`: Accepts direct file upload.
   - `POST /predict/base64`: Accepts JSON `{ "image": "<base64>" }`.
   - `GET /health`: Model status and available classes.
