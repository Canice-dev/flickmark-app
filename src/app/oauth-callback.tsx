import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Native OAuth returns through flickmartapp://oauth-callback. Clerk completes
 * the browser session, then the social-auth hook activates it and navigates to
 * the tabs. Keeping this route prevents Expo Router's unmatched-route screen.
 */
export default function OAuthCallback() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#182a3b" />
    </View>
  );
}
