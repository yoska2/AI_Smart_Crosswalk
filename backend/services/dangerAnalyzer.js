// PROVENANCE: [MERGE] Yossef's rule-engine framework + your ROI rule (STUB - blocked by danger events).
/* ============================================================
 * SANDBOX FILE - SETTLED (decision): danger rules run in the BACKEND (Option B),
 * in ONE file (Yossef's single-class style). The AI service only DETECTS;
 * this file DECIDES (danger? severity? which rule fired?).
 *
 * Structure = Yossef's dangerAnalyzer: analyze() runs each rule and returns the
 * first danger found, else a safe result: { danger, confidence, reason, metadata }.
 *
 * Rules to include (each a method):
 *   - checkRoi         -> PORT of your vision/roi_monitor.py (is an object's
 *                          anchor inside the crosswalk polygon? -> severity)
 *   - checkPhoneUsage  -> Yossef's phone-distraction rule (person + cell phone 67)
 *   - checkChild...    -> Yossef's stubs (later)
 *
 * BLOCKED BY: the danger events / edge cases are not defined yet. Fill the rules
 * once we define them (that also fixes the detector's class allow-list).
 * ============================================================ */

class DangerAnalyzer {
    // Run every rule; return the first danger, else a safe result.
    analyze(detections) {
        return this.checkRoi(detections)
            || this.checkPhoneUsage(detections)
            || { danger: false, confidence: 0, reason: null, metadata: {} };
    }

    // TODO: port your ROI/position check (point-in-polygon + severity).
    checkRoi(detections) {
        return null;
    }

    // TODO: port Yossef's phone rule (person with a cell phone near the chest).
    checkPhoneUsage(detections) {
        return null;
    }

    // --- helpers (kept in the same file, like Yossef's) ---
    // getCenter, distance, findClosest, etc. -> add when filling the rules.
}

export default new DangerAnalyzer();
