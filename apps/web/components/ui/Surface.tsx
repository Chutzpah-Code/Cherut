'use client';

import { Box, BoxProps } from '@mantine/core';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SurfaceProps extends BoxProps {
  children: React.ReactNode;
}

// The shared white page-level surface every module sits on top of the app's
// gray canvas (see globals.css / dashboard & admin layout.tsx). This is for
// page-level content wrappers, not a replacement for existing per-item Card
// usage (Life Areas, Values, Objectives, Vision Board, Admin already wrap
// each item in a Card — Surface wraps the section/page around those).
export function Surface({ children, style, ...rest }: SurfaceProps) {
  const colors = useThemeColors();

  return (
    <Box
      style={{
        background: colors.surfaceElevated,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
