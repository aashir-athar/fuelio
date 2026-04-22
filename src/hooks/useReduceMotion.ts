import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Respects OS-level "Reduce Motion" preference.
 * Accessibility AA requirement.
 */
export function useReduceMotion(): boolean {
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => { });
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
        return () => sub.remove();
    }, []);

    return reduce;
}