import AsyncStorageService from "../async-storage-service";
import "react-native-get-random-values";

export default class UserDatabaseService {
  static URL = "http://192.168.33.19:8080/api/user";

  static createAbortController() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    return { controller, timeoutId };
  }

  static async fetchAllUsers() {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const res = await fetch(`${this.URL}/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (res.status === 200) {
        const data = await res.json();
        return data.users || [];
      }
      if (res.status === 404) return "No users found";
      if (res.status === 500) return "Internal server error";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async fetchUserProfile() {
    if (!this.URL) return null;

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const res = await fetch(`${this.URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (res.status === 200) return await res.json();
      if (res.status === 401) return "Unauthorized - invalid or missing token";
      if (res.status === 404) return "User not found";
      if (res.status === 500) return "Internal server error";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Internal server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async fetchUser(authentication, password) {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const res = await fetch(`${this.URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authentication, password }),
        signal: controller.signal,
      });

      if (res.status === 200) {
        const data = await res.json();
        return data || "Invalid response";
      }
      if (res.status === 400) return "Missing data - all fields required";
      if (res.status === 401 || res.status === 404)
        return "User not found or incorrect credentials";
      if (res.status === 500) return "Internal server error";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async insertUser(details) {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const res = await fetch(`${this.URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
        signal: controller.signal,
      });

      if (res.status === 200) return await res.json();
      if (res.status === 400) return "Missing data - all fields required";
      if (res.status === 500) return "Internal server error";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async updateUser(id, details) {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const res = await fetch(`${this.URL}/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(details),
        signal: controller.signal,
      });

      if (res.status === 200) return true;
      if (res.status === 400) return "No changes submitted";
      if (res.status === 404) return "User not found";
      if (res.status === 500) return "Internal server error";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async removeUser(id) {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const token = await AsyncStorageService.getUserToken();
      const res = await fetch(`${this.URL}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (res.status === 200) {
        await AsyncStorageService.signOutUser();
        return true;
      }
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async sendRecoveryMail(email, recoveryCode) {
    if (!this.URL) return "No backend server available";

    const { controller, timeoutId } = this.createAbortController();

    try {
      const res = await fetch(`${this.URL}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recoveryCode }),
        signal: controller.signal,
      });

      if (res.status === 200) return true;
      if (res.status === 404) return "No account matched this email address";
      return `Unexpected error (status ${res.status})`;
    } catch (e) {
      if (e.name === "AbortError") return "Request timed out";
      return `Server error: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
