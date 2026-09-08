import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const googleLogo = Asset.fromModule(
  require("../../assets/images/google-g.svg"),
).uri;

export default function MainScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 ">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/bg-image.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top center"
      />
      <View className="absolute inset-0 bg-[#040a12]/20" />

      <SafeAreaView
        className="flex-1 justify-between px-6"
        edges={["top", "bottom"]}
      >
        <View className="mt-96 items-center">
          <Image
            source={require("../../assets/images/logo-mark.png")}
            style={{ height: 82, width: 82, tintColor: "#ffffff" }}
            contentFit="contain"
          />
          <Text className="mt-3.5 text-[39px] font-bold tracking-[-1.4px] text-white">
            FlickMart
          </Text>
          <Text className="mt-2 text-base font-medium text-white/85">
            Everything you need, in one place.
          </Text>
        </View>

        <View className=" pb-3.5">
          <View className="gap-4">
            <Pressable
              className="min-h-[60px] flex-row items-center justify-center gap-3 rounded-full bg-[#182a3b]"
              onPress={() => router.push("/(auth)/sign-up")}
            >
              <Ionicons name="mail-outline" size={23} color="#ffffff" />
              <Text className="text-lg font-semibold text-white">
                Continue with email
              </Text>
            </Pressable>

            <Pressable className="min-h-[60px] flex-row items-center justify-center gap-3 rounded-full bg-white">
              <SvgUri uri={googleLogo} width={22} height={22} />
              <Text className="text-lg font-semibold text-[#101114]">
                Continue with Google
              </Text>
            </Pressable>

            <Pressable className="min-h-[60px] flex-row items-center justify-center gap-3 rounded-full bg-white">
              <Ionicons name="logo-apple" size={24} color="#101114" />
              <Text className="text-lg font-semibold text-[#101114]">
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          <Text className="mx-3.5 mt-6 text-center text-xs leading-[18px] text-white/70">
            By continuing, you agree to our{" "}
            <Text className="font-semibold text-white">Terms of Service</Text>{" "}
            and <Text className="font-semibold text-white">Privacy Policy</Text>
            .
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
