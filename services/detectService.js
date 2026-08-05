/*
========================================
Service responsible for handling
object detection requests.

Receives an image path, forwards it
to the AI REST service, and returns
the detection results.
========================================
*/

import axios from "axios";

// Base URL of the Python FastAPI detection service.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

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

        // Forward the image path to the FastAPI detection service.
        const response = await axios.post(`${AI_SERVICE_URL}/detect`, {
            imagePath: imagePath
        });

        return res.status(200).json(response.data);

    } catch (error) {

        // If the AI service responded with an error, reuse its status and message.
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.detail : error.message;

        return res.status(status).json({
            message: message
        });

    }

};

export default { detectObjects: detectObjects };
