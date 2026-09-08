import { Stack } from "expo-router";
import "../../../global.css";

export default function AuthLayout() {
  // const { isLoaded, isSignedIn } = useAuth();

  // if (!isLoaded) {
  //   return null;
  // }

  // if (!isSignedIn) {
  //   return <Redirect href="/" />;
  // }
  return <Stack screenOptions={{ headerShown: false }} />;
}
