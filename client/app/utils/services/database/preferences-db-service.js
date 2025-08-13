import 'react-native-get-random-values';
import AsyncStorageService from '../async-storage-service';

export default class PreferencesDatabaseService {
    static URL = "http://192.168.33.19:8080/api/preferences";

    static createAbortController() {
        const TIMEOUT = 5000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
        return { controller, timeoutId };
    }

    static async createPreferences(userId, preferences) {
        if (!this.URL) return "No backend server available!";
        if (!userId || !preferences) return "User ID and preferences data are required!";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const token = await AsyncStorageService.getUserToken();
            const response = await fetch(`${this.URL}/${userId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
                signal: controller.signal,
            });

            switch (response.status) {
                case 400:
                    return "Missing or invalid preferences data!";
                case 500:
                    return "Internal server error! Please try again later.";
                case 200:
                    return await response.json();
                default:
                    return "Unexpected error! Please try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out! Please try again later.";
            }
            return `Error: ${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async updatePreferences(userId, preferences) {
        if (!this.URL) return "No backend server available!";
        if (!userId || !preferences) return "User ID and preferences data are required!";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const token = await AsyncStorageService.getUserToken();
            const response = await fetch(`${this.URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
                signal: controller.signal,
            });

            switch (response.status) {
                case 400:
                    return "Missing or invalid preferences data!";
                case 404:
                    return "Preferences not found!";
                case 500:
                    return "Internal server error! Please try again later.";
                case 200:
                    return "Preferences updated successfully!";
                default:
                    return "Unexpected error! Please try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out! Please try again later.";
            }
            return `Error: ${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    static async fetchPreferences(userId) {
        if (!this.URL) return "No backend server available!";
        if (!userId) return "User ID is required!";

        const { controller, timeoutId } = this.createAbortController();

        try {
            const token = await AsyncStorageService.getUserToken();
            const response = await fetch(`${this.URL}/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            });

            switch (response.status) {
                case 200:
                    return await response.json();
                case 404:
                    return null;
                case 400:
                    return "User ID is missing or invalid!";
                case 500:
                    return "Internal server error! Please try again later.";
                default:
                    return "Unexpected error! Please try again later.";
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return "The request timed out! Please try again later.";
            }
            return `Error: ${error.message}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}