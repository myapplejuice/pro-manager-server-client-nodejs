import 'react-native-get-random-values';
import AsyncStorageService from '../async-storage-service';

export default class AffiliationDatabaseService {
  static URL = "http://192.168.33.19:8080/api/affiliation";

  static createAbortController() {
    const TIMEOUT = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    return { controller, timeoutId };
  }

  static async createAffiliation(affiliation) {
    if (!this.URL) return "No backend server available!";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/create`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(affiliation),
        signal: controller.signal,
      });

      switch (response.status) {
        case 400:
          return "Missing or invalid affiliation data!";
        case 500:
          return "Internal server error!";
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

  static async fetchAllAffiliations() {
    if (!this.URL) return "No backend server available!";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      switch (response.status) {
        case 404:
          return [];
        case 200:
          return await response.json();
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

  static async fetchUserAffiliations(userId) {
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

      console.log(response.status);

      switch (response.status) {
        case 400:
          return "User ID cannot be null or empty!";
        case 404:
          return [];
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

  static async endAffiliation(applicationId) {
    if (!this.URL) return "No backend server available!";
    if (!applicationId) return "Application ID is required!";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/${applicationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      switch (response.status) {
        case 400:
          return "Application ID must be provided!";
        case 500:
          return "Failed to delete affiliation!";
        case 200:
          return "Affiliation deleted successfully!";
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
