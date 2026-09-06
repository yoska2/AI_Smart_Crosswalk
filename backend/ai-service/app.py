# ============================================================
# SANDBOX - AI service HTTP wrapper.
# PROVENANCE: whole file = YOSSEF's python/app.py (FastAPI shape), with ONE
#             change for the merge (marked [CHANGED] below).
# Run: uvicorn app:app --port 8000
# ============================================================

import os                                          

from fastapi import FastAPI, HTTPException          
from pydantic import BaseModel                      

# [CHANGED] his file imported `run_detection` from his detect.py.
# We import our MERGED detector instead (his flat output + your threshold/allow-list).
from detector import detect                         # [MERGE] was: from detect import run_detection

app = FastAPI()                                     


# request body: only the image path is sent (his contract).
class DetectRequest(BaseModel):
    imagePath: str


@app.get("/")                                       
def health_check():
    return {"status": "running"}


@app.post("/detect")                                
def detect_endpoint(request: DetectRequest):
    if not os.path.exists(request.imagePath):       
        raise HTTPException(status_code=400, detail="Image file not found")
    try:
        return detect(request.imagePath)            # [CHANGED] was run_detection(...) -> now our detect()
    except Exception as exc:                        
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":                          
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
