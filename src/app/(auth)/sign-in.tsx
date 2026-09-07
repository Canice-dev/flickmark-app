import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();
  return (
    <SafeAreaView>
      <View>
        <Text>SignIn</Text>
        <Text>
          I dont have an account
          <Pressable onPress={() => router.push("/sign-up")}>
            <Text>Sign Up</Text>
          </Pressable>
        </Text>
      </View>
    </SafeAreaView>
  );
}
