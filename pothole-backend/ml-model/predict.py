import sys
import json
import numpy as np
from tensorflow import keras
from PIL import Image
import os

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=all, 1=info, 2=warnings, 3=errors
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

def predict_pothole(image_path):
    try:
        # Load model
        model_path = os.path.join(os.path.dirname(__file__), 'pothole-v1.keras')
        model = keras.models.load_model(model_path)
        
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((180, 180))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        prediction = model.predict(img_array, verbose=0)
        confidence = float(prediction[0][0])
        
        return confidence
    except Exception as e:
        print(f"Error in prediction: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    try:
        image_path = sys.argv[1]
        confidence = predict_pothole(image_path)
        print(json.dumps({"confidence": confidence}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)