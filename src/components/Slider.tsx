import React, { useRef, useState } from "react";
import "./Slider.css"; // See CSS below

export interface SliderProps {
    /**
     * Current value of the slider.
     */
    value: number;

    /**
     * Callback when value changes.
     */
    onChange: (value: number) => void;

    /**
     * Minimum value.
     * @default 0
     */
    min?: number;

    /**
     * Maximum value.
     * @default 100
     */
    max?: number;

    /**
     * Step increment.
     * @default 1
     */
    step?: number;

    /**
     * If true, disables the slider.
     * @default false
     */
    disabled?: boolean;

    /**
     * Show value label above or next to the slider.
     * @default false
     */
    showValue?: boolean;

    /**
     * Custom label for the slider.
     */
    label?: string;

    /**
     * Inline styles for the slider container.
     */
    style?: React.CSSProperties;

    /**
     * Additional class name(s) to apply to the slider container.
     */
    className?: string;

    /**
     * Accent color for thumb, fill, and ripple (light mode).
     */
    accentColorLightMode?: string;

    /**
     * Accent color for thumb, fill, and ripple (dark mode).
     */
    accentColorDarkMode?: string;

    /**
     * Override accent color for all modes.
     */
    accentColor?: string;

    /**
     * If true, renders in dark mode.
     * @default false
     */
    darkMode?: boolean;
}


export const Slider: React.FC<SliderProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValue = false,
    label,
    style,
    className,
    accentColorLightMode,
    accentColorDarkMode,
    accentColor,
    darkMode = false
}) => {
    const [ripple, setRipple] = useState(false);
    const thumbRef = useRef<HTMLDivElement>(null);

    // Accent color logic (same as your other components)
    const getAccent = () =>
        accentColor
            || (darkMode ? accentColorDarkMode : accentColorLightMode)
            || (darkMode ? "#4ade80" : "#2563eb");

    // Ripple burst logic
    const triggerRipple = () => {
        setRipple(false);
        setTimeout(() => setRipple(true), 0);
    };

    // Slider value calculations
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div
            className={`prizm-ui-slider-container${disabled ? " disabled" : ""} ${className ?? ""}`}
            style={style}
        >
            {label && <div className="slider-label">{label}</div>}
            <div className="prizm-ui-slider-track-wrapper">
                <div
                    className="prizm-ui-slider-track"
                    style={{
                        background: `linear-gradient(to right, ${getAccent()} ${percent}%, ${darkMode ? "#222" : "#eee"} ${percent}%)`
                    }}
                >
                    <div
                        className={`prizm-ui-slider-thumb${ripple ? " ripple" : ""}`}
                        ref={thumbRef}
                        style={{
                            left: `calc(${percent}% - 18px)`, // Center thumb (thumb is 36px wide)
                            background: getAccent(),
                            boxShadow: darkMode ? "0 0 0 2px #222" : "0 0 0 2px #fff"
                        }}
                        onMouseDown={() => !disabled && triggerRipple()}
                        onMouseEnter={() => !disabled && triggerRipple()}
                    >
                        {/* Ripple burst effect */}
                        <span className={`slider-ripple-circle${ripple ? " show" : ""}`} style={{ background: getAccent() }} />
                    </div>
                    {/* Invisible input overlays track for native dragging */}
                    <input
                        className="prizm-ui-slider-input"
                        type="range"
                        value={value}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        onChange={e => onChange(Number(e.target.value))}
                        style={{
                            accentColor: getAccent()
                        }}
                        tabIndex={disabled ? -1 : 0}
                    />
                </div>
            </div>
            {showValue && <span className="slider-value-label">{value}</span>}
        </div>
    );
};
