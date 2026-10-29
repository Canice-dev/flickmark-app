import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/utils/constants";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const googleLogo = Asset.fromModule(
  require("../../../assets/images/google-g.svg"),
).uri;

export default function AuthIndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const isDark = colorScheme === "dark";

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  const isGoogleLoading = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleLoading = loadingStrategy === OAUTH.APPLE_OAUTH;
  const isLoading = loadingStrategy !== null;

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111111]" : "bg-[#f7f8fb]"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-[1.2] items-center justify-center overflow-hidden">
          <Image
            source={
              isDark
                ? require("../../../assets/images/phone-mockup-dark.png")
                : require("../../../assets/images/phone-mockup-light.png")
            }
            className="w-full"
            style={{ height: Math.min(height * 0.59, 560) }}
            resizeMode="cover"
            accessibilityLabel={`FlickMart marketplace preview in ${isDark ? "dark" : "light"} mode`}
          />
        </View>

        <View className="px-6 pb-3 pt-1">
          <View className="mb-7 items-center">
            <Text
              className={`text-center text-[32px] font-semibold leading-[38px] tracking-[-1.1px] ${
                isDark ? "text-white" : "text-[#101114]"
              }`}
            >
              Find Your Next Favorite
            </Text>
            <Text
              className={`mt-3 max-w-[330px] text-center text-[15px] leading-[23px] ${
                isDark ? "text-[#c1c1c7]" : "text-[#6f727a]"
              }`}
            >
              Discover great finds from sellers near you and make every day a
              little more yours.
            </Text>
          </View>

          <View className="gap-3.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              className={`min-h-[53px] flex-row items-center justify-center gap-3 rounded-full ${
                isDark ? "bg-white" : "bg-[#121212]"
              }`}
              disabled={isLoading}
              onPress={() => handleSocialAuth("oauth_apple")}
            >
              {isAppleLoading ? (
                <ActivityIndicator color={isDark ? "#101114" : "white"} />
              ) : (
                <>
                  <Ionicons
                    name="logo-apple"
                    size={21}
                    color={isDark ? "#101114" : "#ffffff"}
                  />
                  <Text
                    className={`text-base font-semibold ${isDark ? "text-[#121212]" : "text-white"}`}
                  >
                    Continue with Apple
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className={`min-h-[53px] flex-row items-center justify-center gap-3 rounded-full border ${
                isDark
                  ? "border-[#ffffff26] bg-transparent"
                  : "border-[#d9dbe2] bg-transparent"
              }`}
              disabled={isLoading}
              onPress={() => handleSocialAuth("oauth_google")}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={isDark ? "white" : "#222222"} />
              ) : (
                <>
                  <SvgUri uri={googleLogo} width={20} height={20} />
                  <Text
                    className={`text-base font-semibold ${
                      isDark ? "text-white" : "text-[#101114]"
                    }`}
                  >
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <Text
            className={`mt-4 text-center text-xs leading-5 ${
              isDark ? "text-[#85858d]" : "text-[#888d98]"
            }`}
          >
            By continuing, you agree to our{" "}
            <Text className="font-bold">Terms of Service</Text> and{" "}
            <Text className="font-bold">Privacy Policy.</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
