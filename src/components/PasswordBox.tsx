import React, { useState } from "react";
import { InputBox, type InputBoxProps } from "./InputBox";
import * as Colors from "./Colors";
import { Button } from "./Button";
import "./font.css";


export interface PasswordBoxProps extends Omit<InputBoxProps, "type" | "password" | "showPasswordToggle" | "rightIcon"> {
    showPasswordToggle?: boolean;
    toggleButtonColor?: string
}

export const PasswordBox = React.forwardRef<HTMLInputElement, PasswordBoxProps>(
    ({ showPasswordToggle = true, toggleButtonColor, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        const { MidnightGray, LightGray } = Colors;

        const ToggleButtonColor = toggleButtonColor ?? (props.darkMode ? LightGray : MidnightGray)

        // Build the icon for toggling show/hide
        const rightIcon = showPasswordToggle && (
            <Button
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "0.6em",
                    padding: 0, 
                    fontFamily: "inherit"

                }}
                fontColor={ToggleButtonColor}
                noOutline={true}
                onClick={() => setShowPassword(v => !v)}
                icon={showPassword ? "Hide Password" : "Show Password"}
            />
        );


        return (
            <InputBox
                {...props}
                ref={ref}
                type={showPassword ? "text" : "password"}
                password={true}
                rightIconProp={rightIcon}
            />
        );
    }
);

PasswordBox.displayName = "PasswordBox";
