import sys
import json
import numpy as np
from PIL import Image
import os
import onnxruntime as ort

# Suppress TensorFlow logs (not needed anymore)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

MODEL_DIR = os.path.dirname(__file__)

# --- LOAD MODELS ONCE ---
DETECTION_ONNX = os.path.join(MODEL_DIR, 'pothole_detection_v3.onnx')
SEVERITY_ONNX  = os.path.join(MODEL_DIR, 'pothole_severity_v2.onnx')

print("Loading pothole detection model...", file=sys.stderr)
detection_session = ort.InferenceSession(DETECTION_ONNX)
detection_input_name = detection_session.get_inputs()[0].name
print("✅ Detection model loaded", file=sys.stderr)

print("Loading severity model...", file=sys.stderr)
severity_session = ort.InferenceSession(SEVERITY_ONNX)
severity_input_name = severity_session.get_inputs()[0].name
print("✅ Severity model loaded", file=sys.stderr)


# --- PREPROCESSING ---
def preprocess_image(img: Image.Image, size: int) -> np.ndarray:
    """Resize, normalize to [0,1], HWC→CHW, add batch dimension."""
    img = img.convert('RGB').resize((size, size))
    arr = np.array(img).astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))  # HWC → CHW
    arr = np.expand_dims(arr, 0)        # Add batch
    return arr


def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()


# --- PREDICTION ---
def predict_pothole(image_path):
    img = Image.open(image_path)
    inp = preprocess_image(img, size=260)  # EfficientNet-B2 input size
    output = detection_session.run(None, {detection_input_name: inp})
    confidence = float(output[0][0][0])  # already sigmoid in ONNX
    return confidence


def predict_severity(image_path):
    img = Image.open(image_path)
    inp = preprocess_image(img, size=260)
    output = severity_session.run(None, {severity_input_name: inp})
    logits = output[0][0]
    probs = softmax(logits)
    severity_labels = ['non_severe', 'severe']
    pred_idx = int(np.argmax(probs))
    return severity_labels[pred_idx], float(np.max(probs))


# --- MAIN ENTRY ---
if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        mode = sys.argv[2] if len(sys.argv) > 2 else 'detect'

        if mode == 'severity':
            severity, sev_conf = predict_severity(image_path)
            print(json.dumps({"severity": severity, "severity_confidence": sev_conf}))
        else:
            confidence = predict_pothole(image_path)
            print(json.dumps({"confidence": confidence}))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)