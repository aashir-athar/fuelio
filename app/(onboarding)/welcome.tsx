// Lever: goal-gradient + progress framing — a visible step counter and animated
// progress bar make the four-slide journey feel short and almost finished, lifting
// completion-to-first-vehicle conversion.
import { Avatar } from '@/src/components/primitives/Avatar';
import { Button } from '@/src/components/primitives/Button';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, duration, radius, space, spring } from '@/src/theme/tokens';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SLIDES = [
    {
        image: IMAGES.onboarding,
        title: 'Welcome to Fuelio',
        body: 'Every fill-up and service in one calm place. Your data stays on your phone.',
    },
    {
        image: IMAGES.fueling,
        title: 'Log a fill in five seconds',
        body: 'Volume, price, odometer. Fuelio does the rest with a fleet-grade economy algorithm.',
    },
    {
        image: IMAGES.oilChange,
        title: 'Never miss an oil change',
        body: 'Reminders that reach you on time, so small jobs never turn into big bills.',
    },
    {
        image: IMAGES.analysis,
        title: 'See your real numbers',
        body: 'Economy, spend, and emissions across weeks and years. Know exactly where your money goes.',
    },
] as const;

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_SIZE = Math.min(300, SCREEN_W - space[6] * 2 - space[10]);

export default function WelcomeScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();
    const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
    const [index, setIndex] = useState(0);

    const isLast = index === SLIDES.length - 1;
    const progress = useSharedValue((index + 1) / SLIDES.length);
    const haloScale = useSharedValue(1);

    useEffect(() => {
        const target = (index + 1) / SLIDES.length;
        progress.value = reduceMotion
            ? target
            : withTiming(target, { duration: duration.slow, easing: Easing.out(Easing.cubic) });
    }, [index, progress, reduceMotion]);

    useEffect(() => {
        if (reduceMotion) {
            haloScale.value = 1;
            return;
        }
        // Re-trigger a gentle settle on the accent halo each time the slide changes,
        // so the hero feels alive without a perpetual loop.
        haloScale.value = 0.92;
        haloScale.value = withSpring(1, spring.soft);
    }, [index, haloScale, reduceMotion]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const haloStyle = useAnimatedStyle(() => ({
        transform: [{ scale: haloScale.value }],
    }));

    const handleNext = useCallback(() => {
        if (index < SLIDES.length - 1) {
            setIndex((i) => i + 1);
        } else {
            completeOnboarding();
            router.replace('/(onboarding)/add-first-vehicle');
        }
    }, [index, completeOnboarding, router]);

    const handleSkip = useCallback(() => {
        completeOnboarding();
        router.replace('/(onboarding)/add-first-vehicle');
    }, [completeOnboarding, router]);

    const slide = SLIDES[index]!;

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space[5] }}>
            <View style={{ paddingHorizontal: space[6], gap: space[3] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="label" tone="muted" weight="semibold">
                        {`STEP ${index + 1} OF ${SLIDES.length}`}
                    </Text>
                    <Text variant="label" tone="accent" weight="semibold">
                        FUELIO
                    </Text>
                </View>

                <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 1, max: SLIDES.length, now: index + 1 }}
                    style={{
                        height: 6,
                        borderRadius: radius.pill,
                        backgroundColor: colors.surfaceElevated,
                        overflow: 'hidden',
                    }}
                >
                    <Animated.View
                        style={[
                            progressStyle,
                            { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
                        ]}
                    />
                </View>
            </View>

            <ScrollView
                key={index}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: space[6],
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Animated.View
                    entering={reduceMotion ? undefined : FadeIn.duration(duration.slow)}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                    <Animated.View
                        style={[
                            haloStyle,
                            {
                                position: 'absolute',
                                width: HERO_SIZE * 1.12,
                                height: HERO_SIZE * 1.12,
                                borderRadius: (HERO_SIZE * 1.12) / 2,
                                backgroundColor: colors.accentSoft,
                            },
                            accentGlow(colors.accent),
                        ]}
                    />
                    <Avatar source={slide.image} size={HERO_SIZE} tinted={false} />
                </Animated.View>

                <Animated.View
                    entering={reduceMotion ? undefined : FadeInDown.delay(120).duration(duration.slow)}
                    style={{ alignItems: 'center', marginTop: space[8] }}
                >
                    <Text variant="title" style={{ textAlign: 'center' }}>
                        {slide.title}
                    </Text>
                    <Text
                        variant="bodyLg"
                        tone="secondary"
                        style={{ textAlign: 'center', marginTop: space[3], maxWidth: SCREEN_W - space[10] - space[6] }}
                    >
                        {slide.body}
                    </Text>
                </Animated.View>
            </ScrollView>

            <View style={{ paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: insets.bottom + space[5], gap: space[3] }}>
                <Button
                    label={isLast ? 'Add my first vehicle' : 'Continue'}
                    onPress={handleNext}
                    size="lg"
                    fullWidth
                    accessibilityHint={isLast ? 'Continue to set up your vehicle' : 'Go to the next slide'}
                />
                {!isLast ? (
                    <Button
                        label="Skip"
                        onPress={handleSkip}
                        variant="ghost"
                        fullWidth
                        accessibilityHint="Skip the intro and set up your vehicle"
                    />
                ) : null}
            </View>
        </View>
    );
}
