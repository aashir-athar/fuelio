// Lever: goal-gradient + progress framing — a visible step counter, dot rail, and an
// animated lime progress bar make the four-slide journey feel short and almost finished,
// lifting completion-to-first-vehicle conversion.
import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, duration, radius, space, spring } from '@/src/theme/tokens';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
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
        tag: 'PRIVATE BY DEFAULT',
        title: 'Your garage,\nin your pocket',
        body: 'Every fill-up and service in one calm place. Your data never leaves your phone.',
    },
    {
        image: IMAGES.fueling,
        tag: 'FIVE SECOND LOG',
        title: 'Log a fill\nin one breath',
        body: 'Volume, price, odometer. Fuelio runs a fleet-grade economy algorithm on the rest.',
    },
    {
        image: IMAGES.oilChange,
        tag: 'NEVER FORGET',
        title: 'Catch service\nbefore it bites',
        body: 'Reminders that reach you on time, so a small job never grows into a big bill.',
    },
    {
        image: IMAGES.analysis,
        tag: 'REAL NUMBERS',
        title: 'See where\nyour money goes',
        body: 'Economy, spend, and emissions across weeks and years. No guessing, ever.',
    },
] as const;

const { width: SCREEN_W } = Dimensions.get('window');

export default function WelcomeScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();
    const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
    const [index, setIndex] = useState(0);

    const isLast = index === SLIDES.length - 1;
    const progress = useSharedValue((index + 1) / SLIDES.length);
    const heroScale = useSharedValue(1);

    useEffect(() => {
        const target = (index + 1) / SLIDES.length;
        progress.value = reduceMotion
            ? target
            : withTiming(target, { duration: duration.slow, easing: Easing.out(Easing.cubic) });
    }, [index, progress, reduceMotion]);

    useEffect(() => {
        if (reduceMotion) {
            heroScale.value = 1;
            return;
        }
        // A gentle settle on the hero card each time the slide changes, so the screen
        // feels alive without a perpetual loop.
        heroScale.value = 0.97;
        heroScale.value = withSpring(1, spring.soft);
    }, [index, heroScale, reduceMotion]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const heroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }],
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
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space[4] }}>
            {/* Top rail: wordmark + divided step counter + lime progress bar */}
            <View style={{ paddingHorizontal: space[6], gap: space[4] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                        <Image source={IMAGES.icon} style={{ width: 34, height: 34, borderRadius: radius.sm }} contentFit="contain" />
                        <Text variant="label" weight="semibold">FUELIO</Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'baseline',
                            paddingHorizontal: space[3],
                            paddingVertical: space[1],
                            borderRadius: radius.pill,
                            backgroundColor: colors.surfaceElevated,
                        }}
                    >
                        <Text variant="micro" tone="accent" weight="semibold">{`0${index + 1}`}</Text>
                        <Text variant="micro" tone="muted" weight="semibold">{`  /  0${SLIDES.length}`}</Text>
                    </View>
                </View>

                <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 1, max: SLIDES.length, now: index + 1 }}
                    style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated, overflow: 'hidden' }}
                >
                    <Animated.View
                        style={[progressStyle, { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent }]}
                    />
                </View>
            </View>

            {/* Stage */}
            <View key={index} style={{ flex: 1, paddingHorizontal: space[6], justifyContent: 'center' }}>
                {/* Lime hero — the star of the screen, with the existing image floating on it */}
                <Animated.View
                    entering={reduceMotion ? undefined : FadeIn.duration(duration.slow)}
                    style={heroStyle}
                >
                    <Card tone="lime" style={[{ overflow: 'hidden', alignItems: 'center', paddingVertical: space[8] }, accentGlow(colors.accent)]}>
                        <View
                            style={{
                                alignSelf: 'flex-start',
                                paddingHorizontal: space[3],
                                paddingVertical: 5,
                                borderRadius: radius.pill,
                                backgroundColor: colors.textOnAccent,
                            }}
                        >
                            <Text variant="micro" tone="onAccent" weight="semibold" style={{ color: colors.accent }}>
                                {slide.tag}
                            </Text>
                        </View>
                        <Image
                            source={slide.image}
                            style={{ width: Math.min(240, SCREEN_W * 0.56), height: Math.min(240, SCREEN_W * 0.56), marginTop: space[4] }}
                            contentFit="contain"
                            transition={reduceMotion ? 0 : 220}
                        />
                    </Card>
                </Animated.View>

                {/* Big Manjari headline + supporting copy */}
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInDown.delay(90).duration(duration.slow)}
                    style={{ marginTop: space[7] }}
                >
                    <Text variant="display" style={{ letterSpacing: -1.5 }}>
                        {slide.title}
                    </Text>
                    <Text
                        variant="bodyLg"
                        tone="secondary"
                        style={{ marginTop: space[4], maxWidth: SCREEN_W - space[6] * 2 }}
                    >
                        {slide.body}
                    </Text>
                </Animated.View>

                {/* Dot rail */}
                <Animated.View
                    entering={reduceMotion ? undefined : FadeInDown.delay(160).duration(duration.slow)}
                    style={{ flexDirection: 'row', gap: space[2], marginTop: space[6] }}
                >
                    {SLIDES.map((_, i) => (
                        <Dot key={i} active={i === index} accent={colors.accent} idle={colors.divider} />
                    ))}
                </Animated.View>
            </View>

            {/* Bottom action rail: bold lime pill + ghost skip */}
            <View style={{ paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: insets.bottom + space[5], gap: space[2] }}>
                <Button
                    label={isLast ? 'Add my first vehicle' : 'Continue'}
                    onPress={handleNext}
                    size="lg"
                    fullWidth
                    accessibilityHint={isLast ? 'Continue to set up your vehicle' : 'Go to the next slide'}
                />
                {!isLast ? (
                    <Pressable
                        onPress={handleSkip}
                        accessibilityRole="button"
                        accessibilityLabel="Skip"
                        accessibilityHint="Skip the intro and set up your vehicle"
                        hitSlop={12}
                        style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text variant="body" tone="muted" weight="semibold">Skip intro</Text>
                    </Pressable>
                ) : (
                    <View style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                        <Text variant="caption" tone="muted">Takes about a minute. Worth every second.</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const Dot = React.memo(function Dot({ active, accent, idle }: { active: boolean; accent: string; idle: string }) {
    return (
        <View
            style={{
                width: active ? 26 : 8,
                height: 8,
                borderRadius: radius.pill,
                backgroundColor: active ? accent : idle,
            }}
        />
    );
});
