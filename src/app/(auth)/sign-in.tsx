import useSocialAuth from "@/hooks/useSocialAuth";
import { OAUTH } from "@/utils/constants";
import { useAuth, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function SignIn() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;

  const handleSignIn = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      // Handle the error in your app.
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // console.error(JSON.stringify(error, null, 2));
      console.error(error);

      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/(tabs)");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const onVerifyPress = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const isLoading = fetchStatus === "fetching";

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (signIn.status === "needs_client_trust") {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Verify your account
        </Text>

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Enter verification code"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
        {errors.fields.code && (
          <Text className="text-red-500 mb-4">
            {errors.fields.code.message}
          </Text>
        )}

        <Pressable
          onPress={onVerifyPress}
          disabled={isLoading}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Verify</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => signIn.mfa.sendEmailCode()}
          className="py-2 mb-2"
        >
          <Text className="text-blue-600">I need a new code</Text>
        </Pressable>

        <Pressable onPress={() => signIn.reset()} className="py-2">
          <Text className="text-blue-600">Start over</Text>
        </Pressable>
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
              Welcome back
            </Text>
            <Text className="text-gray-400 text-base mb-8 ">
              Join thousands of students and start learning today!
            </Text>
          </View>

          <Text className="text-[13px] font-semibold text-[#333] mb-1.5">
            Email
          </Text>
          <TextInput
            className="w-full px-4 py-3.5 border border-[#e8e8e8] rounded-xl text-[15px] text-[#111] mb-5"
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />

          {errors.fields.identifier && (
            <Text className="text-red-500 mb-4">
              {errors.fields.identifier.message}
            </Text>
          )}

          {/* Password */}
          <View className="flex-row justify-between items-center mb-1.5">
            <Text className="text-[13px] font-semibold text-[#333]">
              Password
            </Text>
            <Pressable>
              <Text className="text-[13px] text-blue-600">
                Forgot password?
              </Text>
            </Pressable>
          </View>
          <View className="relative mb-8">
            <TextInput
              className="w-full pl-4 pr-12 py-3.5 border border-[#e8e8e8] rounded-xl text-[15px] text-[#111]"
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable
              className="absolute right-4 top-3.5"
              onPress={() => setShowPassword((v) => !v)}
            >
              <EyeIcon open={showPassword} />
            </Pressable>

            {errors.fields.password && (
              <Text className="text-red-500 mb-4">
                {errors.fields.password.message}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}

            className="min-h-[60px] flex-row items-center justify-center rounded-full bg-[#182a3b] mb-6"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-lg font-semibold text-white">Sign In</Text>
            )}
          </Pressable>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 text-xs px-3">or continue with</Text>
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
                {isAppleClicked ? "Connecting Apple..." : "Continue with Apple"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row justify-center items-center mt-7">
            <Text className="mx-3.5 mt-6 text-center text-sm leading-[18px]">
              I dont't have an account?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up")}>
              <Text className="mt-6 text-center text-sm leading-[18px] font-bold">
                Sign Up
              </Text>
            </Pressable>
          </View>

          <Text className="mx-3.5 mt-6 text-center text-sm leading-[18px]">
            By continuing, you agree to our{" "}
            <Text className="font-semibold ">Terms of Service</Text> and{" "}
            <Text className="font-semibold ">Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
