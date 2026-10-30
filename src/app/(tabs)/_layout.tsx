import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme, useUnstableNativeVariable } from "nativewind";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function toHexColor(channels: unknown, fallback: string) {
  if (typeof channels !== "string") return fallback;
  const values = channels.trim().split(/\s+/).map(Number);
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) {
    return fallback;
  }
  return `#${values
    .map((value) =>
      Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"),
    )
    .join("")}`;
}

function useThemeColor(
  variable: string,
  lightFallback: string,
  darkFallback: string,
) {
  const { colorScheme } = useColorScheme();
  return toHexColor(
    useUnstableNativeVariable(variable),
    colorScheme === "dark" ? darkFallback : lightFallback,
  );
}

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeTintColor = isDark ? "#8BC5B3" : "#18324A";
  const inactiveTintColor = isDark ? "#858F8A" : "#94A3B8";
  const tabBarBackgroundColor = useThemeColor(
    "--color-background",
    "#F7F7F8",
    "#080809",
  );
  const tabBarBorderColor = useThemeColor(
    "--color-border",
    "#E9E9EC",
    "#2B2B2F",
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: tabBarBorderColor,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          backgroundColor: tabBarBackgroundColor,
          height: 64 + bottom,
          paddingTop: 7,
          paddingBottom: Math.max(bottom, 10),
        },
        tabBarItemStyle: { paddingVertical: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarShowLabel: false,
          tabBarLabel: () => null,

          tabBarIcon: () => (
            <View
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isDark ? "bg-[#8BC5B3]" : "bg-[#0d0d0d]"
              }`}
              style={{
                // marginTop: -6,
                shadowColor: isDark ? "#8BC5B3" : "#0d0d0d",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons
                name="add"
                size={26}
                color={isDark ? "#10241E" : "#FFFFFF"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
