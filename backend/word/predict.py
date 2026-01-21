import cv2
import json
import numpy as np
import mediapipe as mp
from collections import deque
from tensorflow.keras.models import load_model
import time
# ================= CONFIG =================
MODEL_PATH = "models/word_model.h5"
LABEL_MAP_PATH = "models/word_label_map.json"

SEQUENCE_LENGTH = 15
FEATURES = 126

CONFIDENCE_THRESHOLD = 0.75
SMOOTHING_WINDOW = 3
HAND_ABSENCE_TIME = 1.5
# =========================================

# Load model + labels
model = load_model(MODEL_PATH)
with open(LABEL_MAP_PATH) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    model_complexity=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

cap = cv2.VideoCapture(0)

sequence = []
prediction_queue = deque(maxlen=SMOOTHING_WINDOW)
last_word = ""
last_hand_time = None

def get_landmarks(results):
    if not results.multi_hand_landmarks:
        return None

    hands_data = []
    for hand_lms, handedness in zip(results.multi_hand_landmarks[:2], results.multi_handedness[:2]):
        lm = []
        for p in hand_lms.landmark:
            lm.extend([p.x, p.y, p.z])
        hands_data.append((lm, handedness.classification[0].label))

    if len(hands_data) == 2:
        hands_data.sort(key=lambda x: 0 if x[1] == "Left" else 1)
        return hands_data[0][0] + hands_data[1][0]
    elif len(hands_data) == 1:
        return hands_data[0][0] + [0.0]*63
    return None

print("🚀 Word realtime prediction started")
print("Perform word → hold → drop hands")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    landmarks = get_landmarks(results)
    hand_detected = landmarks is not None

    if hand_detected:
        last_hand_time = cv2.getTickCount() 

        sequence.append(landmarks)
        if len(sequence) > SEQUENCE_LENGTH:
            sequence = sequence[-SEQUENCE_LENGTH:]

        # Draw
        for h_lms in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, h_lms, mp_hands.HAND_CONNECTIONS)

    else:
        # When hands drop, try to predict
        if last_hand_time and len(sequence) >= SEQUENCE_LENGTH:
            x = np.array(sequence[-SEQUENCE_LENGTH:], dtype=np.float32)
            x = x.reshape(1, SEQUENCE_LENGTH, FEATURES)

            probs = model.predict(x, verbose=0)[0]
            idx = int(np.argmax(probs))
            conf = probs[idx]

            if conf >= CONFIDENCE_THRESHOLD:
                prediction_queue.append(idx)

                if prediction_queue.count(idx) > SMOOTHING_WINDOW//2:
                    word = label_map[idx]
                    if word != last_word:
                        last_word = word
                        print(f"🟢 Predicted: {word} ({conf:.2f})")

            sequence = []
            last_hand_time = None

    cv2.putText(frame, f"Last: {last_word}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    cv2.putText(frame, "Show word → hold → drop hands",
                (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    cv2.imshow("Word Realtime Test", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()
