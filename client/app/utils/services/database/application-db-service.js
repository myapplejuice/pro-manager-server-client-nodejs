import 'react-native-get-random-values';
import AsyncStorageService from '../async-storage-service';

export default class ApplicationDatabaseService {
  static URL = "http://192.168.33.19:8080/api/application";

  static createAbortController() {
    const TIMEOUT = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    return { controller, timeoutId };
  }

  static async createApplication(application) {
    if (!this.URL) return "No backend server available!";

    const { controller, timeoutId } = this.createAbortController();
    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/create`, {  // FIXED URL
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(application),
        signal: controller.signal,
      });

      console.log(response.status);

      switch (response.status) {
        case 400:
          return "Missing or invalid application data!";
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

  static async setApplicationStatus(applicationId, status) {
    if (!this.URL) return "No backend server available!";

    const { controller, timeoutId } = this.createAbortController();

    const data = { applicationId, status };

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/update`, {  // FIXED URL
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      switch (response.status) {
        case 400:
          return "ApplicationId and new status must be provided!";
        case 500:
          return "Failed to update status!";
        case 200:
          return "Status updated successfully!";
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

  static async fetchAllApplications() {
    if (!this.URL) return "No backend server available!";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/all`, {  // FIXED URL
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

  static async fetchUserApplications(userId) {
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

      if (response.status === 200) {
        return await response.json();
      }
      if (response.status === 400) {
        return "User ID cannot be null or empty!";
      }
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        return "The request timed out! Please try again later.";
      }
      return `Error: ${error.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async fetchApplication(userId, applicationId) {
    if (!this.URL) return "No backend server available!";
    if (!userId || !applicationId) return "User ID and Application ID are required!";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const response = await fetch(`${this.URL}/${userId}/${applicationId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      switch (response.status) {
        case 200:
          return await response.json();
        case 400:
          return "User ID and Application ID must be provided!";
        case 404:
          return null; // application not found
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

  static async deleteApplication(applicationId) {
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
        case 200:
          return "Application deleted successfully!";
        case 400:
          return "Application ID must be provided!";
        case 500:
          return "Failed to delete application!";
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
