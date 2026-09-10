import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const useSocialAuth = () => {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (loadingStrategy) return; //guard against concurrent flows
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        // Use three slashes so `oauth-callback` is interpreted as a path, not
        // as the host portion of a custom-scheme URL by Expo Router.
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "flickmartapp",
          path: "/oauth-callback",
          isTripleSlashed: true,
        }),
      });

      if (!createdSessionId || !setActive) {
        Alert.alert("Sign in or Sign up did not complete. Please try again.");
        return;
      }

      await setActive({
        session: createdSessionId,
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          router.replace("/(tabs)");
        },
      });
    } catch (error) {
      console.log("Error in social auth", error);
      Alert.alert("Error Failed to sign in. Please try again.");
    } finally {
      setLoadingStrategy(null);
    }
  };
  return { handleSocialAuth, loadingStrategy };
};

export default useSocialAuth;
