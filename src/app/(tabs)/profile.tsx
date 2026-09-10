import { useUserStore } from "@/store/userStore";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  destructive?: boolean;
  onPress?: () => void;
};

function MenuItem({
  icon,
  label,
  detail,
  destructive = false,
  onPress,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center px-4 py-2 active:bg-[#FAF8F4]"
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full">
        <Ionicons name={icon} size={20} color={destructive ? "#C4473D" : ""} />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className={`text-[15px] font-semibold ${destructive ? "text-[#C4473D]" : "text-[#1C2523]"}`}
        >
          {label}
        </Text>
        {detail && (
          <Text className="mt-0.5 text-sm text-[#65716D]">{detail}</Text>
        )}
      </View>
      {!destructive && (
        <Ionicons name="chevron-forward" size={19} color="#9BA5A1" />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-[#FAF8F4]" edges={["top"]}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between py-5">
          <Text className="text-2xl font-bold tracking-tight text-[#1C2523]">
            Profile
          </Text>
          <Pressable
            accessibilityLabel="Edit profile"
            className="h-11 w-11 items-center justify-center rounded-full border border-[#E7E4DE] bg-white"
          >
            <Ionicons name="notifications-outline" size={21} color="#163B35" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl p-4">
          {user?.imageUrl && !avatarFailed ? (
            <Image
              source={{ uri: user.imageUrl }}
              contentFit="cover"
              style={{ width: 64, height: 64, borderRadius: 32 }}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#163B35]">
              <Text className="text-2xl font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-4 flex-1">
            <Text
              className="text-lg font-bold text-[#1C2523]"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {email && (
              <Text className="mt-1 text-sm text-[#65716D]" numberOfLines={1}>
                {email}
              </Text>
            )}
            <View
              className={`mt-2 self-start rounded-full px-2.5 py-1 ${isSeller ? "bg-[#E6F0EC]" : "bg-[#F4F1EA]"}`}
            >
              <Text
                className={`text-xs font-bold ${isSeller ? "text-[#247A62]" : "text-[#65716D]"}`}
              >
                {isSeller ? "Seller account" : "Buyer account"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-3">
          <Pressable
            className="flex-row justify-center gap-2 items-center rounded-2xl bg-[#163B35] px-3 py-4"
            onPress={() => router.push("/(tabs)/create")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
            <Text className=" text-sm font-bold text-white">
              Post a listing
            </Text>
          </Pressable>
          <Pressable
            className="flex-row items-center rounded-2xl border border-[#E7E4DE] bg-white px-3 py-4 gap-2"
            onPress={() => router.push("/(tabs)/saved")}
          >
            <Ionicons name="bookmark-outline" size={22} color="#163B35" />
            <Text className=" text-sm font-bold text-[#1C2523]">
              Saved items
            </Text>
          </Pressable>
        </View>

        <Text className="mb-2 mt-7 text-sm font-bold uppercase tracking-wide text-[#65716D]">
          Selling
        </Text>
        <View className="overflow-hidden rounded-2xl border border-white bg-white">
          <MenuItem
            icon="grid-outline"
            label="My listings"
            onPress={() => router.push("/(tabs)/create")}
          />
          <View className="ml-[68px] h-px bg-[#E7E4DE]" />
          <MenuItem icon="shield-checkmark-outline" label="Safety centre" />
        </View>

        <Text className="mb-2 mt-7 text-sm font-bold uppercase tracking-wide text-[#65716D]">
          Account
        </Text>
        <View className="overflow-hidden rounded-2xl border border-white bg-white">
          <MenuItem icon="person-outline" label="Personal details" />
          <View className="ml-[68px] h-px bg-[#E7E4DE]" />
          <MenuItem icon="notifications-outline" label="Notifications" />
          <View className="ml-[68px] h-px bg-[#E7E4DE]" />
          <MenuItem icon="help-circle-outline" label="Help and support" />
        </View>

        <View className="mt-7 overflow-hidden rounded-2xl border border-[#F2D0CD] bg-white">
          <MenuItem
            icon="log-out-outline"
            label="Sign out"
            destructive
            onPress={handleSignOut}
          />
        </View>
        <Text className="mt-5 text-center text-xs text-[#8B9591]">
          FlickMart · Enugu, Nigeria
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
