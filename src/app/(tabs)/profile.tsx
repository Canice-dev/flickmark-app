import { useUserStore } from "@/store/userStore";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress?: () => void;
};

function MenuItem({
  icon,
  label,
  destructive = false,
  onPress,
}: MenuItemProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = destructive ? "#D95757" : isDark ? "#A7B1AD" : "#68736F";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center px-4 py-3.5 active:bg-[#F7F8F8] dark:active:bg-[#272A29]"
      onPress={onPress}
    >
      <View className="h-7 w-7 items-center justify-center">
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text
        className={`ml-2.5 flex-1 text-[14px] font-medium ${
          destructive ? "text-[#D95757]" : "text-foreground"
        }`}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={17}
        color={destructive ? "#E59B9B" : isDark ? "#7F8B86" : "#9AA39F"}
      />
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text className="mb-2 px-1 text-xs font-semibold text-muted">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-surface">{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isSeller = useUserStore((state) => state.isSeller);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayName = user?.fullName || user?.firstName || "FlickMart member";
  const email = user?.primaryEmailAddress?.emailAddress;

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in whenever you need to.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Couldn't sign out", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="pb-5 pt-4 text-[20px] font-bold tracking-tight text-primary">
          Profile
        </Text>

        <View className="flex-row items-center px-1 py-1">
          {user?.imageUrl && !avatarFailed ? (
            <Image
              source={{ uri: user.imageUrl }}
              contentFit="cover"
              style={{ width: 58, height: 58, borderRadius: 29 }}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#183C35]">
              <Text className="text-xl font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text
              className="text-[16px] font-bold text-foreground"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {email && (
              <Text className="mt-0.5 text-[12px] text-muted" numberOfLines={1}>
                {email}
              </Text>
            )}
            <Text className="mt-1.5 text-[12px] font-medium text-[#4E746A] dark:text-[#83B5A7]">
              {isSeller ? "Seller account" : "Buyer account"}
            </Text>
          </View>
        </View>

        <Section title="Marketplace">
          <MenuItem
            icon="add-circle-outline"
            label="Post a listing"
            onPress={() => router.push("/(tabs)/create")}
          />
          <MenuItem
            icon="grid-outline"
            label="My listings"
            onPress={() => router.push("/(tabs)/create")}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Saved items"
            onPress={() => router.push("/(tabs)/saved")}
          />
        </Section>

        <Section title="Account">
          <MenuItem icon="person-outline" label="Personal details" />
          <MenuItem icon="notifications-outline" label="Notifications" />
          <MenuItem icon="shield-checkmark-outline" label="Safety centre" />
        </Section>

        <Section title="Support">
          <MenuItem icon="settings-outline" label="Settings" />
          <MenuItem icon="help-circle-outline" label="Help & support" />
          <MenuItem
            icon="log-out-outline"
            label="Sign out"
            destructive
            onPress={handleSignOut}
          />
        </Section>

        <Text className="mt-6 text-center text-xs text-muted">
          FlickMart · Enugu, Nigeria
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
