import { Avatar } from '@/src/components/primitives/Avatar';
import { Button } from '@/src/components/primitives/Button';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SLIDES = [
    {
        image: IMAGES.onboarding,
        title: 'Welcome to Fuelio',
        body: 'Your car’s best friend. Offline, private, and always by your side.',
    },
    {
        image: IMAGES.fueling,
        title: 'Log fuel in 5 seconds',
        body: 'Liters, price, odometer — done. We handle the math with a best-in-class algorithm.',
    },
    {
        image: IMAGES.oilChange,
        title: 'Never miss an oil change',
        body: 'Smart reminders for every service. Stay ahead, save on repairs.',
    },
    {
        image: IMAGES.analysis,
        title: 'See your savings in perfect graphs',
        body: 'Daily, monthly, yearly trends — know exactly where your money goes.',
    },
];

const { width: SCREEN_W } = Dimensions.get('window');

export default function WelcomeScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
    const [index, setIndex] = useState(0);

    const handleNext = useCallback(() => {
        if (index < SLIDES.length - 1) setIndex(index + 1);
        else {
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
            {/* Progress pips */}
            <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: space[8] }}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 6,
                            width: i === index ? 24 : 6,
                            borderRadius: 3,
                            backgroundColor: i === index ? colors.accent : colors.surfaceElevated,
                        }}
                    />
                ))}
            </View>

            <ScrollView
                key={index}
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: space[6], alignItems: 'center', justifyContent: 'center' }}
            >
                <Animated.View entering={FadeIn.duration(420)}>
                    <Avatar source={slide.image} size={280} tinted={false} />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ alignItems: 'center', marginTop: space[6] }}>
                    <Text variant="title" style={{ textAlign: 'center' }}>{slide.title}</Text>
                    <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center', marginTop: space[3], maxWidth: SCREEN_W - 80 }}>
                        {slide.body}
                    </Text>
                </Animated.View>
            </ScrollView>

            <View style={{ padding: space[6], paddingBottom: insets.bottom + space[5], gap: space[3] }}>
                <Button
                    label={index === SLIDES.length - 1 ? 'Add My First Vehicle' : 'Continue'}
                    onPress={handleNext}
                    size="lg"
                    fullWidth
                />
                {index < SLIDES.length - 1 ? (
                    <Button label="Skip" onPress={handleSkip} variant="ghost" fullWidth />
                ) : null}
            </View>
        </View>
    );
}