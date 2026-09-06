/* ============================================================
 * SANDBOX - Node -> AI service caller.
 * PROVENANCE: whole file = YOSSEF's services/detectService.js, near-verbatim.
 *             Only cosmetic change marked [CHANGED].
 * ============================================================ */
import axios from "axios";                                  

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;          

const detectObjects = async (req, res) => {                 
    try {
        const imagePath = req.body.imagePath;               
        if (!imagePath) {                                   
            return res.status(400).json({ message: "imagePath is required" });
        }

        // [CHANGED] cosmetic: shorthand { imagePath } instead of { imagePath: imagePath }.
        const response = await axios.post(`${AI_SERVICE_URL}/detect`, { imagePath }); 
        return res.status(200).json(response.data);         
    } catch (error) {                                       // [YOSSEF] reuse AI service's status/message
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.detail : error.message;
        return res.status(status).json({ message });
    }
};

export default { detectObjects };                            
