import sys
import json
import numpy as np
from tensorflow import keras
from PIL import Image
import os
import onnxruntime as ort

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

# ✅ Load both models ONCE at startup (not per request)
MODEL_DIR = os.path.dirname(__file__)

print("Loading pothole detection model...", file=sys.stderr)
detection_model = keras.models.load_model(os.path.join(MODEL_DIR, 'pothole-v1.keras'))
print("✅ Detection model loaded", file=sys.stderr)

print("Loading severity model...", file=sys.stderr)
severity_session = ort.InferenceSession(os.path.join(MODEL_DIR, 'pothole_severity_v2.onnx'))
severity_input_name = severity_session.get_inputs()[0].name
print("✅ Severity model loaded", file=sys.stderr)


def predict_pothole(image_path):
    img = Image.open(image_path).convert('RGB')

    # Detection (180x180)
    img_detection = img.resize((180, 180))
    img_array = np.array(img_detection) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = detection_model.predict(img_array, verbose=0)
    confidence = float(prediction[0][0])

    return confidence


def softmax(x):
    e_x = np.exp(x - np.max(x))  # stability trick
    return e_x / e_x.sum()

def predict_severity(image_path):
    img = Image.open(image_path).convert('RGB')
    img_severity = img.resize((260, 260))

    img_array = np.array(img_severity).astype(np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)

    outputs = severity_session.run(None, {severity_input_name: img_array})
    logits = outputs[0][0]

    # ✅ Convert logits → probabilities
    probs = softmax(logits)

    predicted_class = int(np.argmax(probs))
    severity_labels = ['non_severe', 'severe']
    severity = severity_labels[predicted_class]
    severity_confidence = float(np.max(probs))

    return severity, severity_confidence

if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        mode = sys.argv[2] if len(sys.argv) > 2 else 'detect'

        if mode == 'severity':
            severity, sev_confidence = predict_severity(image_path)
            print(json.dumps({
                "severity": severity,
                "severity_confidence": sev_confidence
            }))
        else:
            confidence = predict_pothole(image_path)
            print(json.dumps({"confidence": confidence}))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)