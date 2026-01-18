const userProfile = {
    // 1. User Safety Data
    safety: {
        lastScanTimestamp: null,
        validityDuration: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
        isExpired: false
    },

    // 2. Your Custom Allergy Batches
    triggers: {
        medicinal: ["Croscarmellose Sodium"],
        photoChemicals: ["Hydroquinone", "Metol"],
        exoticWoods: ["Wenge", "Padauk"],
        fermented: ["Natto", "Kimchi"],
        labSet: ["SDS", "EDTA", "DMSO"],
        terpenes: ["Pinene", "Myrcene"],
        modernMaterials: ["Mushroom Leather", "PLA"],
        luxuryFibers: ["Vicuna", "Qiviut"]
    },

    // 3. The Protection Logic
    startProtectionTimer: function() {
        this.safety.lastScanTimestamp = Date.now();
        this.safety.isExpired = false;
        console.log("allerZEN Protection started: Valid for 3 hours.");
    },

    checkStatus: function() {
        if (!this.safety.lastScanTimestamp) return "No Scan Detected";
        
        const now = Date.now();
        const elapsed = now - this.safety.lastScanTimestamp;

        if (elapsed >= this.safety.validityDuration) {
            this.safety.isExpired = true;
            return "EXPIRED: Please Rescan";
        }
        return "PROTECTED";
    }
};

// Exporting so other parts of your app can use it
export default userProfile;
