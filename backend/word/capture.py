import os
import cv2
import time
import numpy as np
import mediapipe as mp

# ================= CONFIG =================
DATA_DIR = "data/word_sequences"
SEQUENCE_LENGTH = 15
SAMPLES_PER_WORD = 50
HAND_ABSENCE_TIME = 2.0
MIN_HANDS = 1  # Minimum hands required for this word (set per word)
MAX_HANDS = 2  # Maximum hands allowed for this word (set per word)
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
        # Always take best 2 hands, sorted Left then Right
        hands_data = hands_data[:2]
        hands_data.sort(key=lambda x: 0 if x[1] == "Left" else 1)
        return hands_data[0][0] + hands_data[1][0]

    elif len(hands_data) == 1:
        return hands_data[0][0] + [0.0] * 63

    return None

# Get word and hand config
word = input("Enter WORD label: ").strip().upper()
min_hands_input = input(f"Enter MIN hands for '{word}' (1 or 2, default 1): ").strip()
MAX_HANDS = 2  # Fixed for 126 features
MIN_HANDS = int(min_hands_input) if min_hands_input.isdigit() else 1

word_path = os.path.join(DATA_DIR, word)
os.makedirs(word_path, exist_ok=True)

# 🔥 clear old data
for f in os.listdir(word_path):
    os.remove(os.path.join(word_path, f))

sample_count = 0
recording = False
sequence = []
last_hand_time = None
hand_count_history = []  # To stabilize hand count

print(f"\n📌 Collecting word: {word} (requires {MIN_HANDS}-{MAX_HANDS} hands)")
print("✋ Perform gesture → Hold steady → Drop hands for 2 seconds\n")
print("💡 For single hand: Show only one hand clearly, hold longer if needed")

while sample_count < SAMPLES_PER_WORD:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    landmarks = get_landmarks(results)
    hand_detected = landmarks is not None
    current_num_hands = len(results.multi_hand_landmarks) if results.multi_hand_landmarks else 0

    # Stabilize hand count with history (average over last 5 frames)
    hand_count_history.append(current_num_hands)
    if len(hand_count_history) > 15:
        hand_count_history.pop(0)

# Use mode (most frequent) instead of average
    if hand_count_history:
        stable_num_hands = max(set(hand_count_history), key=hand_count_history.count)
    else:
        stable_num_hands = 0

    # Check if matches required hands
    hands_match = MIN_HANDS <= stable_num_hands <= MAX_HANDS

    if hand_detected and hands_match:
        last_hand_time = time.time()

        if not recording:
            recording = True
            sequence = []
            print(f"🟢 Recording started ({stable_num_hands} hands)")

        sequence.append(landmarks)
        if len(sequence) > SEQUENCE_LENGTH:
            sequence = sequence[-SEQUENCE_LENGTH:]

        # Draw landmarks with different colors for left/right
        for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
            hand_color = (0, 255, 0) if handedness.classification[0].label == 'Left' else (255, 0, 0)
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                                 mp_draw.DrawingSpec(color=hand_color, thickness=2),
                                 mp_draw.DrawingSpec(color=hand_color, thickness=2))

    else:
        if recording and last_hand_time:
            if time.time() - last_hand_time >= HAND_ABSENCE_TIME:
                recording = False

                if len(sequence) >= SEQUENCE_LENGTH:
                    np.save(
                        os.path.join(word_path, f"{sample_count}.npy"),
                        np.array(sequence)
                    )
                    sample_count += 1
                    print(f"✅ Saved {word} {sample_count}/{SAMPLES_PER_WORD}")
                else:
                    print(f"⚠ Sequence too short ({len(sequence)}/{SEQUENCE_LENGTH}), discarded")

                sequence = []
                last_hand_time = None
                hand_count_history = []

    # UI
    status = f"{stable_num_hands} hands (need {MIN_HANDS}-{MAX_HANDS})"
    color = (0, 255, 0) if hand_detected and hands_match else (0, 0, 255)

    cv2.putText(frame, status, (10, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    cv2.putText(frame, f"{word} {sample_count}/{SAMPLES_PER_WORD}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(frame, "Press ESC to stop", (10, frame.shape[0] - 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow("Word Data Collection", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

print(f"\n✔ Completed {word} ({sample_count} samples)")
cap.release()
cv2.destroyAllWindows()
