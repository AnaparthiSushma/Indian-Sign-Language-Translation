from fastapi import FastAPI
from pydantic import BaseModel
from inference import predict_landmarks
from word.word_inference import predict_word   # 🔥 ADD THIS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Input(BaseModel):
    landmarks: list[float]

# ================= ALPHABET =================
@app.post("/predict")
def predict(data: Input):
    char, confidence = predict_landmarks(data.landmarks)
    return {
        "label": char,
        "confidence": confidence
    }

# ================= WORD =================
@app.post("/predict-word")
def predict_word_route(data: Input):
    word, confidence = predict_word(data.landmarks)
    return {
        "label": word,
        "confidence": confidence
    }
