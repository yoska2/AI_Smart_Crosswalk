/*
========================================
Middleware responsible for user authentication
using JWT.

The middleware validates the token received
from the client, extracts the user information,
and attaches it to the request object.

If the token is valid, the request proceeds
to the next step. Otherwise, an unauthorized
response is returned.
========================================
*/

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

    try {

        // Get the authorization header
        const authHeader = req.headers.authorization;

        // Check if a token was provided
        if (!authHeader) {

            return res.status(401).json({
                message: "Access token is required"
            });

        }

        // Extract the token from:
        // Bearer <token>
        const token = authHeader.split(" ")[1];

        // Validate token existence
        if (!token) {

            return res.status(401).json({
                message: "Invalid token"
            });

        }

        // Verify token authenticity and expiration
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store user information in the request object
        req.user = decoded;

        // Continue to the next middleware or route
        next();

    } catch (error) {

        // Return unauthorized response if token is invalid
        return res.status(401).json({
            message: "Token is invalid or expired"
        });

    }

};

export default authMiddleware;