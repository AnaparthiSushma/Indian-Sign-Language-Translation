import json
import numpy as np
from collections import deque
from tensorflow.keras.models import load_model

# ================= CONFIG =================
MODEL_PATH = "word/models/word_model.h5"
LABEL_MAP_PATH = "word/models/word_label_map.json"

SEQUENCE_LENGTH = 20
FEATURES = 126

CONFIDENCE_THRESHOLD = 0.85
SMOOTHING_WINDOW = 3
# =========================================

model = load_model(MODEL_PATH)

with open(LABEL_MAP_PATH) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

sequence_buffer = []
prediction_queue = deque(maxlen=SMOOTHING_WINDOW)
last_word = ""

def predict_word(landmarks):
    global sequence_buffer, last_word

    # Skip empty frames
    if np.count_nonzero(landmarks) < 20:
        
        return None, 0.0

    sequence_buffer.append(landmarks)

    if len(sequence_buffer) < SEQUENCE_LENGTH:
        return None, 0.0

    # Keep only last 15 frames
    sequence_buffer = sequence_buffer[-SEQUENCE_LENGTH:]

    x = np.array(sequence_buffer, dtype=np.float32)
    x = x.reshape(1, SEQUENCE_LENGTH, FEATURES)

    probs = model.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))
    confidence = float(probs[idx])

    if confidence < CONFIDENCE_THRESHOLD:
        return None, confidence

    prediction_queue.append(idx)

    if prediction_queue.count(idx) > SMOOTHING_WINDOW // 2:
        word = label_map[idx]

        if word != last_word:
            last_word = word
            sequence_buffer = []   # Reset after prediction
            return word, confidence

    return None, confidence
