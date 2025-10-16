import React, { forwardRef, useState, useRef, useEffect, useLayoutEffect, cloneElement, type ReactElement } from "react";
import * as Colors from "./Colors";
import "./font.css";



export interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    accentColor?: string;
    darkMode?: boolean;
    rounded?: boolean;
    fontSize?: string;
    className?: string;
    accentColorLightMode?: string;
    accentColorDarkMode?: string;
    accentColorAll?: string;
    fontColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    password?: boolean
    showPasswordToggle?: boolean;
    search?: boolean
    rightIconProp?: React.ReactNode;
    label?: string;
    labelPosition?: "left" | "right"; // Optional: support both
    labelColorStatic?: string;
    focusOverride?: "normal" | "no-pointer-focus" | "no-focus";
    emptyPlaceholerColor?: string;
}

// This InputBox is both controlled and uncontrolled friendly!
export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(({
    accentColor,
    darkMode = false,
    rounded = true,
    fontSize = "1em",
    style,
    accentColorDarkMode, accentColorLightMode, className,
    backgroundColor, borderColor, fontColor,
    password, search, showPasswordToggle,
    value: propValue, onChange: propOnChange,
    rightIconProp, label, labelPosition, labelColorStatic, focusOverride = "normal", emptyPlaceholerColor,
    ...props
}, ref) => {

    const [internalValue, setInternalValue] = useState(propValue ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    const rightIconRef = useRef<HTMLElement | null>(null);
    const [rightIconWidth, setRightIconWidth] = useState(0);

    const [focused, setFocused] = useState(false);

    // helpers
    const blockPointerFocus = focusOverride === "no-pointer-focus" || focusOverride === "no-focus";
    const blockAnyFocus = focusOverride === "no-focus";



    useLayoutEffect(() => {
        if (rightIconRef.current) {
            // 1. Function to update the state with the current width of the right icon
            const updateWidth = () => setRightIconWidth(
                rightIconRef.current ? rightIconRef.current.offsetWidth : 0
            );
            updateWidth(); // Set initial width immediately

            // 2. Create a ResizeObserver to watch for size changes
            const observer = new window.ResizeObserver(updateWidth);

            // 3. Start observing the right icon's DOM node for changes in size
            observer.observe(rightIconRef.current);

            // 4. Clean up: stop observing when the icon unmounts or changes
            return () => observer.disconnect();
        } else {
            // No icon? Set width to zero.
            setRightIconWidth(0);
        }
    }, [rightIconProp]);

    //Clone the icon and add the ref so we can measure it
    let rightIconWithRef: React.ReactNode = rightIconProp;
    if (React.isValidElement(rightIconProp)) {
        rightIconWithRef = cloneElement(
            rightIconProp as ReactElement<any>,
            { ref: rightIconRef }
        );
    }


    // For controlled input: sync state if value changes
    useEffect(() => {
        if (propValue !== undefined) setInternalValue(propValue as string);
    }, [propValue]);

    // Unified value (controlled or not)
    const value = propValue !== undefined ? propValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (propOnChange) propOnChange(e);
        else setInternalValue(e.target.value);
    };

    const { MidnightGray, LightGray, SoftBlue, TrueBlue } = Colors;

    const BackgroundColor = backgroundColor ?? (darkMode ? MidnightGray : LightGray);
    const BorderColor = borderColor ?? (darkMode ? LightGray : MidnightGray);
    const FontColor = fontColor ?? (darkMode ? LightGray : MidnightGray);
    const AccentColor = accentColor ??
        (darkMode ?
            (accentColorDarkMode ?? SoftBlue) :
            (accentColorLightMode ?? TrueBlue)
        );
    const LabelColor = labelColorStatic ?? (focused ? AccentColor : BorderColor);
    const EmptyPlaceholderColor = emptyPlaceholerColor ?? Colors.EmptyGray;

    return (
        <div style={{ position: "relative", width: "100%", ...style }}>
            {label && (
                <span className="prizm-ui"
                    style={{
                        position: "absolute",
                        top: -10,
                        [labelPosition === "right" ? "right" : "left"]: 14, // 14px to match input padding
                        fontSize: "0.7em",
                        background: BackgroundColor,
                        color: LabelColor,
                        padding: "0 4px",
                        pointerEvents: "none",
                        zIndex: 2,
                        transition: "color 0.2s",

                    }}
                >
                    {label}
                </span>
            )}
            <input

                ref={node => {
                    inputRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
                }}
                autoComplete="off"
                className={`prizm-ui ${className}`}

                type={"text"}
                value={value}
                onChange={handleChange}
                /* NEW: guard focus routes */
                onPointerDown={(e) => {
                    // If we’re blocking pointer focus, prevent default to stop the focus/caret
                    if (blockPointerFocus) {
                        e.preventDefault();
                        // If it somehow already had focus (rare), blur it
                        inputRef.current?.blur();
                    }
                    // Allow caller’s pointer handler to run afterwards, if they passed one
                    props.onPointerDown && props.onPointerDown(e);
                }}
                onFocus={(e) => {
                    if (blockAnyFocus) {
                        // Immediately bounce focus away
                        e.preventDefault();
                        // Some browsers still focus briefly; ensure blur
                        e.currentTarget.blur();
                        return;
                    }
                    setFocused(true);
                    e.currentTarget.style.borderColor = AccentColor;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${AccentColor}22`;
                    props.onFocus && props.onFocus(e);
                }}
                onBlur={e => {
                    setFocused(false);
                    e.currentTarget.style.borderColor = BorderColor;
                    e.currentTarget.style.boxShadow = "none";
                    props.onBlur && props.onBlur(e);
                }}

                /* Accessibility + mobile keyboard hints */
                tabIndex={blockAnyFocus ? -1 : props.tabIndex}
                // inputmode="none" hints mobile to not show keyboard; combined with pointer block is reliable
                inputMode={blockPointerFocus ? "none" : props.inputMode}
                {...props}
                style={{
                    caretColor: AccentColor,
                    background: BackgroundColor,
                    color: FontColor,
                    border: `1px solid ${BorderColor}`,
                    outline: "none",
                    padding: "9px 12px",
                    fontSize,
                    borderRadius: rounded ? 8 : 2,
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    transition: "border-color 0.18s, box-shadow 0.18s",
                    boxSizing: "border-box",
                    userSelect: "text",
                    WebkitUserSelect: "text",
                    touchAction: "manipulation",
                    cursor: props.readOnly ? "pointer" : (props.disabled ? "not-allowed" : "text"),
                    paddingRight: (rightIconProp ? rightIconWidth + 20 : undefined),
                    // @ts-ignore: custom CSS var
                    '--placeholder-color': EmptyPlaceholderColor
                }}
            />
            {rightIconWithRef}
        </div>
    );
});
InputBox.displayName = "TextBox";
