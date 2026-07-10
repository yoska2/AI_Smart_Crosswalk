/*
========================================
Service responsible for running YOLOv8 object detection
through a single long-lived Python child process.

Responsibilities:
- Spawn python/detect.py once, when the server starts.
- Keep that one process alive for the server's entire lifetime,
  instead of starting a new Python process per request.
- Send image paths to it over stdin and match each line that
  comes back on stdout to the request that asked for it.
========================================
*/

import cp from "child_process";
import path from "path";
import url from "url";

// __dirname doesn't exist in ES modules, so it's rebuilt manually here.
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the python script, so spawn works no matter what
// directory the Node process happens to be started from.
const scriptPath = path.join(__dirname, "..", "python", "detect.py");

// Absolute path to the interpreter inside the project's own virtual environment
// (.venv), rather than relying on whatever "python" resolves to on PATH.
// ultralytics/torch is installed there because the system-wide install location
// on Windows can exceed the max path length for torch's internal files.
const pythonExecutable = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");

// Holds the running Python process once startYoloService() has been called.
let pythonProcess = null;

// Accumulates stdout data until a full line (one complete JSON response) is available.
let stdoutBuffer = "";

// FIFO queue of requests waiting for a response. detect.py handles one image
// at a time and replies in the same order it received requests, so the
// oldest pending entry always matches the next line that arrives.
const pendingRequests = [];

/*
========================================
Starts the persistent Python process.
Must be called once when the server boots, not per request.
========================================
*/
const startYoloService = () => {

    pythonProcess = cp.spawn(pythonExecutable, [scriptPath]);

    // Each stdout "data" event can contain a partial line, one full line, or several lines.
    pythonProcess.stdout.on("data", (chunk) => {

        stdoutBuffer += chunk.toString();

        // Split into complete lines; the last piece may be an unfinished line,
        // so it's kept in the buffer instead of being processed.
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop();

        for (const line of lines) {

            if (!line.trim()) continue;

            // The oldest pending request corresponds to this line.
            const pending = pendingRequests.shift();

            if (!pending) continue;

            try {

                const result = JSON.parse(line);

                if (result.error) {
                    pending.reject(new Error(result.error));
                } else {
                    pending.resolve(result);
                }

            } catch (error) {
                pending.reject(error);
            }

        }

    });

    // Python-side errors (stack traces, missing model file, etc.) show up here
    // instead of silently disappearing.
    pythonProcess.stderr.on("data", (chunk) => {
        console.error(`[yoloService] ${chunk.toString()}`);
    });

    // If the process dies, reject everything still waiting so callers don't hang forever.
    pythonProcess.on("exit", (code) => {

        console.error(`[yoloService] Python process exited with code ${code}`);

        while (pendingRequests.length) {
            const pending = pendingRequests.shift();
            pending.reject(new Error("YOLO python process exited unexpectedly"));
        }

        pythonProcess = null;

    });

};

/*
========================================
Sends an image path to the already-running Python process
and resolves with the parsed detections once they arrive.
========================================
*/
const detect = (imagePath) => {

    return new Promise((resolve, reject) => {

        if (!pythonProcess) {
            return reject(new Error("YOLO python process is not running"));
        }

        // Queued before writing, so the stdout handler above has somewhere
        // to deliver the result the moment the response line arrives.
        pendingRequests.push({ resolve: resolve, reject: reject });

        // Writing one line to stdin triggers exactly one detection cycle in detect.py.
        pythonProcess.stdin.write(imagePath + "\n");

    });

};

export default { startYoloService: startYoloService, detect: detect };
