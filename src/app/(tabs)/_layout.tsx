import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#18324A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          backgroundColor: "#fff",
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
              className="w-11 h-11 bg-[#0d0d0d] rounded-full items-center justify-center"
              style={{
                // marginTop: -6,
                shadowColor: "#0d0d0d",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="add" size={26} color="#fff" />
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
