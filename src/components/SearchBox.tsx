import React, { useRef } from "react";
import { InputBox, type InputBoxProps } from "./InputBox";
import { Button } from "./Button";
import * as Colors from "./Colors";
import * as Icons from "./Icons";
import "./font.css";


export interface SearchBoxProps extends Omit<InputBoxProps, "rightIconProp" | "type" | "password"> {
    xButtonColor?: string
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(({xButtonColor, ...props}, ref) => {

    const inputRef = useRef<HTMLInputElement>(null);
    // Support both controlled and uncontrolled usage
    const isControlled = props.value !== undefined;
    const [internalValue, setInternalValue] = React.useState("");
    const value = isControlled ? (props.value as string) : internalValue;

    const { MidnightGray, LightGray } = Colors;   

    const FontColor = xButtonColor ?? props.fontColor ?? (props.darkMode ? LightGray : MidnightGray)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.onChange) props.onChange(e);
        if (!isControlled) setInternalValue(e.target.value);
    };

    const handleClear = () => {
        if (props.onChange) {
            // Controlled mode: fire event
            const event = {
                ...new Event("change"),
                target: { value: "" },
                currentTarget: { value: "" }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            props.onChange(event);
        } else {
            setInternalValue("");
        }
        // Focus input
        if (inputRef.current) inputRef.current.focus();
    };

    // Show clear button if there's a value and not disabled/readOnly
    const showClear = !!value && !props.disabled && !props.readOnly;

    const rightIcon = showClear ? (
        <Button
            tabIndex={-1}
            aria-label="Clear"
            style={{
                background: "none",
                border: "none",
                outline: "none",
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            onClick={handleClear}
            noOutline={true}
            icon={<Icons.ClearIcon color={FontColor} />}
        />
    ) : undefined;

    return (
        <InputBox
            {...props}
            ref={node => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
            }}
            type="text"
            rightIconProp={rightIcon}
            value={value}
            onChange={handleChange}
            
            autoComplete="off"
        />
    );
});
SearchBox.displayName = "SearchBox";
