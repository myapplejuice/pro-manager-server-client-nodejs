import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";
import { scaleFont } from "../../utils/scale-fonts";

export default function Input({
    title = "Update Detail",
    text = "Enter new value below",
    confirmText = "SUBMIT",
    confirmButtonStyle = {},
    placeholder = "Enter value...",
    value = "",
    onSubmit = () => { },
    onCancel = () => { },
}) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef(null);

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
        ]).start(() => {
            if (inputRef.current) inputRef.current.focus();
        });
    }, []);

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
        },
        alertBox: {
            backgroundColor: "rgb(24, 24, 24)",
            width: "90%",
            alignSelf: "center",
            fontWeight: "bold",
            fontSize: scaleFont(25),
            color: "rgb(0, 140, 255)",
            padding: 15,
            marginBottom: 150,
            borderRadius: 20
        },
        title: {
            color: "rgb(0, 140, 255)",
            fontWeight: "bold",
            alignSelf: "flex-start",
            fontSize: scaleFont(25),
        },
        text: {
            alignSelf: "flex-start",
            marginTop: 15,
            color: "rgb(255, 255, 255)",
            fontSize: scaleFont(12),
        },
        input: {
            backgroundColor: "rgb(39, 40, 56)",
            color: "rgb(255, 255, 255)",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            fontSize: scaleFont(14),
            marginTop: 20,
            marginBottom: 10,
        },
        buttonRow: {
            flexDirection: "row",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: 10,
        },
        buttonContainer: {
            alignItems: "center",
            padding: 10,
            marginVertical: 7,
        },
        buttonText: {
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: scaleFont(10),
            color: "rgb(0, 140, 255)",
        },
        cancelContainer: {
            alignItems: "center",
            padding: 20,
            width: "100%",
            marginTop: 20,
        },
    });


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                    <Text allowFontScaling={false} style={styles.title}>
                        {title}
                    </Text>
                    <Text allowFontScaling={false} style={styles.text}>
                        {text}
                    </Text>
                    <TextInput
                        allowFontScaling={false}
                        value={internalValue}
                        ref={inputRef}
                        onChangeText={setInternalValue}
                        placeholder={placeholder}
                        placeholderTextColor="gray"
                        style={styles.input}
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.buttonContainer} onPress={onCancel}>
                            <Text allowFontScaling={false} style={[styles.buttonText, { color: 'rgb(0,140,255)' }]}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => {
                                Keyboard.dismiss();
                                if (internalValue.trim()) onSubmit(internalValue);
                            }}
                        >
                            <Text allowFontScaling={false} style={[styles.buttonText, confirmButtonStyle]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
