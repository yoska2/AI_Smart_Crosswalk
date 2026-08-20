import { Server } from 'socket.io';
import Alert from '../models/alert.js';

let io = null;

// Attach Socket.io to the shared HTTP server.
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: { origin: '*' }, // TODO: restrict to the frontend origin in production
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized. Call initSocket first.');
    return io;
};

/**
 * Live feed via MongoDB Change Streams (works on Atlas / replica sets).
 * The DB is the single source of truth: whenever a new alert is INSERTED into
 * the collection, we push it to every connected frontend client. This is
 * decoupled from the write path, so any insert - from this API or elsewhere -
 * reaches the frontend.
 */
export const watchAlerts = () => {
    try {
        const changeStream = Alert.watch([], { fullDocument: 'updateLookup' });

        changeStream.on('change', (change) => {
            if (change.operationType === 'insert') {
                getIO().emit('newAlert', change.fullDocument);
                console.log(`Live: emitted newAlert ${change.fullDocument?._id}`);
            }
        });

        changeStream.on('error', (err) => {
            console.error(`Change stream error: ${err.message}`);
        });

        console.log('Change stream on Alerts collection is active.');
    } catch (err) {
        console.error(`Failed to start change stream: ${err.message}`);
    }
};
