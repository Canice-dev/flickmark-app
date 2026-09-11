import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  Share,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Listing = {
  id: string;
  category: string;
  title: string;
  description: string;
  price: string;
  imageUrls: string[];
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  contactPhone: string;
  contactWhatsapp: string;
  status: "active" | "sold";
  owner: { displayName: string | null };
};

const formatPrice = (price: string) => {
  const amount = Number(price);
  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG")}`
    : "Price on request";
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadListing = useCallback(async () => {
    try {
      const response = await fetch("/api/listings");
      if (!response.ok) throw new Error();
      const { listings } = (await response.json()) as { listings: Listing[] };
      setListing(listings.find((item) => item.id === id) ?? null);
    } catch {
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  const openUrl = async (url: string, message: string) => {
    try {
      if (!(await Linking.canOpenURL(url))) throw new Error();
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unavailable", message);
    }
  };

  if (loading)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F6F7]">
        <ActivityIndicator color="#1E584C" />
        <Text className="mt-3 text-sm text-[#7E8985]">Loading listing…</Text>
      </SafeAreaView>
    );
  if (!listing)
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F6F7] px-6">
        <Ionicons name="alert-circle-outline" size={38} color="#84908B" />
        <Text className="mt-4 text-center text-base font-bold text-[#263330]">
          This listing is no longer available.
        </Text>
        <Pressable
          className="mt-5 rounded-full bg-[#183C35] px-5 py-3"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );

  const location = [listing.address, listing.city].filter(Boolean).join(", ");
  const longDescription = listing.description.length > 280;
  const description =
    longDescription && !expanded
      ? `${listing.description.slice(0, 280).trimEnd()}…`
      : listing.description;
  const disabled = listing.status === "sold";
  const phone = listing.contactPhone.replace(/[^+\d]/g, "");
  const whatsapp = listing.contactWhatsapp
    .replace(/\D/g, "")
    .replace(/^0/, "234");

  return (
    <View className="flex-1 bg-[#F5F6F7]">
      <FlatList
        data={[listing]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
        renderItem={() => (
          <>
            <View className="h-[300px] overflow-hidden bg-[#E7EAE8]">
              {listing.imageUrls.length ? (
                <FlatList
                  data={listing.imageUrls}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(url, index) => `${url}-${index}`}
                  onMomentumScrollEnd={(event) =>
                    setActiveImage(
                      Math.round(event.nativeEvent.contentOffset.x / width),
                    )
                  }
                  renderItem={({ item }) => (
                    <Image
                      source={{ uri: item }}
                      contentFit="cover"
                      style={{ width, height: 300 }}
                    />
                  )}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="image-outline" size={44} color="#84908B" />
                  <Text className="mt-2 text-sm text-[#7E8985]">
                    No photos available
                  </Text>
                </View>
              )}
              {disabled && (
                <View className="absolute bottom-4 left-4 rounded-full bg-[#FFF3D5] px-3 py-1.5">
                  <Text className="text-xs font-bold text-[#916000]">Sold</Text>
                </View>
              )}
              {listing.imageUrls.length > 1 && (
                <View className="absolute bottom-4 right-4 rounded-full bg-black/55 px-2.5 py-1">
                  <Text className="text-xs font-semibold text-white">
                    {activeImage + 1}/{listing.imageUrls.length}
                  </Text>
                </View>
              )}
              <View
                className="absolute left-4 right-4 flex-row items-center justify-between"
                style={{ top: insets.top + 8 }}
              >
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                  onPress={() => router.back()}
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="chevron-back" size={22} color="white" />
                </Pressable>
                <View className="flex-row gap-2">
                  <Pressable
                    className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                    onPress={() => setSaved(!saved)}
                    accessibilityLabel="Save listing"
                  >
                    <Ionicons
                      name={saved ? "heart" : "heart-outline"}
                      size={20}
                      color={saved ? "#F26B6B" : "white"}
                    />
                  </Pressable>
                  <Pressable
                    className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
                    onPress={() =>
                      void Share.share({
                        message: `${listing.title} — ${formatPrice(listing.price)} in ${location}`,
                      })
                    }
                    accessibilityLabel="Share listing"
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={20}
                      color="white"
                    />
                  </Pressable>
                </View>
              </View>
            </View>
            <View className="px-5 pb-6 pt-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold uppercase tracking-wide text-[#52736A]">
                    {listing.category}
                  </Text>
                  <Text className="mt-1 text-2xl font-bold leading-8 text-[#202A27]">
                    {listing.title}
                  </Text>
                </View>
                <Text className="text-xl font-extrabold text-[#1E584C]">
                  {formatPrice(listing.price)}
                </Text>
              </View>
              <Pressable
                className="mt-4 flex-row items-center rounded-2xl bg-white p-4"
                onPress={() =>
                  void openUrl(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location} ${listing.latitude},${listing.longitude}`)}`,
                    "Maps isn't available on this device.",
                  )
                }
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EDF2F0]">
                  <Ionicons name="location-outline" size={21} color="#1E584C" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-sm font-semibold text-[#263330]"
                    numberOfLines={2}
                  >
                    {location}
                  </Text>
                  <Text className="mt-0.5 text-xs text-[#7E8985]">
                    View on map
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={19} color="#84908B" />
              </Pressable>
              <Text className="mb-2 mt-7 text-lg font-bold text-[#202A27]">
                Description
              </Text>
              <Text className="text-[15px] leading-6 text-[#52605B]">
                {description}
              </Text>
              {longDescription && (
                <Pressable
                  className="mt-2 self-start"
                  onPress={() => setExpanded(!expanded)}
                >
                  <Text className="text-sm font-bold text-[#1E584C]">
                    {expanded ? "Show less" : "Read more"}
                  </Text>
                </Pressable>
              )}
              <View className="mt-7 flex-row items-center rounded-2xl bg-white p-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EDF2F0]">
                  <Ionicons name="person-outline" size={22} color="#1E584C" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-[#7E8985]">Listed by</Text>
                  <Text className="mt-0.5 text-[15px] font-bold text-[#263330]">
                    {listing.owner.displayName || "FlickMart seller"}
                  </Text>
                </View>
              </View>
              <View className="mt-6 flex-row rounded-2xl bg-[#FFF8E8] p-4">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color="#A76A00"
                />
                <Text className="ml-3 flex-1 text-xs leading-5 text-[#765D22]">
                  Meet in a public place and inspect the item before making a
                  payment.
                </Text>
              </View>
            </View>
          </>
        )}
      />
      <SafeAreaView
        edges={["bottom"]}
        className="absolute bottom-0 left-0 right-0 border-t border-[#E7EAE8] bg-white px-5 pb-3 pt-3"
      >
        <View className="flex-row gap-3">
          <Pressable
            disabled={disabled}
            className={`h-12 flex-1 flex-row items-center justify-center rounded-full border ${disabled ? "border-[#D8DDDA] bg-[#F0F2F1]" : "border-[#1E584C] bg-white"}`}
            onPress={() =>
              void openUrl(
                `tel:${phone}`,
                "Calling isn't available on this device.",
              )
            }
          >
            <Ionicons
              name="call-outline"
              size={19}
              color={disabled ? "#84908B" : "#1E584C"}
            />
            <Text
              className={`ml-2 font-bold ${disabled ? "text-[#84908B]" : "text-[#1E584C]"}`}
            >
              Call
            </Text>
          </Pressable>
          <Pressable
            disabled={disabled}
            className={`h-12 flex-1 flex-row items-center justify-center rounded-full ${disabled ? "bg-[#D8DDDA]" : "bg-[#1E584C]"}`}
            onPress={() =>
              void openUrl(
                `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello, I'm interested in your listing: ${listing.title}`)}`,
                "WhatsApp isn't available on this device.",
              )
            }
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="ml-2 font-bold text-white">WhatsApp</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
