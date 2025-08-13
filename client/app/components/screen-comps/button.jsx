import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {scaleFont} from '../../utils/scale-fonts'

export default function Button({
  title,
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
}) {
  const combinedButtonStyle = [
    styles.button,
    style,
    disabled && styles.disabledButton,
  ];

  const combinedTextStyle = [
    styles.buttonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={combinedButtonStyle}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text allowFontScaling={false} style={combinedTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgb(26, 26, 27)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});