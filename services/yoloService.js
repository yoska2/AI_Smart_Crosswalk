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

// convert (current) file URL to path for __dirname
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
 This function creates and starts the Python process,
  which loads the YOLOv8 model into memory.

 It is called only once when the Node.js server starts (index.js).
 After the thread finishes, it does not continue running itself,
 but it registers (listeners) that remain active for the entire duration of the server. 
 These listeners continuously listen for any answer***, error, or termination events
  that come from the Python process.
========================================
*/
const YoloService = () => {

    // Start the Python process and keep it running.
    pythonProcess = cp.spawn(pythonExecutable, [scriptPath]);

    // Listen for results coming back from Python.
    pythonProcess.stdout.on("data", (chunk) => {

        // Add the new data to the buffer.
        stdoutBuffer += chunk.toString();

        // Split the buffer into complete lines.
        const lines = stdoutBuffer.split("\n");

        // Save the last incomplete line for the next event.
        stdoutBuffer = lines.pop();

        // Process every complete JSON line returned by Python.
        for (const line of lines) {

            // Ignore empty lines.
            if (!line.trim()) continue;

            // Get the oldest request waiting for a response.
            const pending = pendingRequests.shift();

            // If no request is waiting, ignore this line.
            if (!pending) continue;

            try {

                // Convert the JSON string into a JavaScript object.
                const result = JSON.parse(line);

                // If Python returned an error, reject the Promise.
                if (result.error) {
                    pending.reject(new Error(result.error));
                } else {
                    // Otherwise, return the detection result.
                    pending.resolve(result);
                }

            } catch (error) {

                // Reject the Promise if the JSON is invalid.
                pending.reject(error);

            }

        }

    });

    // Listen for Python error messages and print them.
    pythonProcess.stderr.on("data", (chunk) => {
        console.error(`[yoloService] ${chunk.toString()}`);
    });

    // Handle the case where the Python process stops running.
    pythonProcess.on("exit", (code) => {

        console.error(`[yoloService] Python process exited with code ${code}`);

        // Reject all requests that are still waiting for a response.
        while (pendingRequests.length) {

            const pending = pendingRequests.shift();

            pending.reject(
                new Error("YOLO python process exited unexpectedly")
            );

        }

        // Mark that there is no active Python process.
        pythonProcess = null;

    });

};



/*
========================================
Sends an image path to the running Python process.
Returns a Promise with the detection results.
========================================
*/
const detect = (imagePath) => {

    // Create a Promise because Python needs time to process the image.
    return new Promise((resolve, reject) => {

        // Check that the Python process is running.
        if (!pythonProcess) {
            return reject(new Error("YOLO python process is not running"));
        }

        // Save this request so we can return the correct result
        // when Python finishes processing.
        pendingRequests.push({
            resolve: resolve,
            reject: reject
        });

        // Send the image path to Python.
        // This starts one detection in detect.py.
        pythonProcess.stdin.write(imagePath + "\n");

    });

};

// Export the functions so other files can use them 

export default { startYoloService: YoloService, detect: detect };
