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

export default function HireCoachWindow({
    onSubmit = () => { },
    onCancel = () => { },
}) {
    const [message, setMessage] = useState("");
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                    <Text allowFontScaling={false} style={styles.title}>Hire Coach</Text>
                    <Text allowFontScaling={false} style={styles.text}>Write a message to the coach (optional):</Text>
                    <TextInput
                        allowFontScaling={false}
                        ref={inputRef}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Introduce yourself and explain your goals..."
                        placeholderTextColor="gray"
                        style={styles.input}
                        multiline
                        numberOfLines={4}
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.buttonContainer} onPress={onCancel}>
                            <Text allowFontScaling={false} style={[styles.buttonText, { color: 'rgb(255,59,48)' }]}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => onSubmit(message)}
                        >
                            <Text allowFontScaling={false} style={styles.buttonText}>SEND</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

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
        padding: 15,
        marginBottom: 150,
        borderRadius: 20,
    },
    title: {
        color: "rgb(0, 140, 255)",
        fontWeight: "bold",
        fontSize: scaleFont(25),
        marginBottom: 10,
    },
    text: {
        color: "white",
        fontSize: scaleFont(12),
        marginBottom: 10,
    },
    input: {
        backgroundColor: "rgb(39, 40, 56)",
        color: "white",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: scaleFont(14),
        minHeight: 80,
        textAlignVertical: "top"
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 15,
    },
    buttonContainer: {
        padding: 10,
    },
    buttonText: {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: scaleFont(10),
        color: "rgb(0, 140, 255)",
    }
});
