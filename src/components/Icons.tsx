// src/ui/Icons.tsx
import XIconSvg from '../assets/icons/x.svg?react';

export const ClearIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  width = 20,
  height = 20,
  style,
  ...props
}) => (
  <XIconSvg
    width={width}
    height={height}
    style={{...style }}
    {...props}
  />
);