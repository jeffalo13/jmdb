import React, { useRef } from "react";
import "./Checkbox.css";
import * as Colors from './Colors';

/**
 * Props for the Checkbox component.
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * The accent color for the checkbox when checked and for the ripple effect.
     */
    accentColor?: string;

    /**
     * If true, renders a circular checkbox; otherwise, renders a square checkbox.
     * @default false
     */
    isRadioButton?: boolean;

    /**
     * If true, applies a visual "glow" effect when hovered.
     */
    hovered?: boolean;

    /**
     * If true, enables dark mode styles.
     * @default false
     */
    darkMode?: boolean;

    /**
     * The fill color of the checkbox when unchecked.
     */
    buttonEmptyColor?: string;

    /**
     * The border color of the checkbox.
     */
    buttonBorderColor?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  accentColor,
  isRadioButton: isCircle = false,
  hovered,
  checked,
  darkMode = false,
  buttonEmptyColor,
  buttonBorderColor,
  style,
  ...props
}) => {
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const {MidnightGray, LightGray, SoftBlue, TrueBlue} = Colors;
  
  const AccentColor = accentColor ? accentColor : (darkMode ? SoftBlue : TrueBlue);
  const ButtonEmptyColor = buttonEmptyColor ? buttonEmptyColor : (darkMode ? MidnightGray : LightGray)
  const ButtonBorderColor = buttonBorderColor ? buttonBorderColor : (darkMode ? LightGray : MidnightGray)



  function handleClick(_: React.MouseEvent<HTMLInputElement>) {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    Array.from(wrapper.querySelectorAll('.checkbox-ripple')).forEach(el => el.remove());
    const ripple = document.createElement("span");
    ripple.className = "checkbox-ripple " + (isCircle ? "circle" : "square");
    ripple.style.background = AccentColor;
    wrapper.appendChild(ripple);
    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  }

  return (
    <span
      className={
        "checkbox-wrapper" +
        (isCircle ? " checkbox-circle" : " checkbox-square") +
        (hovered && !checked ? " glow" : "")
      }
      style={{ '--accentColor': AccentColor, '--bgFillColor': ButtonEmptyColor, '--borderColor': ButtonBorderColor } as React.CSSProperties}
      ref={wrapperRef}
    >
      <input
        type="checkbox"
        checked={checked}
        {...props}
        onClick={handleClick}
        className={isCircle ? "checkbox-custom checkbox-circle-input" : "checkbox-custom checkbox-square-input"}
        style={style}
        readOnly={props.readOnly}
      />
      {/* CIRCLE FILL */}
      {isCircle && checked && (
        <span className="circle-fill" style={{ background: AccentColor }} />
      )}
      {/* SQUARE CHECKMARK */}
      {!isCircle && checked && (
        <span className="square-checkmark" />
      )}
    </span>
  );
};
