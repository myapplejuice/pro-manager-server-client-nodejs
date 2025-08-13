import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import { SafeAreaView } from "react-native-safe-area-context";

//based on this selector styles, i want you to create for me a popup that pops a form that takes from use inputs, form title(what they want to contact us about), and a text area for them to write to us, and send button, if any more suggestions you have like more inputs and stuff, suggest 
export default function Selector({ title = "", text = "", onCancel = () => { }, onPressA = () => { }, onPressB = () => { }, optionAText = "Option A", optionBText = "Option B", }) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 99999,
        },
        alertBox: {
            backgroundColor: "rgb(24, 24, 24)",
            padding: 15,
            width: "100%",
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
            borderRadius: 30
        },
        title: {
            alignSelf: "flex-start",
            justifyContent: "flex-start",
            fontWeight: "bold",
            fontSize: scaleFont(25),
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
            justifyContent: "space-between",
            width: "100%",
        },
        pressableContainer: {
            backgroundColor: "rgb(0,140,255)",
            alignItems: "center",
            marginVertical: 20,
            padding: 20,
            width: "47.5%",
            borderRadius: 10
        },
        pressable: {
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: scaleFont(12),
            color: "rgb(255, 255, 255)",
        },
        cancelContainer: {
            backgroundColor: "rgb(0,140,255)",
            alignItems: "center",
            padding: 20,
            width: "100%",
                      borderRadius: 10
        },
    });

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                <SafeAreaView edges={["bottom"]}>
                    <Text allowFontScaling={false} style={styles.title}>{title}</Text>
                    <Text allowFontScaling={false} style={styles.text}>{text}</Text>
                    <View style={styles.pressablesWrapper}>
                        <TouchableOpacity style={styles.pressableContainer} onPress={onPressA}>
                            <Text allowFontScaling={false} style={styles.pressable}>{optionAText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pressableContainer} onPress={onPressB}>
                            <Text allowFontScaling={false} style={styles.pressable}>{optionBText}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.cancelContainer} onPress={onCancel}>
                        <Text allowFontScaling={false} style={styles.pressable}>Cancel</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Animated.View>
        </Animated.View>
    );
}
