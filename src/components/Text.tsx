import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export type TextProps = RNTextProps & VariantProps<typeof textVariants>;

// SEE: https://callstack.github.io/react-native-paper/docs/components/Text/ for more variants
const textVariants = cva("text-slate-600 dark:text-slate-50", {
  variants: {
    variant: {
      default: "text-base font-normal",
      defaultSemiBold: "text-base leading-6 font-semibold",
      titleLarge: "text-xl font-medium leading-8",
      title: "text-xl font-bold leading-6",
      subtitle: "text-lg font-semibold",
      label: "text-lg font-medium",
      link: "text-base text-blue-600 dark:text-blue-400",
    },
    color: {
      default: "text-slate-600 dark:text-slate-50",
      primary: "text-cyan-500",
      secondary: "text-slate-500",
      success: "text-emerald-500",
      error: "text-red-500",
      warning: "text-orange-500",
      muted: "text-slate-500",
      transparent: "",
      //outline: "",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base ",
      lg: "text-lg",
    },
    fontWeight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    fontWeight: "normal",
  },
});

export default function Text({
  variant,
  color = "default",
  fontWeight = "normal",
  size,
  style,
  className,
  ...rest
}: TextProps) {
  return (
    <RNText
      className={cn(textVariants({ variant, size, color, fontWeight }), className)}
      style={style}
      {...rest}
    />
  );
}
