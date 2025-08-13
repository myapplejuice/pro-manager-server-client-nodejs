import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { Images } from '../../utils/assets';

export default function FloatingIconsC() {
    const OPACITY_COUNT = 29;
    const staticGymIcons = useMemo(() => [
  { source: Images.gymIconThriveOne, left: 30, top: 30 },
        { source: Images.gymIconDumbellOne, left: 250, top: 40 },
        { source: Images.gymIconAdidasOne, left: 330, top: 46 },
        { source: Images.gymIconTorsoOne, left: 120, top: 62 },

        { source: Images.gymIconBoxOne, left: 70, top: 102 },
        { source: Images.gymIconBattleOne, left: 270, top: 117 },
        { source: Images.gymIconNikeOne, left: 340, top: 133 },
        { source: Images.gymIconEnergyOne, left: 20, top: 149 },

        { source: Images.gymIconSneakersOne, left: 230, top: 172 },
        { source: Images.gymIconSparkOne, left: 300, top: 188 },
        { source: Images.gymIconRunningOne, left: 90, top: 204 },
        { source: Images.gymIconLegsOne, left: 140, top: 220 },

        { source: Images.gymIconBoxOne, left: 20, top: 244 },
        { source: Images.gymIconUnderArmourOne, left: 200, top: 260 },
        { source: Images.gymIconSpearOne, left: 300, top: 276 },
        { source: Images.gymIconSpartaOne, left: 30, top: 292 },

        { source: Images.gymIconMyFitnessPalOne, left: 260, top: 314 },
        { source: Images.gymIconSmartWatchOne, left: 100, top: 290 },
        { source: Images.gymIconNutritionOne, left: 320, top: 346 },
        { source: Images.gymIconObeseOne, left: 180, top: 308 },

        { source: Images.gymIconBicycleOne, left: 100, top: 386 },
        { source: Images.gymIconHeartOne, left: 30, top: 382 },
        { source: Images.gymIconSkippingOne, left: 250, top: 418 },
        { source: Images.gymIconTimerOne, left: 170, top: 353 },

        { source: Images.gymIconBicepOne, left: 330, top: 420 },
        { source: Images.gymIconWeightliftingOne, left: 180, top: 422 },
        { source: Images.gymIconPullupsOne, left: 100, top: 485 },
        { source: Images.gymIconSpartanWarriorOne, left: 20, top: 445 },

        { source: Images.gymIconSpartanWarriorTwo, left: 20, top: 510 },
        { source: Images.gymIconWarriorOne, left: 300, top: 480 },
        { source: Images.gymIconFistOne, left: 340, top: 500 },
        { source: Images.gymIconHeartCheckOne, left: 200, top: 470 },
]
, []);

    const maxLeft = useMemo(() => Math.max(...staticGymIcons.map(i => i.left)), [staticGymIcons]);
    const BASE_WIDTH = maxLeft + 20;
    const BASE_HEIGHT = 640;
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

    const canvasOffsetX = 10;
    const canvasOffsetY = 15;
    const scaleX = SCREEN_WIDTH / BASE_WIDTH;
    const scaleY = SCREEN_HEIGHT / BASE_HEIGHT;

    function relativeLeft(left) {
        return Math.max(0, Math.min(left, BASE_WIDTH) * scaleX - canvasOffsetX);
    }

    function relativeTop(top) {
        return Math.max(0, top * scaleY - canvasOffsetY);
    }

    // Manage current icon sources in state to enable swapping
    const [iconsState, setIconsState] = useState(staticGymIcons.map(icon => icon.source));

    // Store animated opacity refs per icon
    const opacities = useRef(staticGymIcons.map(() => new Animated.Value(0.2))).current;

    useEffect(() => {
        const interval = setInterval(() => {
            let i = Math.floor(Math.random() * iconsState.length);
            let j;
            do {
                j = Math.floor(Math.random() * iconsState.length);
            } while (j === i);

            // Fade out both icons
            Animated.parallel([
                Animated.timing(opacities[i], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacities[j], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIconsState(prev => {
                    const newState = [...prev];
                    [newState[i], newState[j]] = [newState[j], newState[i]];
                    return newState;
                });

                Animated.parallel([
                    Animated.timing(opacities[i], {
                        toValue: 0.2, // fade back to base opacity
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacities[j], {
                        toValue: 0.2,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [iconsState, opacities]);

    return iconsState.map((source, index) => {
        // Floating animation (vertical oscillation)
        const floating = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const direction = index % 2 === 0 ? -10 : 10;

            Animated.loop(
                Animated.sequence([
                    Animated.timing(floating, {
                        toValue: direction,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floating, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, []);

        return (
            <Animated.Image
                key={index}
                source={source}
                style={[
                    styles.floatingIcon,
                    {
                        left: relativeLeft(staticGymIcons[index].left),
                        top: relativeTop(staticGymIcons[index].top),
                        width: 35,
                        height: 35,
                        opacity: opacities[index],
                        transform: [{ translateY: floating }],
                    },
                ]}
            />
        );
    });
}

const styles = StyleSheet.create({
    floatingIcon: {
        position: 'absolute',
        zIndex: 0,
    },
});
