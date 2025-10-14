import React from "react";
import * as Colors from './Colors';
import './Button.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode; // SVG/PNG/icon element
  accentColor?: string;
  accentColorLightMode?: string;
  accentColorDarkMode?: string;
  darkMode?: boolean;
  fontColor?: string;
  bgColor?: string;
  hoverColor?: string;
  borderColor?: string;
  borderRadius?: string | number;
  loading?: boolean;
  tooltip?: string;
  noOutline?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  accentColor,
  accentColorLightMode,
  accentColorDarkMode,
  darkMode = false,
  fontColor,
  bgColor,
  borderColor,
  hoverColor,
  borderRadius = 8,
  loading = false,
  tooltip,
  disabled,
  className, noOutline,
  style,
  ...props
}) => {

  const { MidnightGray, LightGray, SoftBlue, TrueBlue } = Colors;

  const AccentColor =
    accentColor ??
    (darkMode ? accentColorDarkMode ?? SoftBlue : accentColorLightMode ?? TrueBlue);
  const BorderColor = borderColor ?? (darkMode ? LightGray : MidnightGray);
  const FontColor = fontColor ?? (darkMode ? MidnightGray : LightGray);
  // const HoverColor = hoverColor ?? (darkMode ? HoverDarkMenu : HoverLightMenu)

  return (
    <button
      className={`prizm-ui prizm-ui-button${darkMode ? ' dark' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: icon && label ? 8 : 0,
        minWidth: label ? 44 : 36,
        height: 38,
        padding: label ? "0 18px" : 0,
        background: noOutline ? "none" : AccentColor,
        color: FontColor,
        border: noOutline ? "none" : `1.5px solid ${BorderColor ?? AccentColor + "55"}`,
        borderRadius: noOutline ? 0 : borderRadius,
        boxShadow: noOutline ? "none" : undefined,
        fontWeight: 600,
        fontSize: "1em",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        userSelect: "none",
        outline: "none",
        transition: "background 0.18s, border-color 0.18s, color 0.18s",
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 18, height: 18, border: `2px solid ${AccentColor}`,
            borderTop: "2px solid transparent", borderRadius: "50%",
            animation: "icon-spin 1s linear infinite",
          }}
        />
      ) : (
        icon && <span style={{ display: "flex", alignItems: "center", color: "currentColor" }}>{icon}</span>
      )}
      {label && <span style={{ color: "currentColor", fontWeight: 600 }}>{label}</span>}
      <style>
        {`
        @keyframes icon-spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </button>
  );
};
