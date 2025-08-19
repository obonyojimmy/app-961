import { DARK_THEME, LIGHT_THEME, useColorScheme } from "@/hooks/useColorScheme";
import { spaceMonofont } from "@/lib/assets";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  //duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: spaceMonofont,
  });

  useEffect(() => {
    // Pre-load fonts, or pre-fetch  API calls you need to do here
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style="auto" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="auth"
              options={{
                presentation: "fullScreenModal",
              }}
            />
          </Stack>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
