import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useUserStore } from "@/store/userStore";

const categories = [
  { label: "Housing", icon: "home-outline" },
  { label: "Electronics", icon: "phone-portrait-outline" },
  { label: "Fashion", icon: "shirt-outline" },
  { label: "Other", icon: "grid-outline" },
] as const;

type ListingForm = {
  title: string;
  category: (typeof categories)[number]["label"];
  description: string;
  address: string;
  city: string;
  price: string;
  contactPhone: string;
  contactWhatsapp: string;
  latitude: string;
  longitude: string;
  isFeatured: boolean;
};

type UploadSignature = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  tags: string;
};

const initialForm: ListingForm = {
  title: "",
  category: "Housing",
  description: "",
  address: "",
  city: "",
  price: "",
  contactPhone: "",
  contactWhatsapp: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
};

async function responseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export default function CreateScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const isSeller = useUserStore((state) => state.isSeller);
  const isSynced = useUserStore((state) => state.isSynced);
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  if (!isLoaded || (isSignedIn && !isSynced)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#182a3b" />
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  if (!isSeller) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EAF4F1]">
            <Ionicons name="storefront-outline" size={30} color="#15705B" />
          </View>
          <Text className="mt-5 text-center text-xl font-bold text-[#101114]">
            Only sellers can create listings
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-slate-600">
            Switch to a seller account to access the create-listing function.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const updateForm = <Key extends keyof ListingForm>(
    field: Key,
    value: ListingForm[Key],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const pickPhotos = async () => {
    const remainingSlots = 6 - photos.length;
    if (remainingSlots === 0) {
      Alert.alert("Photo limit reached", "A listing can have up to six photos.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo access to add listing images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((current) => [
        ...current,
        ...result.assets.slice(0, 6 - current.length),
      ]);
    }
  };

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location access needed",
          "Allow location access to automatically fill the coordinates.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      updateForm("latitude", currentLocation.coords.latitude.toFixed(7));
      updateForm("longitude", currentLocation.coords.longitude.toFixed(7));
    } catch {
      Alert.alert("Location unavailable", "Try again or enter the coordinates manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const uploadPhoto = async (
    photo: ImagePicker.ImagePickerAsset,
    signature: UploadSignature,
  ) => {
    const uploadBody = new FormData();
    uploadBody.append("file", new File(photo.uri));
    uploadBody.append("api_key", signature.apiKey);
    uploadBody.append("timestamp", String(signature.timestamp));
    uploadBody.append("signature", signature.signature);
    uploadBody.append("folder", signature.folder);
    uploadBody.append("tags", signature.tags);

    const response = await fetch(signature.uploadUrl, {
      method: "POST",
      body: uploadBody,
    });
    if (!response.ok) {
      throw new Error(await responseError(response, "Unable to upload a photo"));
    }

    const body = (await response.json()) as { secure_url?: string };
    if (!body.secure_url) {
      throw new Error("Cloudinary did not return an image URL");
    }

    return body.secure_url;
  };

  const postListing = async () => {
    if (photos.length === 0) {
      Alert.alert("Add a photo", "A listing needs at least one photo.");
      return;
    }

    setIsPosting(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const signatureResponse = await fetch("/api/uploads/signature", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!signatureResponse.ok) {
        throw new Error(
          await responseError(signatureResponse, "Unable to prepare photo uploads"),
        );
      }

      const signature = (await signatureResponse.json()) as UploadSignature;
      const imageUrls = await Promise.all(
        photos.map((photo) => uploadPhoto(photo, signature)),
      );

      const listingResponse = await fetch("/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, imageUrls }),
      });
      if (!listingResponse.ok) {
        throw new Error(
          await responseError(listingResponse, "Unable to post your listing"),
        );
      }

      setForm(initialForm);
      setPhotos([]);
      Alert.alert("Listing posted", "Your listing is now live.", [
        { text: "Go to home", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert(
        "Unable to post listing",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <Text className="text-[25px] font-bold tracking-[-0.6px] text-[#101114]">
            Create a listing
          </Text>
          <Pressable
            accessibilityLabel="Close create listing"
            onPress={() => router.replace("/")}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm shadow-black/10"
          >
            <Ionicons name="close" size={22} color="#334155" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="px-5 pb-32 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-[#101114]">Photos</Text>
            <Text className="px-3 py-1.5 text-base font-semibold text-[#101114]">
              {photos.length} / 6
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-3 pr-5">
              <Pressable
                accessibilityLabel="Add listing photos"
                disabled={photos.length === 6}
                onPress={() => void pickPhotos()}
                className={`h-28 w-28 items-center justify-center rounded-3xl border-2 border-dashed border-gray-400 bg-gray-100 ${photos.length === 6 ? "opacity-40" : ""}`}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="camera-outline" size={21} color="#15705B" />
                </View>
                <Text className="mt-2 text-xs font-semibold text-[#101114]">
                  Add photo
                </Text>
              </Pressable>
              {photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} className="h-28 w-28 overflow-hidden rounded-3xl bg-[#F1F3F5]">
                  <Image source={{ uri: photo.uri }} className="h-full w-full" />
                  <Pressable
                    accessibilityLabel={`Remove photo ${index + 1}`}
                    onPress={() =>
                      setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
                    }
                    className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/70"
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>

          <FormTextInput label="Title" value={form.title} onChangeText={(value) => updateForm("title", value)} placeholder="Give your listing a clear title" />

          <View className="mt-6">
            <Text className="text-base font-bold text-[#101114]">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              <View className="flex-row gap-3 pr-5">
                {categories.map((category) => {
                  const selected = form.category === category.label;
                  return (
                    <Pressable
                      key={category.label}
                      onPress={() => updateForm("category", category.label)}
                      className={`min-w-[104px] items-center rounded-2xl border px-3 py-3.5 ${selected ? "border-[#15705B] bg-[#EAF4F1]" : "border-gray-200 bg-white"}`}
                    >
                      <Ionicons name={category.icon} size={21} color={selected ? "#15705B" : "#64748B"} />
                      <Text className={`mt-1.5 text-xs font-semibold ${selected ? "text-[#15705B]" : "text-slate-600"}`}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <FormTextInput label="Description" value={form.description} onChangeText={(value) => updateForm("description", value)} placeholder="Describe your property or item..." multiline />
          <FormTextInput label="Address" value={form.address} onChangeText={(value) => updateForm("address", value)} placeholder="e.g. Hilltop junction" />
          <FormTextInput label="City" value={form.city} onChangeText={(value) => updateForm("city", value)} placeholder="e.g. Nsukka" />
          <FormTextInput label="Price" value={form.price} onChangeText={(value) => updateForm("price", value)} placeholder="e.g. 120000" keyboardType="decimal-pad" />
          <FormTextInput label="Mobile Number" value={form.contactPhone} onChangeText={(value) => updateForm("contactPhone", value)} placeholder="e.g. 09134859402" keyboardType="phone-pad" />
          <FormTextInput label="WhatsApp Number" value={form.contactWhatsapp} onChangeText={(value) => updateForm("contactWhatsapp", value)} placeholder="e.g. 09134859402" keyboardType="phone-pad" />

          <Pressable
            onPress={() => updateForm("isFeatured", !form.isFeatured)}
            className={`mt-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${form.isFeatured ? "border-[#15705B] bg-[#EAF4F1]" : "border-gray-200 bg-white"}`}
          >
            <View className="mr-4 flex-1">
              <Text className="text-base font-bold text-[#101114]">Feature this listing</Text>
              <Text className="mt-1 text-sm text-slate-600">Show this listing as featured.</Text>
            </View>
            <Ionicons name={form.isFeatured ? "checkbox" : "square-outline"} size={25} color={form.isFeatured ? "#15705B" : "#64748B"} />
          </Pressable>

          <View className="mb-3 mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-800">Coordinates</Text>
              <Pressable
                disabled={detectingLocation}
                onPress={() => void detectLocation()}
                className="flex-row items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5"
              >
                {detectingLocation ? <ActivityIndicator size="small" color="#2563EB" /> : <Ionicons name="locate-outline" size={16} color="#2563EB" />}
                <Text className="text-sm font-bold text-[#2563EB]">
                  {detectingLocation ? "Detecting..." : "Detect location"}
                </Text>
              </Pressable>
            </View>
            <View className="mt-3 flex-row gap-3">
              <TextInput
                value={form.latitude}
                onChangeText={(value) => updateForm("latitude", value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114]"
                placeholder="Latitude"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />
              <TextInput
                value={form.longitude}
                onChangeText={(value) => updateForm("longitude", value)}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114]"
                placeholder="Longitude"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </ScrollView>
        <Pressable
          disabled={isPosting}
          onPress={() => void postListing()}
          className={`mx-5 mb-3 min-h-[60px] items-center justify-center rounded-full bg-[#182a3b] ${isPosting ? "opacity-60" : ""}`}
        >
          {isPosting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Post listing</Text>}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormTextInput({
  label,
  multiline = false,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "decimal-pad" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View className="mb-3 mt-3">
      <Text className="mb-1.5 text-base font-bold text-gray-800">{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#94A3B8"
        className={`mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5 ${multiline ? "h-28" : ""}`}
      />
    </View>
  );
}
