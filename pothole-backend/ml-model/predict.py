import sys
import os
import json
import numpy as np
from PIL import Image
import onnxruntime as ort

# ── Suppress verbose logs ────────────────────────────────────────────────
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import logging
logging.getLogger('onnxruntime').setLevel(logging.ERROR)

# ── MODEL PATHS ─────────────────────────────────────────────────────────
MODEL_DIR = os.path.dirname(__file__)
DETECTION_MODEL_PATH = os.path.join(MODEL_DIR, 'pothole_detection_v3.onnx')
SEVERITY_MODEL_PATH  = os.path.join(MODEL_DIR, 'pothole_severity_v2.onnx')

# ── LOAD ONNX SESSIONS (once) ──────────────────────────────────────────
print("🔄 Loading ONNX models...", file=sys.stderr)
detection_session = ort.InferenceSession(DETECTION_MODEL_PATH, providers=['CPUExecutionProvider'])
severity_session  = ort.InferenceSession(SEVERITY_MODEL_PATH,  providers=['CPUExecutionProvider'])
severity_input_name = severity_session.get_inputs()[0].name
print("✅ Models loaded", file=sys.stderr)

# ── HELPER FUNCTIONS ────────────────────────────────────────────────────
def preprocess_image(image_path, img_size=260):
    """
    Load image, convert to RGB, resize and normalize to [0,1], then return CHW + batch.
    """
    img = Image.open(image_path).convert('RGB')
    arr = np.array(img.resize((img_size, img_size)), dtype=np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))   # HWC → CHW
    return np.expand_dims(arr, axis=0)   # Add batch dimension

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()

# ── PREDICTION FUNCTIONS ───────────────────────────────────────────────
def predict_pothole(image_path):
    """
    Returns detection confidence (0 → normal, 1 → pothole)
    """
    inp = preprocess_image(image_path, img_size=260)
    output = detection_session.run(None, {'image': inp})
    confidence = float(output[0][0][0])
    return confidence

def predict_severity(image_path):
    """
    Returns severity label ('non_severe' or 'severe') and confidence
    """
    inp = preprocess_image(image_path, img_size=260)
    outputs = severity_session.run(None, {severity_input_name: inp})
    logits = outputs[0][0]
    probs = softmax(logits)
    classes = ['non_severe', 'severe']
    pred_idx = int(np.argmax(probs))
    return classes[pred_idx], float(np.max(probs))

# ── MAIN ENTRY ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        mode = sys.argv[2] if len(sys.argv) > 2 else 'detect'

        if mode == 'severity':
            severity, conf = predict_severity(image_path)
            print(json.dumps({"severity": severity, "severity_confidence": conf}))
        else:
            conf = predict_pothole(image_path)
            print(json.dumps({"confidence": conf}))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)