import AffiliationDBService from './affiliaton-db-service.js';

export default class AffiliationController {
    static async createAffiliation(req, res) {
        try {
            const data = req.body;
            if (!data || !data.applicationId || !data.coachId || !data.athleteId) {
                return res.status(400).json({ message: "Missing or invalid affiliation data!" });
            }

            const result = await AffiliationDBService.insertAffiliation(data);
            if (!result) {
                return res.status(500).json({ message: "Internal server error!" });
            }

            return res.status(200).json({ affiliation: result });
        } catch (err) {
            console.error("createAffiliation error:", err);
            return res.status(500).json({ message: "Internal server error!", error: err.message });
        }
    }

    static async fetchAllAffiliations(req, res) {
        try {
            const affiliations = await AffiliationDBService.fetchAllAffiliations();
            if (!affiliations || affiliations.length === 0) {
                return res.status(404).json({ message: "No affiliations found!" });
            }
            return res.status(200).json({ affiliations });
        } catch (err) {
            console.error("fetchAllAffiliations error:", err);
            return res.status(500).json({
                message: "Internal server error occurred while fetching affiliations!",
                error: err.message,
            });
        }
    }

    static async fetchUserAffiliations(req, res) {
        try {
            const id = req.params.id;
            if (!id || typeof id !== "string" || id.trim() === "") {
                return res.status(400).json({ message: "User ID cannot be null or empty!" });
            }

            // Try as coach first
            let affiliations = await AffiliationDBService.fetchUserAffiliations(id, true);
            if (!affiliations || affiliations.length === 0) {
                // Try as athlete
                affiliations = await AffiliationDBService.fetchUserAffiliations(id, false);
            }

            if (!affiliations || affiliations.length === 0) {
                return res.status(404).json({ message: "User doesn't have any affiliations!" });
            }

            return res.status(200).json({ affiliations });
        } catch (err) {
            console.error("fetchUserAffiliations error:", err);
            return res.status(500).json({ message: "Internal server error!", error: err.message });
        }
    }

    static async endAffiliation(req, res) {
        try {
            const applicationId = req.params.applicationId;
            if (!applicationId) {
                return res.status(400).json({ message: "Application ID must be provided!" });
            }

            const deleted = await AffiliationDBService.deleteAffiliationById(applicationId);
            if (!deleted) {
                return res.status(500).json({ message: "Failed to delete affiliation!" });
            }

            return res.status(200).json({ message: "Affiliation deleted successfully!" });
        } catch (err) {
            console.error("deleteAffiliation error:", err);
            return res.status(500).json({ message: "Internal server error!", error: err.message });
        }
    }
}
