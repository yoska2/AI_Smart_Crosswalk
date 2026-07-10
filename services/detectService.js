/*
========================================
Service responsible for handling detection requests.

Reads an image path from the incoming request and forwards
it to the already-running YOLOv8 Python process via yoloService.
========================================
*/

import yoloService from "./yoloService.js";

const detectObjects = async (req, res) => {

    try {

        // The image is assumed to already be saved on the server;
        // only its path is passed in, not the image data itself.
        const imagePath = req.body.imagePath;

        if (!imagePath) {
            return res.status(400).json({
                message: "imagePath is required"
            });
        }

        // Reuses the single long-lived Python process instead of starting a new one.
        const computedResults = await yoloService.detect(imagePath);

        return res.status(200).json(computedResults);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};

export default { detectObjects: detectObjects };
