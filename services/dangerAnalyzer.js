/*
========================================
Service responsible for analyzing
multiple YOLO detection frames and
detecting dangerous situations.

This class does not use any AI model.
It only applies rule-based logic on
top of the YOLO detection results.
========================================
*/


/*
Maximum allowed distance between
the person's chest and the phone.
*/
const PHONE_DISTANCE_THRESHOLD = 50; 

/*
Minimum number of frames required to detect phone usage.
*/
const MIN_PHONE_USAGE_FRAMES = 8;


class DangerAnalyzer {

    /*
    ========================================
    Analyzes the collected detection frames
    and returns the first dangerous event
    that is detected.

    If no danger is found, returns a safe
    result.
    ========================================
    */
    analyze(frames) {

        let result = this.checkPhoneUsage(frames);

        if (result) {
            return result;
        }

        result = this.checkChildSeparation(frames);

        if (result) {
            return result;
        }

        result = this.checkChildRunning(frames);

        if (result) {
            return result;
        }

        return {
            danger: false,
            confidence: 0,
            reason: null,
            metadata: {}
        };

    }



  /*
========================================
Checks whether a pedestrian is using
a mobile phone while approaching the
crosswalk.
========================================
*/
checkPhoneUsage(frames) {

    // Counts the number of frames in which
    // phone usage was detected.
    let phoneUsageFrames = 0;

    // Go through every collected frame.
    for (const frame of frames) {

        // Indicates whether phone usage
        // was found in the current frame.
        let phoneDetected = false;

        // Get all detected people.
        const people = frame.filter(
            detection => detection.classId === 0
        );

        // Get all detected mobile phones.
        const phones = frame.filter(
            detection => detection.classId === 67
        );

        // Check every detected person.
        for (const person of people) {

            // Find the closest phone to this person.
            const closestPhone = this.findClosestDetection(
                person,
                phones
            );

            // No nearby phone was found.
            if (!closestPhone) {
                continue;
            }

            // Get the estimated chest point.
            const chestPoint = this.getChestPoint(person);

            // Get the center of the phone.
            const phoneCenter = this.getCenter(closestPhone);

            // Calculate the distance between
            // the person's chest and the phone.
            const distance = this.calculateDistance(
                chestPoint.x,
                chestPoint.y,
                phoneCenter.x,
                phoneCenter.y
            );

            // Phone is close enough to the chest.
            if (distance < PHONE_DISTANCE_THRESHOLD) {

                phoneDetected = true;
                break;

            }

        }

        // Count this frame only once.
        if (phoneDetected) {

            phoneUsageFrames++;

        }

    }

    // Phone usage detected in most frames.
    if (phoneUsageFrames >= MIN_PHONE_USAGE_FRAMES) {

        return {

            danger: true,
            confidence: phoneUsageFrames / 10,
            reason: "Person using mobile phone",
            metadata: {
                detectedFrames: phoneUsageFrames
            }

        };

    }

    return null;

}



    /*
    ========================================
    Checks whether a child separates from
    the accompanying adult.
    ========================================
    */
    checkChildSeparation(frames) {

        // TODO: Implement child separation detection.

        return null;

    }



    /*
    ========================================
    Checks whether a child is running
    toward the crosswalk.
    ========================================
    */
    checkChildRunning(frames) {

        // TODO: Implement child running detection.

        return null;

    }



        /*
        ============================================================
                             Helper Functions
        ============================================================
        */


        /*
    ========================================
    Returns the center point of a detected object.
    ========================================
    */
    getCenter(detection) {

        return {

            x: detection.x + detection.width / 2,
            y: detection.y + detection.height / 2

        };

    }



    /*
    ========================================
    Returns the estimated chest point of a detected person.
    ========================================
    */
    getChestPoint(person) {

        return {

            x: person.x + person.width / 2,
            y: person.y + person.height * 0.35

        };

    }



    /*
    ========================================
    Calculates the distance between two points.
    ========================================
    */
    calculateDistance(x1, y1, x2, y2) {

        return Math.sqrt(

            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2)

        );

    }



    /*
    ========================================
    Returns the closest detection to the source object.
    ========================================
    */
    findClosestDetection(source, detections) {

        let closestDetection = null;

        let shortestDistance = Number.MAX_VALUE;

        // Get the center point of the source object.
        const sourceCenter = this.getCenter(source);

        // Compare the source object with every detection.
        for (const detection of detections) {

            const detectionCenter = this.getCenter(detection);

            const distance = this.calculateDistance(

                sourceCenter.x,
                sourceCenter.y,
                detectionCenter.x,
                detectionCenter.y

            );

            // Store the closest detection found so far.
            if (distance < shortestDistance) {

                shortestDistance = distance;
                closestDetection = detection;

            }

        }

        return closestDetection;

    }
}

export default new DangerAnalyzer();