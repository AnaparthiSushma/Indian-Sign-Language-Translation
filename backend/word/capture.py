import os
import cv2
import time
import numpy as np
import mediapipe as mp

# ================= CONFIG =================
DATA_DIR = "data/word_sequences"
SEQUENCE_LENGTH = 20
SAMPLES_PER_WORD = 60
HAND_ABSENCE_TIME = 1.5
# =========================================

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

def get_landmarks(results):
    if not results.multi_hand_landmarks or not results.multi_handedness:
        return None

    hands_data = []

    for hand_lms, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
        lm = []
        for p in hand_lms.landmark:
            lm.extend([p.x, p.y, p.z])
        label = handedness.classification[0].label
        hands_data.append((lm, label))

    if len(hands_data) >= 2:
        hands_data = hands_data[:2]
        hands_data.sort(key=lambda x: 0 if x[1] == "Left" else 1)
        return hands_data[0][0] + hands_data[1][0]

    elif len(hands_data) == 1:
        return hands_data[0][0] + [0.0] * 63

    return None


# ================= START =================

word = input("Enter WORD label: ").strip().upper()
word_path = os.path.join(DATA_DIR, word)
os.makedirs(word_path, exist_ok=True)

# Clear old data
for f in os.listdir(word_path):
    os.remove(os.path.join(word_path, f))

sample_count = 0
recording = False
sequence = []
last_hand_time = None

print(f"\n📌 Collecting word: {word}")
print("✋ Perform gesture → Hold steady → Drop hands\n")

while sample_count < SAMPLES_PER_WORD:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    landmarks = get_landmarks(results)
    hand_detected = landmarks is not None

    if hand_detected:
        last_hand_time = time.time()

        if not recording:
            recording = True
            sequence = []
            print("🟢 Recording...")

        if len(sequence) < SEQUENCE_LENGTH:
            sequence.append(landmarks)

        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    else:
        if recording and last_hand_time:
            if time.time() - last_hand_time >= HAND_ABSENCE_TIME:
                recording = False

                if len(sequence) == SEQUENCE_LENGTH:
                    np.save(
                        os.path.join(word_path, f"{sample_count}.npy"),
                        np.array(sequence)
                    )
                    sample_count += 1
                    print(f"✅ Saved {word} {sample_count}/{SAMPLES_PER_WORD}")
                else:
                    print("⚠ Sequence too short, discarded")

                sequence = []
                last_hand_time = None

    cv2.putText(frame, f"{word} {sample_count}/{SAMPLES_PER_WORD}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Word Data Collection", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

print(f"\n✔ Completed {word}")
cap.release()
cv2.destroyAllWindows()
