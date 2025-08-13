import React from "react";
import { Animated, View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import usePopupAnimation from "./popup-animation";

export default function Dialog({ title = "", text = "", onPressAbort = () => { }, onPressConfirmation = () => { }, abortText = "CANCEL", confirmText = "YES" }) {
    const { opacity, translateY } = usePopupAnimation();

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        },
        alertBox: {
            backgroundColor: "rgb(24, 24, 24)",
            padding: 20,
            width: "80%",
            alignItems: "center",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                },
                android: {
                    elevation: 10,
                },
            }),
            borderRadius: 20
        },
        title: {
            alignSelf: "flex-start",
            fontWeight: "bold",
            fontSize: scaleFont(20),
            color: "rgb(0, 140, 255)",
        },
        text: {
            alignSelf: "flex-start",
            marginTop: 15,
            color: "rgb(255, 255, 255)",
            fontSize: scaleFont(12),
        },
        pressablesWrapper: {
            flexDirection: "row",
            justifyContent: "flex-end",
            width: "100%",
        },
        pressableContainer: {
            marginTop: 20,
            padding: 10,
            alignSelf: "flex-end",
        },
        pressable: {
            fontFamily: "monospace",
            fontSize: scaleFont(12),
            color: "rgb(0, 140, 255)",
        },
    });

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                <Text allowFontScaling={false} style={styles.title}>{title}</Text>
                <Text allowFontScaling={false} style={styles.text}>{text}</Text>
                <View style={styles.pressablesWrapper}>
                    <TouchableOpacity style={styles.pressableContainer} onPress={onPressAbort}>
                        <Text allowFontScaling={false} style={styles.pressable}>{abortText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pressableContainer} onPress={onPressConfirmation}>
                        <Text allowFontScaling={false} style={styles.pressable}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}