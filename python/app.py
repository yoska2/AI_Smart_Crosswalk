"""
========================================
FastAPI service responsible for running
YOLOv8 object detection.

Exposes a health check endpoint and a
single POST /detect endpoint. Node.js
calls this service over HTTP instead
of spawning a Python process.
========================================
"""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from detect import run_detection

app = FastAPI()


# Request body for POST /detect - only the image path is required.
class DetectRequest(BaseModel):
    imagePath: str


# GET / - simple health check to confirm the AI service is running.
@app.get("/")
def health_check():
    return {"status": "running"}


@app.post("/detect")
def detect(request: DetectRequest):

    if not os.path.exists(request.imagePath):
        raise HTTPException(status_code=400, detail="Image file not found")

    try:
        return run_detection(request.imagePath)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
