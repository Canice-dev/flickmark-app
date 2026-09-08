import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/utils/constants";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import  {  } from "react-native-svg";
import Svg, { Circle, Line, Path, SvgUri } from "react-native-svg";

const googleLogo = Asset.fromModule(
  require("../../../assets/images/google-g.svg"),
).uri;

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#999"
      strokeWidth="2"
    >
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  ) : (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#999"
      strokeWidth="2"
    >
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <Line x1="1" y1="1" x2="23" y2="23" />
    </Svg>
  );

const GoogleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#111">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04l-.08.27zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </Svg>
);

export default function SignUp() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;
  // const isLoading = isGoogleClicked || isAppleClicked

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName,
    });
    if (error) {
      // Handle the error in your app.
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(error, null, 2));

      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      // Handle the error in your app.
      return;
    }

    setIsVerifying(true);
  };

  const handleVerify = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      // Handle the error in your app.
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      // Handle the error in your app.
    }
  };

  const isLoading = fetchStatus === "fetching";

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (isVerifying) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <TextInput
          className=" border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm bg-gray-50 mb-5"
          value={code}
          placeholder="Enter your verification code"
          onChangeText={setCode}
          keyboardType="numeric"
        />
        <Button title="Verify" onPress={handleVerify} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.push("/")}
            className="w-14 h-14 items-center justify-center bg-white rounded-full border border-gray-100"
            // style={{ elevation: 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0d0d0d" />
          </Pressable>

          <View className="items-center justify-center">
            <Text className="text-3xl font-bold text-gray-900 mb-1 ">
              Create an account
            </Text>
            <Text className="text-gray-400 text-base mb-8 ">
              Join thousands of students and start learning today!
            </Text>
          </View>
          <View className=" pt-2 pb-10">
            <View className="mt-5">
              <Text className="text-gray-700 text-base font-medium mb-1.5">
                Name
              </Text>
              <TextInput
                className="flex-1 border border-gray-200 rounded-xl px-3 py-4 text-base text-gray-900 mb-5"
                placeholder="Name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              {errors.fields.firstName && (
                <Text className="text-red-500 mb-4">
                  {errors.fields.firstName.message}
                </Text>
              )}

              <Text className="text-gray-700 text-base font-medium mb-1.5">
                Email
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-3 py-4 text-base text-gray-900 mb-5"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.fields.emailAddress && (
                <Text className="text-red-500 mb-4">
                  {errors.fields.emailAddress.message}
                </Text>
              )}

              <Text className="text-gray-700 text-base font-medium mb-1.5">
                Password
              </Text>
              <View className="border border-gray-200 rounded-xl px-3 py-1 bg-gray-50 flex-row items-center mb-1.5">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 py-3.5 text-gray-900 text-base"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="pl-2"
                >
                  <EyeIcon open={showPassword} />
                </Pressable>
              </View>
              <Text className="text-gray-400 text-sm mb-7 ">
                At least 8 characters
              </Text>
            </View>

            <Pressable
              onPress={handleSignUp}
              disabled={isLoading}

              className="min-h-[60px] flex-row items-center justify-center rounded-full bg-[#182a3b] mb-6"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-semibold text-white">
                  Create account
                </Text>
              )}
            </Pressable>

            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-400 text-xs px-3">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <View className="gap-4">
              <Pressable
                className={`min-h-[60px] flex-row items-center justify-center gap-3 rounded-full border border-gray-200 bg-white ${loading ? "opacity-70" : ""}`}
                disabled={loading}
                onPress={() => handleSocialAuth("oauth_google")}
              >
                <SvgUri uri={googleLogo} width={22} height={22} />
                <Text className="text-lg font-semibold text-[#101114]">
                  {isGoogleClicked
                    ? "Connecting Google..."
                    : "Continue with Google"}
                </Text>
              </Pressable>

              <Pressable
                className={`min-h-[60px] flex-row items-center justify-center gap-3 rounded-full border border-gray-200 bg-white ${loading ? "opacity-70" : ""}`}
                disabled={loading}

                onPress={() => handleSocialAuth("oauth_apple")}
              >
                <Ionicons name="logo-apple" size={24} color="#101114" />
                <Text className="text-lg font-semibold text-[#101114]">
                  {isAppleClicked
                    ? "Connecting Apple..."
                    : "Continue with Apple"}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row justify-center items-center mt-7">
              <Text className="mx-3.5 mt-6 text-center text-sm leading-[18px]">
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push("/(auth)/sign-in")}>
                <Text className="mt-6 text-center text-sm leading-[18px] font-bold">
                  Sign in
                </Text>
              </Pressable>
            </View>

            <Text className="mx-3.5 mt-6 text-center text-sm leading-[18px]">
              By continuing, you agree to our{" "}
              <Text className="font-semibold ">Terms of Service</Text> and{" "}
              <Text className="font-semibold ">Privacy Policy</Text>.
            </Text>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
