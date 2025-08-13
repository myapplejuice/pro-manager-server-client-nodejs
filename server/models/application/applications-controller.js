import ApplicationDBService from "./application-db-service.js";

export default class ApplicationController {
    constructor() { }

    static async createApplication(req, res) {
        try {
            const data = req.body;
            if (!data) return res.status(400).json({ message: "Missing or invalid application data!" });

            if (
                !data ||
                !data.dateTimeOfApplication ||
                !data.coachId ||
                !data.applicationId ||
                !data.description ||
                !data.athleteId ||
                !data.status
            ) return res.status(400).json({ message: "Missing or invalid application data!" });

            const response = await ApplicationDBService.insertApplication(data);
            if (!response) return res.status(500).json({ message: "Internal server error!" });

            return res.status(200).json({ applicaton: response });
        } catch (e) {
            console.error("createApplication error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }

    static async setApplicationStatus(req, res) {
        try {
            const data = req.body;
            if (!data.applicationId || !data.status)
                return res.status(400).json({ message: "ApplicationId and new status must be provided!" });


            const updated = await ApplicationDBService.setApplicationStatus(data);
            if (!updated) return res.status(500).json({ message: "Failed to update status!" });

            return res.status(200).json({ message: "Status updated successfully!" });
        } catch (e) {
            console.error("setApplicationStatus error:", e);
            return res.status(500).json({ message: `Server error: ${e.message}` });
        }
    }

    static async fetchAllApplications(req, res) {
        try {
            const apps = await ApplicationDBService.fetchAllApplications();
            if (!apps || apps.length === 0) return res.status(404).json({ message: "No applications found!" });
            return res.status(200).json({ applications: apps });
        } catch (e) {
            console.error("fetchAllApplications error:", e);
            return res.status(500).json({
                message: "Internal server error occurred while fetching applications!",
                error: e.message,
            });
        }
    }

    static async fetchUserApplications(req, res) {
        try {
            const id = req.params.id;
            if (!id || typeof id !== "string" || id.trim() === "")
                return res.status(400).json({ message: "User ID cannot be null or empty!" });

            // first try as coach
            let applications = await ApplicationDBService.fetchUserApplications(id, true);
            if (!applications || applications.length === 0) {
                // try as athlete
                applications = await ApplicationDBService.fetchUserApplications(id, false);
            }

            if (!applications || applications.length === 0) {
                return res.status(404).json({ message: "User doesnt have any applications!" });
            }

            return res.status(200).json({ applications });
        } catch (e) {
            console.error("fetchUserApplications error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }

    static async fetchApplication(req, res) {
        try {
            const id = req.params.id;
            const applicationId = req.params.applicationId;
            if (!id || !applicationId) {
                return res.status(400).json({ message: "User ID and Application ID must be provided!" });
            }

            const application = await ApplicationDBService.fetchApplication(id, applicationId);
            if (!application) return res.status(404).json({ message: "Application not found!" });

            return res.status(200).json({ application });
        } catch (e) {
            console.error("fetchApplication error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }

    static async deleteApplication(req, res) {
        try {
            const applicationId = req.params.applicationId;
            if (!applicationId) return res.status(400).json({ message: "Application ID must be provided!" });

            const deleted = await ApplicationDBService.deleteApplication(applicationId);
            if (!deleted) return res.status(500).json({ message: "Failed to delete application!" });

            return res.status(200).json({ message: "Application deleted successfully!" });
        } catch (e) {
            console.error("deleteApplication error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }
}
