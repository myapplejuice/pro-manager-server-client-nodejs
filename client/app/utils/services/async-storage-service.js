import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserDatabaseService from './database/user-db-service';
import PreferencesDatabaseService from './database/preferences-db-service';

export default class AsyncStorageService {
    static DEFAULT_PREFERENCES = { language: 'eng', theme: 'dark' };

    static async signOutUser() {
        await AsyncStorage.multiRemove(["token", "preferences"]);
        router.replace('/screens/authentication/introduction');
    }

    static async signInUser(data) {
        await AsyncStorage.setItem('token', JSON.stringify(data.token));

        const profileData = await UserDatabaseService.fetchUserProfile();
        const profile = profileData.user;
        this.convertImageBase64ToUri(profile);

        profile.preferences = await this.setUserPreferences(profile.id);

        return profile;
    }

    static async isUserSignedIn() {
        const token = JSON.parse(await AsyncStorage.getItem("token"));
        if (!token) return false;

        const profileData = await UserDatabaseService.fetchUserProfile();
        const profile = profileData.user;
        this.convertImageBase64ToUri(profile);

        profile.preferences = JSON.parse(await AsyncStorage.getItem("preferences"));

        return profile;
    }

    static convertImageBase64ToUri(data) {
        if (data.imageBase64) {
            data.image = { uri: `data:image/jpeg;base64,${data.imageBase64}` };
            delete data.imageBase64;
        }
    }

    static async getUserToken() {
        const token = JSON.parse(await AsyncStorage.getItem("token"));
        if (!token) return null;

        return token;
    }

    static async setUserPreferences(id) {
        let userPreferences = await PreferencesDatabaseService.fetchPreferences(id);

        if (!userPreferences) {
            userPreferences = this.DEFAULT_PREFERENCES;
            await PreferencesDatabaseService.createPreferences(id, userPreferences);
        }

        await AsyncStorage.setItem("preferences", JSON.stringify(userPreferences));
        return userPreferences;
    }

    static async updateUserPreferences(userId, preferences) {
        if (!userId || !preferences) return false;

        const success = await PreferencesDatabaseService.updatePreferences(userId, preferences);
        if (success) {
            await AsyncStorage.setItem("preferences", JSON.stringify(preferences));
        }

        return success;
    }
}
