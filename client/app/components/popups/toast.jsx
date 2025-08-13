import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Dimensions } from "react-native";
import {scaleFont} from '../../utils/scale-fonts'

export default function Toast({ message = "", onFinish = () => { } }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const { width } = Dimensions.get("window");

  const styles = StyleSheet.create({
    toastContainer: {
      position: "absolute",
      top: 50,
      left: width * 0.1,
      width: width * 0.8,
      backgroundColor: "#222",
      padding: 15,
      borderRadius: 10,
      zIndex: 9999,
      alignItems: "center",
    },
    toastText: {
      color: "#0af",
      fontSize: scaleFont(16),
      textAlign: "center",
    },
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish?.();
    });
  }, []);

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
      <Text allowFontScaling={false} style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}