
# Gesture Bridge – Sign Language to Text System

This project converts **Indian Sign Language (ISL)** gestures into **text output** using **MediaPipe**, **deep learning models**, and a **FastAPI backend**.
Currently supports:

* ✅ Alphabet & number recognition (static gestures)
* ✅ Word-level recognition (dynamic gestures using sequences)
* ✅ Live camera input
* ✅ Backend API integration

---
## Setting up the Project 
* Extract files from Downloaded zip folder
* In command prompt,go to frontend folder
* run
  
```bash
npm install
```

* In backend folder

## 🧪 Virtual Environment Setup

### 1️⃣ Create virtual environment

```bash
python -m venv env
```

### 2️⃣ Activate virtual environment

**Windows**

```bash
env\Scripts\activate
```

---

## 📦 Package Installation

⚠️ **Important:** Install packages exactly in the given order to avoid version conflicts.

### 🔹 Core ML & Vision Libraries

```bash
python -m pip install tensorflow==2.15.0 keras==2.15.0 mediapipe==0.10.14 protobuf==4.25.3 ml-dtypes==0.2.0 opencv-python numpy pandas scikit-learn pyttsx3
```

### 🔹 Complete Dependency List(If any errors encountered)

```bash
pip install absl-py==2.3.1 anyio==3.7.1 astunparse==1.6.3 attrs==25.4.0 certifi==2026.1.4 \
cffi==2.0.0 charset-normalizer==3.4.4 click==8.3.1 colorama==0.4.6 contourpy==1.3.2 \
cycler==0.12.1 exceptiongroup==1.2.2 fastapi==0.103.2 flatbuffers==25.12.19 \
fonttools==4.61.1 gast==0.4.0 google-auth==2.47.0 google-auth-oauthlib==1.0.0 \
google-pasta==0.2.0 grpcio==1.74.0 h11==0.16.0 h5py==3.15.1 idna==3.11 \
jax==0.4.38 jaxlib==0.4.38 joblib==1.5.3 keras==2.12.0 kiwisolver==1.4.9 \
libclang==18.1.1 Markdown==3.10 MarkupSafe==3.0.3 matplotlib==3.10.8 \
mediapipe==0.10.9 ml_dtypes==0.5.4 numpy==1.24.3 oauthlib==3.3.1 \
opencv-contrib-python==4.11.0.86 opt_einsum==3.4.0 packaging==25.0 pillow==12.1.0 \
protobuf==3.20.3 pyasn1==0.6.1 pyasn1_modules==0.4.2 pycparser==2.23 \
pydantic==1.10.26 pyparsing==3.3.1 python-dateutil==2.9.0.post0 \
requests==2.32.5 requests-oauthlib==2.0.0 rsa==4.9.1 scikit-learn==1.7.2 \
scipy==1.15.3 setuptools==65.5.0 six==1.17.0 sniffio==1.3.1 \
sounddevice==0.5.3 starlette==0.27.0 tensorboard==2.12.3 \
tensorboard-data-server==0.7.2 tensorflow-estimator==2.12.0 \
tensorflow-intel==2.12.1 tensorflow-io-gcs-filesystem==0.31.0 \
termcolor==3.3.0 threadpoolctl==3.6.0 typing_extensions==4.5.0 \
urllib3==2.6.3 uvicorn==0.40.0 Werkzeug==3.1.5 wheel==0.45.1 wrapt==1.14.2
```
---


## 🚀 Running the Project 

From the `backend` folder:

```bash
uvicorn server:app --reload --port 8000
```
To predict word level:

```bash
cd backend
cd word
python predict.py
```

API Endpoints:

* `/predict` → Alphabet & number prediction
* `/predict-word` → Word-level prediction

---

## 🖥️ Frontend

* Built using **React + MediaPipe Hands**
* Streams **126 landmark features**
* Communicates with backend via REST APIs
  
From the `frontend` folder:

```bash
npm run dev
```

---

## ⚠️ Notes

* Word-level gestures are **movement-based**, so accuracy depends on:

  * Consistent hand motion
  * Proper sequence length
* Static alphabets & numbers give **higher accuracy** than words
* Ensure **camera lighting is good** for best results

---

## 👩‍🎓 Project Status

* ✔ Alphabet & Number recognition completed
* ✔ Word-level approach implemented
* 🔄 Improving accuracy with better datasets



