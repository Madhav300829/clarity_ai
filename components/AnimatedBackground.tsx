import React, { useEffect, useRef, FC } from 'react';
import { Theme } from '../context/ThemeContext';

declare const VANTA: any;

interface AnimatedBackgroundProps {
    theme: Theme;
}

export const AnimatedBackground: FC<AnimatedBackgroundProps> = ({ theme }) => {
    const vantaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lightThemeConfig = {
            color: 0x22c55e,      // accent-green-500
            backgroundColor: 0xf8fafc, // slate-50
        };

        const darkThemeConfig = {
            color: 0x4ade80,      // green-400, brighter for dark bg
            backgroundColor: 0x0f172a, // slate-900
        };

        const config = theme === 'dark' ? darkThemeConfig : lightThemeConfig;

        const effect = VANTA.GLOBE({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyrocontrols: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            size: 1.2,
            ...config,
        });

        // Cleanup function to destroy the effect on component unmount or before effect re-runs
        return () => {
            if (effect) {
                effect.destroy();
            }
        };
    }, [theme]); // Rerun effect when theme changes

    return (
        <div ref={vantaRef} className="absolute top-0 left-0 w-full h-full" />
    );
};
