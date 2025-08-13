import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from "../../utils/assets";
import { router, usePathname } from "expo-router";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { UserContext } from "@/app/utils/contexts/user-context";
import { routes } from "@/app/utils/settings/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import ApplicationDatabaseService from "../../utils/services/database/application-db-service";

export default function TopBar() {
    const screen = usePathname()
    const { user } = useContext(UserContext)
    const [notifications, setNotifications] = useState(false)
    const [notificationCount, setNotificationCount] = useState()
    const isProfileScreen = screen === routes.PROFILE;
    const lastPress = useRef(0);

    useEffect(() => {
        if (!user || !user.id) return;

        setBadge();
        const interval = setInterval(async () => {
            try {
                setBadge();
            } catch (err) { }
        }, 5000);

        return () => clearInterval(interval);
    }, [user]);

    const handleNav = useCallback((target) => {
        const now = Date.now();
        if (now - lastPress.current < 500) return;
        lastPress.current = now;

        if (screen === target) return;

        if (target === routes.APPLICATIONS)
            router.push(target)
        else
            router.push(target)
    }, [screen]);

    async function setBadge() {
        const data = await ApplicationDatabaseService.fetchUserApplications(user.id);
        const applications = data.applications
        const pending = applications.filter(app => app.status === "pending");
        if (pending && pending.length > 0) {
            setNotifications(true);
            setNotificationCount(pending.length);
            return;
        }

        setNotifications(false);
        setNotificationCount(0);
    }

    const profileScreensTitles = {
        [routes.CONTACT]: "Contact",
        [routes.PERSONAL_DETAILS]: "Personal Details",
        [routes.SETTINGS]: "Settings",
        [routes.PRIVACY]: "Privacy",
    };

    const mainScreensTitles = {
        [routes.HOMEPAGE]: "Home",
        [routes.COACHES]: "Browse Coaches",
        [routes.APPLICATIONS]: "Applications",
        [routes.PROFILE]: "Profile"
    };

    const profileScreensBar = screen === routes.SETTINGS || screen === routes.CONTACT || screen === routes.PRIVACY || screen === routes.PERSONAL_DETAILS
    const mainScreensBar = screen === routes.HOMEPAGE || screen === routes.COACHES || screen === routes.PROFILE || screen === routes.APPLICATIONS

    const styles = StyleSheet.create({
        // Main Screens Header
        mainScreensHeader: {
            height: 60,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgb(23, 24, 31)",
            paddingHorizontal: 15,
        },
        title: {
            color: 'rgb(0,140,255)',
            fontSize: scaleFont(20),
            textAlign: 'center',
            fontWeight: '500',
            letterSpacing: 1,
            flex: 1,
        },
        buttonWrapper: {
            padding: 5,
        },
        profileImage: {
            width: 30,
            height: 30,
            borderRadius: 15,
        },
        iconImage: {
            width: 25,
            height: 25,
            tintColor: 'rgb(0,140,255)',
        },
        bellContainer: {
            position: 'relative',
        },
        badge: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: 'red',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        badgeText: {
            color: 'white',
            fontSize: scaleFont(10),
            fontWeight: 'bold',
        },

        // Settings Header
        profileScreensHeader: {
            height: 100,
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 9999,
            width: "100%",
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.1)',
        },
        safeArea: {
            width: '100%',
            flexDirection: "row",
            paddingVertical: 15,
            alignItems: 'center'
        },
        backButton: {
            paddingRight: 15,
        },
        backIcon: {
            width: 20,
            height: 20,
            tintColor: 'rgb(0,140,255)',
            transform: [{ scaleX: -1 }],
        },
        headerTitle: {
            fontSize: scaleFont(18),
            color: 'rgb(0,140,255)'
        },
    });

    return (
        <>

            {profileScreensBar && (
                <View style={styles.profileScreensHeader}>
                    <SafeAreaView edges={['top']} style={styles.safeArea}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Image source={Images.arrow} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.headerTitle}>{profileScreensTitles[screen] || ""}</Text>
                    </SafeAreaView>
                </View>
            )}
            {mainScreensBar && (
                <>
                    <View style={styles.mainScreensHeader}>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={isProfileScreen ? () => router.back() : () => handleNav(routes.PROFILE)}
                            activeOpacity={0.7}
                        >
                            {isProfileScreen ? (
                                <Image source={Images.arrow} style={[styles.iconImage, { transform: [{ scaleX: -1 }] }]} />
                            ) : (
                                <Image source={user.image} style={styles.profileImage} />
                            )}
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={styles.title}>{mainScreensTitles[screen] || ""}</Text>
                        <TouchableOpacity
                            style={styles.buttonWrapper}
                            onPress={() => handleNav(routes.APPLICATIONS)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bellContainer}>
                                <Image
                                    source={notifications ? Images.notification : Images.noNotification}
                                    style={styles.iconImage}
                                />
                                {notificationCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text allowFontScaling={false} style={styles.badgeText}>
                                            {notificationCount > 99 ? "99+" : notificationCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </>
    );
}
