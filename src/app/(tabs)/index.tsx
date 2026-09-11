import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Listing = {
  id: string;
  category: string;
  title: string;
  price: string;
  imageUrls: string[];
  address: string;
  city: string;
  isFeatured: boolean;
  status: "active" | "sold";
};

const categories = [
  { label: "All", category: "All", icon: "apps-outline" as const },
  { label: "Homes", category: "Housing", icon: "home-outline" as const },
  {
    label: "Electronics",
    category: "Electronics",
    icon: "tv-outline" as const,
  },
  { label: "Fashion", category: "Fashion", icon: "shirt-outline" as const },
  { label: "Other", category: "Other", icon: "grid-outline" as const },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatPrice(price: string) {
  const amount = Number(price);
  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG")}`
    : "Price on request";
}

function ListingCard({
  listing,
  horizontal = false,
}: {
  listing: Listing;
  horizontal?: boolean;
}) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const coverImage = listing.imageUrls[0];
  const imageContent =
    coverImage && !imageFailed ? (
      <Image
        source={coverImage}
        contentFit="cover"
        style={{ width: "100%", height: "100%" }}
        onError={() => setImageFailed(true)}
      />
    ) : (
      <View className="flex-1 items-center justify-center">
        <Ionicons name="image-outline" size={28} color="#65716D" />
        <Text className="mt-2 text-xs text-[#65716D]">Image unavailable</Text>
      </View>
    );

  if (!horizontal) {
    return (
      <Pressable
        accessibilityLabel={`Open ${listing.title}`}
        className="mx-5 mb-3 flex-row items-center gap-3 overflow-hidden rounded-2xl border border-[#FAF8F4]"
        onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
      >
        <View className="h-[120px] w-[140px] overflow-hidden rounded-xl bg-[#E8E8E8]">
          {imageContent}
          {listing.status === "sold" && (
            <View className="absolute left-2 top-2 rounded-full bg-[#F2B84B] px-2 py-1">
              <Text className="text-[11px] font-bold text-[#1C2523]">Sold</Text>
            </View>
          )}
        </View>
        <View className="flex-1 py-1">
          <Text
            className="text-[14px] font-semibold text-[#0D0D0D]"
            numberOfLines={2}
          >
            {listing.title}
          </Text>
          <View className="mb-3 mt-3 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <View className="flex-1">
              <Text className="text-[11px] text-[#999]" numberOfLines={1}>
                {listing.address}
              </Text>
              <Text className="text-[11px] text-[#999]" numberOfLines={1}>
                {listing.city}
              </Text>
            </View>
          </View>
          <Text className="text-[14px] font-bold text-[#0D0D0D]">
            {formatPrice(listing.price)}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={`Save ${listing.title}`}
          className="self-start px-1 pt-2"
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color="rgba(156,163,175,0.7)"
          />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <Pressable
      className="overflow-hidden rounded-2xl"
      style={{ width: 210 }}
      onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
    >
      <View className="aspect-[0.95] bg-[#E7E4DE]">
        {imageContent}
        {listing.status === "sold" && (
          <View className="absolute left-2 top-2 rounded-full bg-[#F2B84B] px-2 py-1">
            <Text className="text-[11px] font-bold text-[#1C2523]">Sold</Text>
          </View>
        )}
        <Pressable
          accessibilityLabel={`Save ${listing.title}`}
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/95"
        >
          <Ionicons name="bookmark-outline" size={16} color="#163B35" />
        </Pressable>
      </View>
      <View className="p-3">
        <Text
          className="text-sm font-semibold text-[#1C2523]"
          numberOfLines={1}
        >
          {listing.title}
        </Text>
        <Text className="mt-1 text-xs text-[#65716D]" numberOfLines={1}>
          {listing.address}, {listing.city}
        </Text>
        <Text className="mt-2 text-[15px] font-bold text-[#163B35]">
          {formatPrice(listing.price)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch("/api/listings");
      if (!response.ok) throw new Error("Unable to load listings");
      const data = (await response.json()) as { listings: Listing[] };
      setListings(data.listings);
      setError(null);
    } catch {
      setError("We couldn't load nearby listings. Pull down to try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const { featuredListings, standardListings } = useMemo(() => {
    const categoryListings =
      selectedCategory === "All"
        ? listings
        : listings.filter((listing) => listing.category === selectedCategory);

    return {
      featuredListings: categoryListings.filter(
        (listing) => listing.isFeatured,
      ),
      standardListings: categoryListings.filter(
        (listing) => !listing.isFeatured,
      ),
    };
  }, [listings, selectedCategory]);

  const renderFeaturedListing: ListRenderItem<Listing> = useCallback(
    ({ item }) => <ListingCard listing={item} horizontal />,
    [],
  );
  const renderStandardListing: ListRenderItem<Listing> = useCallback(
    ({ item }) => <ListingCard listing={item} />,
    [],
  );
  const firstName = user?.firstName?.trim() || "there";

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F4]" edges={["top"]}>
      <FlatList
        data={standardListings}
        renderItem={renderStandardListing}
        keyExtractor={(listing) => listing.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={() => void loadListings(true)}
        ListHeaderComponent={
          <>
            <View className="px-5 pt-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <View className="mb-1 flex-row items-center">
                    <Image
                      source={require("../../../assets/images/logo-mark.png")}
                      contentFit="contain"
                      style={{ height: 30, width: 30 }}
                    />
                    <Text className="ml-2 text-xl font-bold tracking-tight text-[#163B35]">
                      FlickMart
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-[#65716D]">
                    {greeting()}, {firstName}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Open profile"
                  className="h-11 w-11 items-center justify-center rounded-full border border-[#E7E4DE] bg-white"
                  onPress={() => router.push("/(tabs)/profile")}
                >
                  <Ionicons name="person-outline" size={21} color="#163B35" />
                </Pressable>
              </View>

              <Pressable
                accessibilityLabel="Search listings"
                className="mt-3 min-h-14 flex-row items-center rounded-full border border-[#E7E4DE] bg-white px-4"
                onPress={() => router.push("/(tabs)/search")}
              >
                <Ionicons name="search-outline" size={21} color="#65716D" />
                <Text className="ml-3 flex-1 text-[15px] text-[#65716D]">
                  Search apartments, phones, land…
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={categories}
              horizontal
              keyExtractor={(category) => category.category}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
              className="mt-6"
              renderItem={({ item: category }) => {
                const selected = selectedCategory === category.category;
                return (
                  <Pressable
                    className={`min-w-[72px] flex-row gap-2 items-center justify-center rounded-2xl border px-3 py-3 ${selected ? "border-[#163B35] bg-[#163B35]" : "border-[#E7E4DE] bg-white"}`}
                    onPress={() => setSelectedCategory(category.category)}
                  >
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={selected ? "#FFFFFF" : "#247A62"}
                    />
                    <Text
                      className={`mt-1.5 text-xs font-semibold ${selected ? "text-white" : "text-[#1C2523]"}`}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {isLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#247A62" />
                <Text className="mt-3 text-sm text-[#65716D]">
                  Finding fresh listings…
                </Text>
              </View>
            ) : error ? (
              <View className="mx-5 mt-6 items-center rounded-2xl border border-[#E7E4DE] bg-white px-6 py-10">
                <Ionicons
                  name="cloud-offline-outline"
                  size={28}
                  color="#65716D"
                />
                <Text className="mt-3 text-center text-sm text-[#65716D]">
                  {error}
                </Text>
              </View>
            ) : (
              <>
                {featuredListings.length > 0 && (
                  <View className="mt-6">
                    <View className="mb-4 flex-row items-center justify-between px-5">
                      <Text className="text-xl font-bold text-[#1C2523]">
                        Featured listings
                      </Text>
                      <Pressable onPress={() => router.push("/(tabs)/search")}>
                        <Text className="text-sm font-bold text-[#247A62]">
                          See all
                        </Text>
                      </Pressable>
                    </View>
                    <FlatList
                      data={featuredListings}
                      renderItem={renderFeaturedListing}
                      keyExtractor={(listing) => listing.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 14, paddingHorizontal: 20 }}
                    />
                  </View>
                )}

                <View className="mb-4 mt-7 px-5">
                  <Text className="text-xl font-bold text-[#1C2523]">
                    Recent listings
                  </Text>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View className="mx-5 items-center rounded-2xl border border-[#E7E4DE] bg-white px-6 py-10">
              <Ionicons name="search-outline" size={28} color="#65716D" />
              <Text className="mt-3 text-center font-semibold text-[#1C2523]">
                {featuredListings.length
                  ? "No more listings"
                  : "No listings yet"}
              </Text>
              <Text className="mt-1 text-center text-sm text-[#65716D]">
                {featuredListings.length
                  ? "Check the featured listings above."
                  : "Check back soon for new finds near you."}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !isLoading && !error ? (
            <View className="mx-5 mt-6 flex-row rounded-2xl border border-[#F2D89F] bg-[#FFF8E8] p-4">
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#A76A00"
              />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-[#59420D]">
                  Stay safe when meeting sellers
                </Text>
                <Text className="mt-1 text-sm leading-5 text-[#765D22]">
                  Meet in a public place and inspect every item before you pay.
                </Text>
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
