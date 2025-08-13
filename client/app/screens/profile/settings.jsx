import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Animated, Easing } from 'react-native';
import { useContext, useEffect, useRef, useState } from 'react';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../utils/contexts/user-context';
import usePopups from '../../utils/hooks/use-popups';
import { useBackHandlerContext } from '../../utils/contexts/back-handler-context';
import UserDatabaseService from '../../utils/services/database/user-db-service';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorageService from '../../utils/services/async-storage-service';

export default function Settings() {
    const { user } = useContext(UserContext)
    const [theme, setTheme] = useState(user.preferences.theme);
    const [language, setLanguage] = useState(user.preferences.language)
    const [deleting, setDeleting] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const rotateOuter = useRef(new Animated.Value(0)).current;
    const rotateInner = useRef(new Animated.Value(0)).current;
    const { createInput, createAlert, createToast } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        let timer, interval;

        if (deleting) {
            setCountdown(10);

            Animated.loop(
                Animated.timing(rotateOuter, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.timing(rotateInner, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            timer = setTimeout(() => {
                clearInterval(interval);
                setDeleting(false);
                createAlert({
                    title: "Success", text: "Account deleted!", onPress: () => {
                        UserDatabaseService.removeUser(user.id)
                        AsyncStorageService.signOutUser();
                        router.replace('/screens/authentication/login')
                    }
                });
            }, 10000);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [deleting]);

    async function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        const updatedPreferences = { ...user.preferences, theme: newTheme };
        const success = await AsyncStorageService.updateUserPreferences(user.id, updatedPreferences);

        if (success) {
            user.preferences.theme = newTheme;
        } else {
            createToast({ message: "Failed to update theme!" });
        }
    }

    async function setNextLanguage() {
        const next = language === 'eng' ? 'ar' : language === 'ar' ? 'heb' : 'eng';
        setLanguage(next);

        const updatedPreferences = { ...user.preferences, language: next };
        const success = await AsyncStorageService.updateUserPreferences(user.id, updatedPreferences);

        if (success) {
            user.preferences.language = next;
        } else {
            createToast({ message: "Failed to update language!" });
        }
    }

    function cancelDeletion() {
        setDeleting(false)
        createToast({ message: "Account delete cancelled!" })
    }

    const styles = StyleSheet.create({
        // Layout & Containers
        background: {
            flex: 1,
        },
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            paddingTop: insets.top + 80,
            paddingHorizontal: 20,
        },
        topSection: {
            flex: 18,
        },
        bottomSection: {
            flex: 2,
            marginBottom: insets.bottom
        },

        // General Option Rows
        optionRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.15)',
        },
        buildRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.15)',
        },
        label: {
            fontSize: scaleFont(16),
            color: 'rgb(255, 255, 255)',
            fontWeight: 'bold',
        },

        // Mode & Language Icons
        modeIcon: {
            width: 40,
            height: 40,
        },

        // Delete Button
        deleteButton: {
            backgroundColor: 'rgb(255,59,48)',
            marginVertical: 10,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            alignItems: 'center',
        },
        deleteButtonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        deleteIcon: {
            width: 25,
            height: 25,
            tintColor: 'white',
            marginRight: 10,
        },
        deleteText: {
            fontSize: scaleFont(17),
            color: 'white',
            fontWeight: 'bold',
        },

        // Spinner Overlay
        spinnerOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        },
        outerRing: {
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 5,
            borderTopColor: "rgb(0,140,255)",
            borderRightColor: "transparent",
            borderBottomColor: "rgb(0,140,255)",
            borderLeftColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
        },
        innerRing: {
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: 3,
            borderTopColor: "rgba(0, 140, 255, 0.5)",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(0, 140, 255, 0.5)",
            borderLeftColor: "transparent",
        },
        spinnerText: {
            color: "white",
            fontSize: scaleFont(16),
            fontWeight: "500",
        },
        spinnerCountdown: {
            color: 'white',
            fontSize: scaleFont(15),
            marginTop: 8,
            fontWeight: '400',
        },

        // Cancel Button
        cancelButton: {
            marginTop: 20,
            paddingVertical: 10,
            paddingHorizontal: 25,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.15)',
        },
        cancelText: {
            color: 'white',
            fontSize: scaleFont(15),
            fontWeight: '600',
        },
    });

    return (
        <ImageBackground source={theme === 'dark' ? Images.darkProfileBackground : Images.lightProfileBackground} resizeMode="cover" style={styles.background}>
            {deleting && (
                <View style={styles.spinnerOverlay}>
                    <Animated.View style={[styles.outerRing, { transform: [{ rotate: rotateOuter.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
                        <Animated.View style={[styles.innerRing, { transform: [{ rotate: rotateInner.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) }] }]} />
                    </Animated.View>
                    <Text allowFontScaling={false} style={styles.spinnerText}>Deleting your account...</Text>
                    <Text allowFontScaling={false} style={styles.spinnerCountdown}>{countdown}s</Text>
                    <TouchableOpacity onPress={cancelDeletion} style={styles.cancelButton}>
                        <Text allowFontScaling={false} style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.overlay}>
                <View style={styles.topSection}>
                    <View style={styles.optionRow}>
                        <Text allowFontScaling={false} style={styles.label}>Theme ({theme === 'light' ? 'Light' : 'Dark'})</Text>
                        <TouchableOpacity onPress={toggleTheme}>
                            <Image
                                source={theme === 'dark' ? Images.dark : Images.light}
                                style={styles.modeIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionRow}>
                        <Text allowFontScaling={false} style={styles.label}>Language - ({language === 'eng' ? 'English' : language === 'heb' ? 'Hebrew' : 'Arabic'})</Text>
                        <TouchableOpacity style={styles.modeIcon} onPress={setNextLanguage}>
                            <Image
                                source={language === 'eng' ? Images.english : language === 'ar' ? Images.arabic : Images.hebrew}
                                style={[styles.modeIcon, language === 'Hebrew' && { width: 38, height: 38 }]}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleting(true)}>
                        <View style={styles.deleteButtonContent}>
                            <Image source={Images.trash} style={styles.deleteIcon} />
                            <Text allowFontScaling={false} style={styles.deleteText}>Delete Account</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomSection}>
                    <View style={styles.buildRow}>
                        <Text allowFontScaling={false} style={styles.label}>App Version</Text>
                        <Text allowFontScaling={false} style={styles.label}>v1.0.0</Text>
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}