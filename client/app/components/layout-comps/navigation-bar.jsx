import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from "../../utils/assets";
import { useCallback, useRef, useContext } from "react";
import { routes } from '../../utils/settings/constants'
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from '../../utils/contexts/user-context';

export default function NavigationBar() {
    const screen = usePathname();
    const lastPress = useRef(0);
    const { user } = useContext(UserContext)

    const handleNav = useCallback((target) => {
        const now = Date.now();
        if (now - lastPress.current < 500) return;
        lastPress.current = now;

        if (screen === target) return;

        const isOnMain = screen === routes.HOMEPAGE;
        const isNavToMain = target === routes.HOMEPAGE

        if (isOnMain) router.push(target)
        else if (isNavToMain) router.back()
        else router.replace(target)
    }, [screen]);

    const styles = StyleSheet.create({
        main: {
            flex: 1,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: screen === routes.HOMEPAGE || screen === routes.COACHES || screen === routes.APPLICATIONS ? "rgba(0, 0, 0, 0.8)" : "rgb(23, 24, 31)",
            flexDirection: "row",
            textAlign: 'center',
            justifyContent: 'center',
        },
        safeArea: {
            width: '100%',
            flexDirection: "row",
            paddingVertical: 15
        },
        clickable: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        text: {
            textAlign: "center",
            fontFamily: "monospace",
            fontWeight: "bold",
            color: "rgb(0,140,255)",
            fontSize: scaleFont(10)
        },
        logout: {
            backgroundColor: "rgb(165, 49, 49)"
        },
        logoutText: {
            color: "black"
        },
        image: {
            width: 20,
            height: 20
        }
    });

    const activeImageStyle = { width: 23, height: 23 };

    return (
        <View style={styles.main}>
            <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                <TouchableOpacity style={styles.clickable} onPress={() => handleNav(routes.HOMEPAGE)}>
                    <Image
                        style={[styles.image, screen === routes.HOMEPAGE && activeImageStyle]}
                        source={screen === routes.HOMEPAGE ? Images.home : Images.noHome}
                    />
                </TouchableOpacity>
                {
                    !user.isCoach && <TouchableOpacity style={styles.clickable} onPress={() => handleNav(routes.COACHES)}>
                        <Image
                            style={[styles.image, screen === routes.COACHES && activeImageStyle]}
                            source={screen === routes.COACHES ? Images.browseCoaches : Images.noBrowseCoaches}
                        />
                    </TouchableOpacity>
                }
                <TouchableOpacity style={styles.clickable} onPress={() => handleNav(routes.APPLICATIONS)}>
                    <Image
                        style={[styles.image, screen === routes.APPLICATIONS && activeImageStyle]}
                        source={screen === routes.APPLICATIONS ? Images.applications : Images.noApplications}
                    />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}