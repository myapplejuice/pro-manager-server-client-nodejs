import { useState, useMemo } from "react";
import { usePathname, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "./components/layout-comps/top-bar"
import NavigationBar from "./components/layout-comps/navigation-bar"
import PopupsProvider from "./utils/providers/popups-provider";
import { BackHandlerProvider } from './utils/contexts/back-handler-context';
import { UserContext } from "./utils/contexts/user-context";
import { CameraContext } from "./utils/contexts/camera-context";
import Popups from "./utils/popups";
import { StatusBar } from 'expo-status-bar';
import usePopupsHandlers from './utils/hooks/use-popups-handlers'

export default function RootLayout() {
  return (
    <BackHandlerProvider>
      <Layout />
    </BackHandlerProvider>
  );
}

function Layout() {
  const [user, setUser] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const screen = usePathname();
  const { popupStates, popupActions } = usePopupsHandlers();
  const popups = useMemo(() => popupActions, [popupActions]);

  const hideBottomBar = [
    "/",
    "/screens/authentication/login",
    "/screens/authentication/register",
    "/screens/authentication/recovery",
    "/screens/authentication/introduction",
    "/screens/profile/privacy",
    "/screens/profile/contact",
    "/screens/profile/settings",
    "/screens/profile/personal-details",
  ];

  const hideTopBar = [
    "/",
    "/screens/authentication/login",
    "/screens/authentication/register",
    "/screens/authentication/recovery",
    "/screens/authentication/introduction",
  ];

  const topEdges =
    !cameraActive &&
    (
      screen === "/screens/authentication/login" ||
      screen === "/screens/authentication/register" ||
      screen === "/screens/authentication/recovery" ||
      screen === "/screens/main/homepage" ||
      screen === "/screens/main/coaches" ||
      screen === "/screens/main/applications" ||
      screen === "/screens/main/profile"
    );

  const backgroundColor = {
    "/screens/authentication/login": "rgb(10, 10, 10)",
    "/screens/authentication/register": "rgb(10, 10, 10)",
    "/screens/authentication/recovery": "rgb(10, 10, 10)",
    "/screens/main/homepage": "rgb(23, 24, 31)",
    "/screens/main/profile": "rgb(23, 24, 31)",
    "/screens/main/coaches": "rgb(23, 24, 31)",
    "/screens/main/applications": "rgb(23, 24, 31)",
  };

  const topBar = !hideTopBar.includes(screen) && !cameraActive;
  const bottomBar = !hideBottomBar.includes(screen) && !cameraActive;
  const edges = [topEdges ? ['top'] : []];

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <CameraContext.Provider value={{ cameraActive, setCameraActive }}>
        <PopupsProvider popups={popups}>
          <StatusBar hidden={cameraActive} />
          <Popups {...popupStates} />
          <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: backgroundColor[screen] }}>
            {topBar && <TopBar />}
            <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="screens/authentication/login" />
              <Stack.Screen name="screens/authentication/register" />
              <Stack.Screen name="screens/authentication/recovery" />
              <Stack.Screen name="screens/main/homepage" />
              <Stack.Screen name="screens/main/coaches" />
              <Stack.Screen name="screens/main/profile" />
              <Stack.Screen name="screens/main/applications" />
              <Stack.Screen name="screens/profile/privacy" />
              <Stack.Screen name="screens/profile/contact" />
              <Stack.Screen name="screens/profile/settings" />
              <Stack.Screen name="screens/profile/personal-details" />
            </Stack>
            {bottomBar && <NavigationBar />}
          </SafeAreaView>
        </PopupsProvider>
      </CameraContext.Provider>
    </UserContext.Provider>
  );
}
