import Image from "next/image";
import type { AppIconSpec } from "@src/apps/meta";

interface AppIconProps {
  icon: AppIconSpec;
  label: string;
  /** Rendered size in px. */
  size?: number;
  className?: string;
}

/**
 * Renders an app icon. Brand apps use their SVG logo; portfolio apps use a
 * squircle tile with a Phosphor glyph so every icon shares one silhouette.
 */
export const AppIcon = ({ icon, label, size = 48, className = "" }: AppIconProps) => {
  if (icon.kind === "image") {
    return (
      <Image
        src={icon.src}
        alt={label}
        width={size}
        height={size}
        draggable={false}
        className={`pointer-events-none select-none object-contain drop-shadow-[0_4px_8px_rgb(17_17_27/0.45)] ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const { Icon, tile, glyph } = icon;
  return (
    <span
      role="img"
      aria-label={label}
      className={`relative grid shrink-0 select-none place-items-center rounded-[28%] bg-linear-to-br ${tile} shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_4px_10px_rgb(17_17_27/0.45)] ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon className={glyph} style={{ width: "56%", height: "56%" }} aria-hidden />
    </span>
  );
};
