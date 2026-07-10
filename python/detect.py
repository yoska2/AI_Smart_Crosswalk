import sys # Provides access to standard input, output, and other system specific functionality.
import json
from ultralytics import YOLO




# Load the YOLOv8 model exactly once, when this process starts.
# the loop would reload the parameters on every single image,
# which is the whole reason Node keeps this process alive instead of spawning it per request.
model = YOLO("yolov8n.pt")




# Read image paths from stdin(of the process*****) forever, one per line, until the parent process closes stdin.
for line in sys.stdin:

    image_path = line.strip()

    # Skip stray blank lines instead of running detection on nothing.
    if not image_path:
        continue

    try:
        # Run YOLOv8 inference on the given image path.
        results = model(image_path)

        results_calculate = []

        # results is a list with one entry per input image; only one image is ever passed at a time.
        for result in results:

            # result.boxes holds one entry per detected object in that image.
            for box in result.boxes:

                # xyxy = [x1, y1, x2, y2] corner coordinates of the bounding box.
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                results_calculate.append({
                    "classId": int(box.cls[0]),
                    "confidence": float(box.conf[0]),
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1
                })


        # Convert the detection results into a JSON string and write it to stdout.
        # The Node.js parent process listens to this stdout stream and reads one JSON
        # object per line as the response for a single detection request.
        # flush=True forces Python to immediately send the output instead of buffering it,
        # ensuring that Node.js receives the result without unnecessary delay.
        print(json.dumps(results_calculate), flush=True)



    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
