import os
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical

# ================= CONFIG =================
DATA_DIR = "data/word_sequences"
SEQUENCE_LENGTH = 15
FEATURES = 126

MODEL_PATH = "models/word_model.h5"
LABEL_MAP_PATH = "models/word_label_map.json"

EPOCHS = 40
BATCH_SIZE = 16
# =========================================

os.makedirs("models", exist_ok=True)

X = []
y = []

# Load data
for word in os.listdir(DATA_DIR):
    word_path = os.path.join(DATA_DIR, word)
    if not os.path.isdir(word_path):
        continue

    for file in os.listdir(word_path):
        if file.endswith(".npy"):
            path = os.path.join(word_path, file)
            seq = np.load(path)

            # Safety checks
            if seq.shape != (SEQUENCE_LENGTH, FEATURES):
                print(f"⚠ Skipping {path}, wrong shape {seq.shape}")
                continue

            X.append(seq)
            y.append(word)

X = np.array(X)
y = np.array(y)

if len(X) == 0:
    raise ValueError("❌ No word data found. Collect data first.")

print("✅ Loaded:", X.shape, "Labels:", len(y))

# Encode labels
le = LabelEncoder()
y_enc = le.fit_transform(y)

label_map = {int(i): label for i, label in enumerate(le.classes_)}
with open(LABEL_MAP_PATH, "w") as f:
    json.dump(label_map, f, indent=4)

y_cat = to_categorical(y_enc)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat,
    test_size=0.2,
    random_state=42,
    stratify=y_enc
)

# ================= MODEL =================
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(SEQUENCE_LENGTH, FEATURES)),
    Dropout(0.3),
    LSTM(64),
    Dropout(0.3),
    Dense(64, activation="relu"),
    Dense(y_cat.shape[1], activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE
)

model.save(MODEL_PATH)

loss, acc = model.evaluate(X_test, y_test)
print("\n✅ Word training done")
print(f"🎯 Validation Accuracy: {acc*100:.2f}%")
