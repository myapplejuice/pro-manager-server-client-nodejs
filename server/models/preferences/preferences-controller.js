import PreferencesDBService from "./preferences-db-service.js";

export default class PreferencesController {
    constructor() { }

    static async createUserPreferences(req, res) {
        try {
            const data = req.body;
            const id = req.params.id
            if (!data || !id) return res.status(400).json({ message: "Missing or invalid application data!" });

            if (
                !data ||
                !data.theme ||
                !data.language
            ) return res.status(400).json({ message: "Missing or invalid application data!" });

            const response = await PreferencesDBService.insertPreferences(id, data);
            if (!response) return res.status(500).json({ message: "Internal server error!" });

            return res.status(200).json({ status: 'success' });
        } catch (e) {
            console.error("createPreferences error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }

    static async setUserPreferences(req, res) {
        try {
            const data = req.body;
            const id = req.params.id;
            if (!data || !id) return res.status(400).json({ message: "Missing or invalid application data!" });

            if (
                !data ||
                !data.theme ||
                !data.language
            ) return res.status(400).json({ message: "Missing or invalid preferences data!" });

            const response = await PreferencesDBService.updatePreferences(id, data);
            if (!response) return res.status(404).json({ message: "Preferences not found!" });

            return res.status(200).json({ status: 'success' });
        } catch (e) {
            console.error("setUserPreferences error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }

    static async fetchUserPreferences(req, res) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ message: "Missing or invalid user ID!" });

            const response = await PreferencesDBService.getPreferencesByUserId(id);
            if (!response) return res.status(404).json({ message: "Preferences not found!" });

            return res.status(200).json({ preferences: response });
        } catch (e) {
            console.error("fetchUserPreferences error:", e);
            return res.status(500).json({ message: "Internal server error!", error: e.message });
        }
    }
}
