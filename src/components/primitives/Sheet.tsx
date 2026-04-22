import React, { useEffect } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { duration, radius, space, spring } from '../../theme/tokens';

interface Props {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    heightRatio?: number; // 0..1
}

const { height: SCREEN_H } = Dimensions.get('window');

export function Sheet({ visible, onClose, children, heightRatio = 0.82 }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const sheetHeight = SCREEN_H * heightRatio;
    const translateY = useSharedValue(sheetHeight);
    const scrimOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, spring.smooth);
            scrimOpacity.value = withTiming(1, { duration: duration.normal });
        } else {
            translateY.value = withTiming(sheetHeight, { duration: duration.fast });
            scrimOpacity.value = withTiming(0, { duration: duration.fast });
        }
    }, [visible, sheetHeight, translateY, scrimOpacity]);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateY.value = Math.max(0, e.translationY);
            scrimOpacity.value = 1 - Math.min(1, e.translationY / sheetHeight);
        })
        .onEnd((e) => {
            if (e.translationY > 120 || e.velocityY > 600) {
                translateY.value = withTiming(sheetHeight, { duration: duration.fast });
                scrimOpacity.value = withTiming(0, { duration: duration.fast });
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0, spring.smooth);
                scrimOpacity.value = withTiming(1, { duration: duration.fast });
            }
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));
    const scrimStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.value }));

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
            animationType="none"
        >
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
                    <Pressable
                        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
                        onPress={onClose}
                        accessibilityLabel="Dismiss"
                    />
                </Animated.View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            styles.sheet,
                            sheetStyle,
                            {
                                height: sheetHeight,
                                backgroundColor: colors.surface,
                                paddingBottom: insets.bottom + space[4],
                                shadowColor: '#000',
                                shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
                                shadowRadius: 22,
                                shadowOffset: { width: 0, height: -6 },
                                elevation: 18,
                            },
                        ]}
                    >
                        <View style={styles.handleWrap}>
                            <View style={[styles.handle, { backgroundColor: colors.divider }]} />
                        </View>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={0}
                        >
                            {children}
                        </KeyboardAvoidingView>
                    </Animated.View>
                </GestureDetector>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
    },
    handleWrap: { alignItems: 'center', paddingVertical: space[3] },
    handle: { width: 44, height: 5, borderRadius: 3 },
});