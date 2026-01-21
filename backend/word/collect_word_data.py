import os
import cv2
import time
import numpy as np
import mediapipe as mp

# ================= CONFIG =================
DATA_DIR = "data/word_sequences"
WORDS = ["HELLO", "YES", "NO", "THANKYOU", "PLEASE"]

SEQUENCE_LENGTH = 30
SAMPLES_PER_WORD = 60
HAND_ABSENCE_TIME = 2.0  # seconds (YOUR REQUIREMENT)
# =========================================

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

cap = cv2.VideoCapture(0)

for word in WORDS:
    word_path = os.path.join(DATA_DIR, word)
    os.makedirs(word_path, exist_ok=True)

    sample_count = len(os.listdir(word_path))
    print(f"\n📌 Collecting data for: {word}")
    print("✋ Do gesture → Drop hand for 2 seconds")

    recording = False
    sequence = []
    last_hand_time = None

    while sample_count < SAMPLES_PER_WORD:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        hand_detected = results.multi_hand_landmarks is not None

        if hand_detected:
            last_hand_time = time.time()

            if not recording:
                recording = True
                sequence = []
                print("🟢 Recording started")

            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])

                sequence.append(landmarks)
                mp_draw.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                )

        else:
            if recording and last_hand_time:
                if time.time() - last_hand_time >= HAND_ABSENCE_TIME:
                    recording = False

                    if len(sequence) >= SEQUENCE_LENGTH:
                        sequence = sequence[:SEQUENCE_LENGTH]

                        save_path = os.path.join(
                            word_path, f"{sample_count}.npy"
                        )
                        np.save(save_path, np.array(sequence))
                        sample_count += 1

                        print(f"✅ Saved {word} sample {sample_count}/{SAMPLES_PER_WORD}")

                    else:
                        print("⚠ Gesture too short, sample discarded")

                    sequence = []
                    last_hand_time = None

        cv2.putText(
            frame,
            f"{word} | {sample_count}/{SAMPLES_PER_WORD}",
            (10, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.imshow("Word Data Collection", frame)

        if cv2.waitKey(1) & 0xFF == 27:
            break

    print(f"✔ Completed {word}")

cap.release()
cv2.destroyAllWindows()
