import { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Animated, StyleSheet, Text, BackHandler, Dimensions, Image } from 'react-native';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets'
import AnimatedButton from '../../components/screen-comps/animated-button';
import { routes } from '../../utils/settings/constants';
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import FloatingIcons from '../../components/layout-comps/floating-icons';

export default function Introduction() {
  const { setBackHandler } = useBackHandlerContext();

  useFocusEffect(
    useCallback(() => {
      setBackHandler(() => {
        BackHandler.exitApp();
        return true;
      });
    }, [])
  );

  return (
    <View style={styles.main}>
      <FloatingIcons/>
      <View style={styles.contentContainer}>
        <View style={styles.introductionContainer}>
          <Image
            style={styles.logo}
            source={Images.logo}
          />
          <Text allowFontScaling={false} style={styles.welcomeText}>Welcome to{'\n'}Pro Manager</Text>
          <Text allowFontScaling={false} style={styles.introText}>Hire coaches, train athletes and create new connections</Text>
        </View>
        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="REGISTER"
            onPress={() => router.push(routes.REGISTER)}
            style={[styles.button, styles.registerButton]}
            textStyle={[styles.buttonText, styles.registerButtonText]}
          />
          <AnimatedButton
            title="SIGN IN"
            onPress={() => router.push(routes.LOGIN)}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  main: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgb(10,10,10)" },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  introductionContainer: {
    flex: 2,
    width: "100%",
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 180,
    height: 140
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: scaleFont(50),
    fontWeight: 'bold',
    color: 'rgb(0,140,255)',
    marginVertical: 10,
  },
  introText: {
    textAlign: 'center',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: 'rgb(255, 255, 255)',
    fontFamily: 'monospace',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  button: {
    marginVertical: 15,
    backgroundColor: 'rgb(0, 140, 255)',
    width: Dimensions.get('window').width * 0.8,
    height: 50,
    borderRadius: 20
  },
  buttonText: {
    fontFamily: 'monospace',
    fontSize: scaleFont(12)
  },
  registerButton: {
    backgroundColor: 'rgb(10,10,10)',
    borderColor: 'rgb(0,140,255)',
    borderWidth: 1,
  },
  registerButtonText: {
    color: 'rgb(0,140,255)',
  }
});