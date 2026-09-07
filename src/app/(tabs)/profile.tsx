import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

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
    <View>
      <Text>ProfileScreen</Text>
      <Pressable onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
}
