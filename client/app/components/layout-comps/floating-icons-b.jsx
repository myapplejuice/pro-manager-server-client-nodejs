import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, Image } from 'react-native';
import { Images } from '../../utils/assets';

export default function FloatingIconsB() {
  const icons = useMemo(() => [
    Images.gymIconThriveOne,
    Images.gymIconDumbellOne,
    Images.gymIconAdidasOne,
    Images.gymIconTorsoOne,
    Images.gymIconBoxOne,
    Images.gymIconBattleOne,
    Images.gymIconNikeOne,
    Images.gymIconEnergyOne,
    Images.gymIconSneakersOne,
    Images.gymIconSparkOne,
    Images.gymIconRunningOne,
    Images.gymIconLegsOne,
    Images.gymIconUnderArmourOne,
    Images.gymIconSpearOne,
    Images.gymIconSpartaOne,
    Images.gymIconMyFitnessPalOne,
    Images.gymIconSmartWatchOne,
    Images.gymIconNutritionOne,
    Images.gymIconObeseOne,
    Images.gymIconBicycleOne,
    Images.gymIconSpartanWarriorOne,
    Images.gymIconSpartanWarriorTwo,
    Images.gymIconWarriorOne,
    Images.gymIconFistOne,
    Images.gymIconHeartCheckOne
  ], []);

  // Get device screen dimensions
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const PADDING = 20; // Margin from edges to avoid placing icons too close to corners

  // Generate randomized icon position/size data
  const iconData = useMemo(() => {
    // Simple deterministic pseudo-random number generator using sine wave math
    const rand = (seed) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x); // returns value in [0,1)
    };

    return icons.map((_, i) => ({
      // Randomized X starting position with edge padding
      startX: rand(i * 1.23) * (SCREEN_WIDTH - 60 - 2 * PADDING) + PADDING,

      // Randomized Y starting position with padding, nudged down by +30 to avoid clustering at top
 startY: rand(i * 4.56) * (SCREEN_HEIGHT - 60 - 2 * PADDING) + PADDING,

      // Randomized size between 25px and 55px (25 + up to 30)
      size: 25 + rand(i * 7.89) * 30,

      // Icon opacity (fixed low transparency for soft floating effect)
      opacity: 0.2,

      // How long it takes to move horizontally (ms)
      animationDurationX: 3000 + rand(i * 3.14) * 3000,

      // How long it takes to move vertically (ms)
      animationDurationY: 3000 + rand(i * 5.67) * 3000,
    }));
  }, [icons, SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Helper to generate random target position for roaming inside bounds
  const randomTarget = (exclude, max, padding) => {
    let target;
    do {
      target = Math.random() * (max - 2 * padding) + padding;
    } while (Math.abs(target - exclude) < 20); // avoid targets too close to current pos
    return target;
  };

  return (
    <>
      {icons.map((source, index) => {
        const posX = useRef(new Animated.Value(iconData[index].startX)).current;
        const posY = useRef(new Animated.Value(iconData[index].startY)).current;
        const opacity = useRef(new Animated.Value(0)).current;

        // Animate opacity fade in
        useEffect(() => {
          Animated.timing(opacity, {
            toValue: iconData[index].opacity,
            duration: 1500,
            delay: index * 200,
            useNativeDriver: true,
          }).start();
        }, []);

        // Function to animate X roaming
        const animateX = (currentValue) => {
          const toValue = randomTarget(currentValue, SCREEN_WIDTH, PADDING);
          Animated.timing(posX, {
            toValue,
            duration: iconData[index].animationDurationX,
            useNativeDriver: true,
          }).start(() => animateX(toValue)); // loop with new target
        };

        // Function to animate Y roaming
        const animateY = (currentValue) => {
          const toValue = randomTarget(currentValue, SCREEN_HEIGHT, PADDING);
          Animated.timing(posY, {
            toValue,
            duration: iconData[index].animationDurationY,
            useNativeDriver: true,
          }).start(() => animateY(toValue)); // loop with new target
        };

        // Start roaming animations once
        useEffect(() => {
          animateX(iconData[index].startX);
          animateY(iconData[index].startY);
        }, []);

        return (
          <Animated.Image
            key={index}
            source={source}
            style={[
              styles.icon,
              {
                width: iconData[index].size,
                height: iconData[index].size,
                opacity,
                transform: [
                  { translateX: posX },
                  { translateY: posY },
                ],
              },
            ]}
            resizeMode="contain"
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    zIndex: 0,
  },
});
