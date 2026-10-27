import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/utils/constants";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const googleLogo = Asset.fromModule(
  require("../../../assets/images/google-g.svg"),
).uri;

export default function AuthIndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  const isGoogleLoading = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleLoading = loadingStrategy === OAUTH.APPLE_OAUTH;
  const isLoading = loadingStrategy !== null;

  return (
    <View className="flex-1 bg-[#f7f7f7]">
      <StatusBar style="dark" />
      <Image
        source={require("../../../assets/images/bg-image.png")}
        className="absolute inset-0"
        contentFit="cover"
        contentPosition="top center"
      />
      <View className="absolute inset-0 bg-white/70" />

      <SafeAreaView
        className="flex-1 justify-between px-6"
        edges={["top", "bottom"]}
      >
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../../../assets/images/logo-mark.png")}
            className="h-20 w-20"
            contentFit="contain"
          />
          <Text className="mt-4 text-[38px] font-bold tracking-[-1.4px] text-[#101114]">
            FlickMart
          </Text>
          <Text className="mt-2 text-center text-base text-[#747474]">
            Everything you need, in one place.
          </Text>
        </View>

        <View className="pb-3">
          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
              className="min-h-[58px] flex-row items-center justify-center gap-3 rounded-full bg-black"
              disabled={isLoading}
              onPress={() => handleSocialAuth("oauth_apple")}
            >
              {isAppleLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color="#ffffff" />
                  <Text className="text-base font-semibold text-white">
                    Continue with Apple
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              className="min-h-[58px] flex-row items-center justify-center gap-3 rounded-full border border-[#eeeeee] bg-white"
              disabled={isLoading}
              onPress={() => handleSocialAuth("oauth_google")}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#222222" />
              ) : (
                <>
                  <SvgUri uri={googleLogo} width={20} height={20} />
                  <Text className="text-base font-semibold text-[#101114]">
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <Text className="mt-6 text-center text-sm text-[#888888]">
            Sign in or sign up securely with your account
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
