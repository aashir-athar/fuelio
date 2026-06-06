import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { fontFamily } from '../theme/tokens';

/** Fixed brand colors — the splash is always dark + lime regardless of theme. */
const SPLASH_BG = '#0D1117';
const LIME = '#B6F24D';
const MIN_VISIBLE_MS = 1750;

/**
 * Animated brand splash. Plays over the app once the native splash hides: the mark
 * springs in inside a sweeping lime ring with a soft glow, the FUELIO wordmark rises,
 * then the whole thing fades out and unmounts. The app renders underneath, so it can
 * never block startup. Honors Reduce Motion (static, no Lottie).
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(1);
  const iconScale = useSharedValue(reduceMotion ? 1 : 0.55);
  const iconOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const wordY = useSharedValue(reduceMotion ? 0 : 16);
  const wordOpacity = useSharedValue(reduceMotion ? 1 : 0);
  const underline = useSharedValue(reduceMotion ? 1 : 0);
  const [visible, setVisible] = useState(true);

  const hide = useCallback(() => {
    setVisible(false);
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (!reduceMotion) {
      iconOpacity.value = withTiming(1, { duration: 360 });
      iconScale.value = withTiming(1, { duration: 680, easing: Easing.out(Easing.back(2)) });
      wordOpacity.value = withDelay(360, withTiming(1, { duration: 420 }));
      wordY.value = withDelay(360, withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }));
      underline.value = withDelay(680, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    }
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 460, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) runOnJS(hide)();
      });
    }, MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion, hide, opacity, iconOpacity, iconScale, wordOpacity, wordY, underline]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const iconStyle = useAnimatedStyle(() => ({ opacity: iconOpacity.value, transform: [{ scale: iconScale.value }] }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: wordOpacity.value, transform: [{ translateY: wordY.value }] }));
  const underlineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: underline.value }] }));

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, containerStyle]}>
      <View style={styles.markBox}>
        <View style={styles.glow} />
        {reduceMotion ? null : (
          <LottieView source={require('../../assets/lottie/splash.json')} autoPlay loop={false} style={styles.ring} />
        )}
        <Animated.View style={iconStyle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.icon} contentFit="contain" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.wordWrap, wordStyle]}>
        <RNText style={styles.word}>FUELIO</RNText>
        <Animated.View style={[styles.underline, underlineStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: SPLASH_BG, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  markBox: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: LIME, opacity: 0.12 },
  ring: { position: 'absolute', width: 240, height: 240 },
  icon: { width: 132, height: 132 },
  wordWrap: { marginTop: 26, alignItems: 'center' },
  word: { fontFamily: fontFamily.display, fontSize: 42, letterSpacing: -1, color: LIME },
  underline: { marginTop: 10, height: 4, width: 72, borderRadius: 2, backgroundColor: LIME },
});
