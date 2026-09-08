import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <SafeAreaView className="px-6">
      <View>
        <Text>ProfileScreen</Text>
        <Pressable onPress={handleSignOut}>
          <Text>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
