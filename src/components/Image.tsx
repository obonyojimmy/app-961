import { Image as ExpoImage, ImageProps } from "expo-image";
import { cssInterop } from "nativewind";

// See: - https://www.nativewind.dev/blog/announcement-nativewind-v4#removal-of-styled
//      - https://www.nativewind.dev/overview/#how-is-this-different-stylesheetcreate

const Image = cssInterop(ExpoImage, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
    },
  },
});

export default Image as React.FC<ImageProps>;
