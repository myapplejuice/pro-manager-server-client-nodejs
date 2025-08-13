import { useRef } from 'react';
import { scaleFont } from '../../utils/scale-fonts'

import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
} from 'react-native';

export default function AnimatedButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const deafen = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    Animated.spring(deafen, {
      toValue: 0.50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.spring(deafen, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          style,
          { transform: [{ scale }] },
          disabled && styles.disabled,
        ]}
      >
        <Text allowFontScaling={false} style={[styles.text, textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgb(26, 26, 27)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
});