import { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, Image } from 'react-native';
import { Images } from '../../utils/assets';

export default function FloatingIcons() {
  const staticGymIcons = useMemo(() => [
    // Group 1 - no change
    { source: Images.gymIconThriveOne, left: 30, top: 30 },
    { source: Images.gymIconDumbellOne, left: 250, top: 40 },
    { source: Images.gymIconAdidasOne, left: 330, top: 46 },
    { source: Images.gymIconTorsoOne, left: 120, top: 62 },

    // Group 2 - +3 (was +5)
    { source: Images.gymIconBoxOne, left: 70, top: 99 + 3 },         
    { source: Images.gymIconBattleOne, left: 270, top: 114 + 3 },   
    { source: Images.gymIconNikeOne, left: 340, top: 130 + 3 },      
    { source: Images.gymIconEnergyOne, left: 20, top: 146 + 3 },   

    // Group 3 - +5 (was +10)
    { source: Images.gymIconSneakersOne, left: 230, top: 167 + 5 },  
    { source: Images.gymIconSparkOne, left: 300, top: 183 + 5 },   
    { source: Images.gymIconRunningOne, left: 90, top: 199 + 5 },   
    { source: Images.gymIconLegsOne, left: 140, top: 215 + 5 },     

    // Group 4 - +8 (was +15)
    { source: Images.gymIconBoxOne, left: 20, top: 236 + 8 },       
    { source: Images.gymIconUnderArmourOne, left: 200, top: 252 + 8 },
    { source: Images.gymIconSpearOne, left: 350, top: 268 + 8 },   
    { source: Images.gymIconSpartaOne, left: 30, top: 284 + 8 },     

    // Group 5 - +10 (was +20)
    { source: Images.gymIconMyFitnessPalOne, left: 260, top: 304 + 10 },
    { source: Images.gymIconSmartWatchOne, left: 100, top: 280 + 10 }, 
    { source: Images.gymIconNutritionOne, left: 320, top: 336 + 10 },   
    { source: Images.gymIconObeseOne, left: 180, top: 302 + 10 },     

    // Group 6 - +13 (was +25)
    { source: Images.gymIconBicycleOne, left: 100, top: 373 + 13 },    
    { source: Images.gymIconHeartOne, left: 30, top: 369 + 13 },     
    { source: Images.gymIconSkippingOne, left: 250, top: 405 + 13 },  
    { source: Images.gymIconTimerOne, left: 170, top: 340 + 13 },     

    // Group 7 - +15 (was +30)
    { source: Images.gymIconBicepOne, left: 330, top: 441 + 15 },      
    { source: Images.gymIconWeightliftingOne, left: 180, top: 407 + 15 }, 
    { source: Images.gymIconPullupsOne, left: 20, top: 430 + 15 },      
   ], []);

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

  return staticGymIcons.map((icon, index) => {
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
        source={icon.source}
        style={[
          styles.floatingIcon,
          {
            left: relativeLeft(icon.left),
            top: relativeTop(icon.top),
            width: 35,
            height: 35,
            opacity: 0.2,
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
