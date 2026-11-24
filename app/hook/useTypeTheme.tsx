"use client";

import { CSSProperties, useMemo } from "react";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";

interface UseTypeThemeOptions {
  primaryType?: string;
  secondaryType?: string;
  gradientOpacity?: string; // ex: "26" ou "33" em hex
}

export function useTypeTheme({
  primaryType = "normal",
  secondaryType,
  gradientOpacity = "33",
}: UseTypeThemeOptions = {}) {
  return useMemo(() => {
    const normalizedPrimary = primaryType.toLowerCase();
    const normalizedSecondary = secondaryType?.toLowerCase();

    const primary = TYPE_STYLES[normalizedPrimary] ?? DEFAULT_STYLE;
    const secondary = normalizedSecondary
      ? (TYPE_STYLES[normalizedSecondary] ?? DEFAULT_STYLE)
      : undefined;

    const backgroundImage = secondary
      ? `linear-gradient(135deg, ${primary.gradientHex}${gradientOpacity}, ${secondary.gradientHex}${gradientOpacity})`
      : `linear-gradient(135deg, ${primary.gradientHex}${gradientOpacity}, transparent)`;

    const pageBackgroundImage = secondary
      ? `linear-gradient(160deg, ${primary.gradientHex}26 0%, #09090b 45%, ${secondary.gradientHex}26 100%)`
      : `linear-gradient(160deg, ${primary.gradientHex}26 0%, #09090b 75%)`;

    const boxShadow = secondary
      ? `0 12px 32px rgba(0, 0, 0, 0.65), 0 0 24px ${primary.gradientHex}26`
      : `0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px ${primary.gradientHex}33`;

    const surfaceStyle: CSSProperties = {
      backgroundImage,
      boxShadow,
      ...(secondary ? { borderColor: secondary.gradientHex } : {}),
    };

    const pageStyle: CSSProperties = {
      backgroundImage: pageBackgroundImage,
    };

    return {
      primaryType: normalizedPrimary,
      secondaryType: normalizedSecondary,
      primary,
      secondary,
      cardClassName: primary.cardBg,
      surfaceStyle,
      pageStyle,
    };
  }, [primaryType, secondaryType, gradientOpacity]);
}