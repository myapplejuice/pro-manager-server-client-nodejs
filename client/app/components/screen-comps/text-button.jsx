import  { useRef } from 'react';
import { scaleFont } from '../../utils/scale-fonts'
import { Text, StyleSheet, Animated, TouchableWithoutFeedback, } from 'react-native';

export default function TextButton({
  onPress,
  mainText,
  linkText,
  containerStyle,
  mainTextStyle,
  linkTextStyle,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
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
          styles.container,
          containerStyle,
          { transform: [{ scale }] },
          disabled && styles.disabled,
        ]}
      >
        <Text allowFontScaling={false} style={[styles.mainText, mainTextStyle]}>
          {mainText}
          {linkText ? (
            <>
              {"\n"}
              <Text allowFontScaling={false} style={[styles.linkText, linkTextStyle]}>{linkText}</Text>
            </>
          ) : null}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
  },
  mainText: {
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
  },
  linkText: {
    color: 'rgb(0, 140, 255)',
  },
  disabled: {
    opacity: 0.5,
  },
});