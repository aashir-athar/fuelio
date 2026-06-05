import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../hooks/useReduceMotion';

/** Matches app.json's native splash background so the handoff is seamless. */
const SPLASH_BG = '#0D1117';
const MIN_VISIBLE_MS = 1500;

/**
 * Animated splash overlay. Plays over the app once the native splash hides, then
 * fades out and unmounts. The app renders underneath the whole time, so if Lottie
 * fails to render for any reason the worst case is a brief branded fade — never a
 * broken screen. Honors Reduce Motion (static brand mark, no Lottie).
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(1);
  const iconScale = useSharedValue(reduceMotion ? 1 : 0.7);
  const iconOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const [visible, setVisible] = useState(true);

  const hide = useCallback(() => {
    setVisible(false);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (!reduceMotion) {
      iconOpacity.value = withTiming(1, { duration: 400 });
      iconScale.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.6)) });
    }
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 420, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) runOnJS(hide)();
      });
    }, MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion, hide, opacity, iconOpacity, iconScale]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      {reduceMotion ? null : (
        <LottieView
          source={require('../../assets/lottie/splash.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      )}
      <Animated.View style={iconStyle}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.icon}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lottie: {
    position: 'absolute',
    width: 248,
    height: 248,
  },
  icon: {
    width: 108,
    height: 108,
  },
});
