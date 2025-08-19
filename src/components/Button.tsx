import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";
import { StyleProp, Text, TouchableOpacity, ViewStyle } from "react-native";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-1  border shadow-sm shadow-transparent ",
  {
    variants: {
      size: {
        xs: "py-0.5 px-1 gap-0.5",
        sm: "p-1 gap-1",
        md: "p-1.5 gap-1",
        lg: "p-2.5 gap-1.5",
        xl: "p-3 gap-2.5",
      },
      color: {
        primary: "bg-blue-100 border-blue-200 ",
        success: "bg-emerald-100 border-emerald-200 ",
        secondary: "bg-gray-200 border-gray-200 ",
        error: "bg-rose-100 border-rose-200 ",
        warning: "bg-orange-100 border-orange-200 ",
        outline: "bg-inherit border-0 border-none shadow-none",
        default: "bg-slate-50/50 border-slate-300 shadow-slate-50/30",
        inherit: "bg-inherit  shadow-none",
      },
      tile: {
        true: "flex-col",
      },
      variant: {
        default: "",
        link: "border-0  shadow-none bg-inherit",
      },
      full_width: {
        true: "flex-1",
      },
      rounded: {
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
      },
      gap: {
        default: "",
        sm: "gap-0.5",
        md: "gap-1",
        lg: "gap-1.5",
        xl: "gap-2.5",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
      tile: false,
      variant: "default",
      full_width: false,
      rounded: "lg",
      gap: "default",
    },
  },
);

const buttonTextVariants = cva("font-medium capitalize", {
  variants: {
    color: {
      primary: "text-blue-500",
      secondary: "text-slate-500",
      success: "text-emerald-500",
      error: "text-slate-500",
      warning: "text-slate-500",
      outline: "text-slate-500",
      default: "text-slate-500",
      inherit: "text-slate-500",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base ",
      lg: "text-lg",
      xl: "text-xl",
    },

    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    color: "default",
    size: "md",
    weight: "semibold",
  },
});

type ButtonProps = {
  label?: string | number;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  labelComponent?: ReactNode;
  onPress?: () => void;
  weight?: "normal" | "medium" | "semibold" | "bold" | null;
  //size?: "sm" | "md" | "lg";
  //color?: "primary" | "secondary" | "outline" | "default";
  style?: StyleProp<ViewStyle>;
  className?: string;
  labelClassName?: string;
} & VariantProps<typeof buttonVariants>;

export default function Button({
  label,
  labelComponent,
  iconLeft,
  iconRight,
  onPress = () => {},
  tile = false,
  variant = "default",
  full_width = false,
  size = "md",
  color = "default",
  rounded = "lg",
  weight = "semibold",
  gap = "default",
  style,
  className,
  labelClassName,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={style}
      className={cn(
        buttonVariants({ size, color, tile, rounded, variant, full_width, gap }),
        className,
      )}>
      {iconLeft && iconLeft}
      {labelComponent && labelComponent}
      {label && (
        <Text className={cn(buttonTextVariants({ size, color, weight }), labelClassName)}>
          {label}
        </Text>
      )}
      {iconRight && iconRight}
    </TouchableOpacity>
  );
}
