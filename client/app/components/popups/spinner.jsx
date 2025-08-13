import { useEffect, useRef } from "react";
import { Animated, Easing, View, StyleSheet, Text } from "react-native";
import {scaleFont} from '../../utils/scale-fonts'

export default function Spinner() {
    const rotateOuter = useRef(new Animated.Value(0)).current;
    const rotateInner = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
    }, []);

    const spinOuter = rotateOuter.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const spinInner = rotateInner.interpolate({
        inputRange: [0, 1],
        outputRange: ["360deg", "0deg"],
    });

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
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
        text: {
            color: "white",
            fontSize: scaleFont(16),
            fontWeight: "500",
        },
    });

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.outerRing, { transform: [{ rotate: spinOuter }] }]}>
                <Animated.View style={[styles.innerRing, { transform: [{ rotate: spinInner }] }]} />
            </Animated.View>
            <Text allowFontScaling={false} style={styles.text}>Please wait...</Text>
        </View>
    );
}