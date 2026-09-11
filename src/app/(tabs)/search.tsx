import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import FilterModal, {
  defaultSearchFilters,
  SearchFilters,
} from "@/components/FilterModal";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  status: "active" | "sold";
};

const categories = ["All", "Housing", "Electronics", "Fashion", "Other"];

function formatPrice(price: string) {
  const amount = Number(price);
  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG")}`
    : "Price on request";
}

function ListingResult({ listing }: { listing: Listing }) {
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const hasImages = listing.imageUrls.length > 0;

  const handleGalleryScroll = (offsetX: number) => {
    if (cardWidth) setActiveIndex(Math.round(offsetX / cardWidth));
  };

  return (
    <View className="mb-5 bg-[#F5F6F7]">
      <View
        className="h-64 w-full overflow-hidden rounded-3xl bg-[#F5F6F7]"
        onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}
      >
        {hasImages && cardWidth > 0 ? (
          <>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth}
              snapToAlignment="start"
              disableIntervalMomentum
              decelerationRate="normal"
              directionalLockEnabled
              overScrollMode="never"
              style={{ width: cardWidth, height: "100%" }}
              onMomentumScrollEnd={(event) =>
                handleGalleryScroll(event.nativeEvent.contentOffset.x)
              }
              scrollEventThrottle={16}
            >
              {listing.imageUrls.map((imageUrl, index) => (
                <View
                  key={`${imageUrl}-${index}`}
                  style={{ width: cardWidth, height: "100%" }}
                >
                  {failedImages.includes(index) ? (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons
                        name="image-outline"
                        size={30}
                        color="#84908B"
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: imageUrl }}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                      onError={() =>
                        setFailedImages((images) => [...images, index])
                      }
                    />
                  )}
                </View>
              ))}
            </ScrollView>
            {listing.imageUrls.length > 1 && (
              <View className="pointer-events-none absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
                {listing.imageUrls.map((imageUrl, index) => (
                  <View
                    key={`${imageUrl}-${index}`}
                    className={`rounded-full ${
                      activeIndex === index
                        ? "h-1.5 w-4 bg-white"
                        : "h-1.5 w-1.5 bg-white/70"
                    }`}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#84908B" />
            <Text className="mt-2 text-xs font-medium text-[#84908B]">
              No photos available
            </Text>
          </View>
        )}
        {listing.status === "sold" && (
          <View className="absolute left-2 top-2 rounded-full bg-[#FFF3D5] px-2 py-1">
            <Text className="text-[10px] font-bold text-[#916000]">Sold</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Save ${listing.title}`}
          className="absolute right-2 top-2 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="heart-outline" size={27} color="#FFFFFF" />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${listing.title}`}
        className="px-1 pb-2 pt-3"
      >
        <Text
          className="text-[15px] font-semibold leading-5 text-[#263330]"
          numberOfLines={2}
        >
          {listing.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="location-outline" size={14} color="#84908B" />
          <Text
            className="ml-1 flex-1 text-xs text-[#7E8985]"
            numberOfLines={1}
          >
            {listing.address}, {listing.city}
          </Text>
        </View>
        <Text className="mt-3 text-[15px] font-bold text-[#1E584C]">
          {formatPrice(listing.price)}
        </Text>
      </Pressable>
    </View>
  );
}

export default function SearchScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);
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
      setError("We couldn't load listings right now. Pull down to try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);

    return listings.filter((listing) => {
      const matchesCategory =
        category === "All" || listing.category === category;
      const listingPrice = Number(listing.price);
      const matchesMinPrice = !filters.minPrice || listingPrice >= minPrice;
      const matchesMaxPrice = !filters.maxPrice || listingPrice <= maxPrice;
      const matchesAvailability =
        filters.availability === "all" ||
        listing.status === filters.availability;
      const searchableText = [
        listing.title,
        listing.category,
        listing.address,
        listing.city,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesAvailability &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [category, filters, listings, query]);

  const activeSearchCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.availability !== "all",
  ].filter(Boolean).length;

  const renderResult: ListRenderItem<Listing> = useCallback(
    ({ item }) => <ListingResult listing={item} />,
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6F7]" edges={["top"]}>
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(listing) => listing.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10"
        refreshing={isRefreshing}
        onRefresh={() => void loadListings(true)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View className="pb-5 pt-4">
              <Text className="text-[26px] font-bold tracking-tight text-[#202A27]">
                Search
              </Text>
              <Text className="mt-1 text-sm text-[#7E8985]">
                Find something worth discovering.
              </Text>
            </View>

            <View className="flex-row items-center rounded-full bg-white px-4">
              <Ionicons name="search-outline" size={21} color="#68736F" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search listings"
                placeholderTextColor="#98A29E"
                returnKeyType="search"
                className="ml-3 h-14 flex-1 text-[15px] text-[#263330]"
                accessibilityLabel="Search listings"
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#F0F2F1]"
                  onPress={() => setQuery("")}
                >
                  <Ionicons name="close" size={17} color="#68736F" />
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open filters"
                className="relative ml-1 h-10 w-10 items-center justify-center"
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="options-outline" size={20} color="#52605B" />
                {activeSearchCount > 0 && (
                  <View className="absolute right-0 top-0 h-4 w-4 items-center justify-center rounded-full bg-[#D95757]">
                    <Text className="text-[9px] font-bold text-white">
                      {activeSearchCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              className="mt-4"
              contentContainerStyle={{ gap: 8, paddingRight: 20 }}
              renderItem={({ item }) => {
                const selected = item === category;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`rounded-full px-4 py-2.5 ${
                      selected ? "bg-[#183C35]" : "bg-white"
                    }`}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        selected ? "text-white" : "text-[#596560]"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {!isLoading && !error && (
              <View className="mb-3 mt-7 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-[#263330]">
                  {query.trim() ? "Search results" : "Browse listings"}
                </Text>
                <Text className="text-sm font-medium text-[#7E8985]">
                  {results.length} {results.length === 1 ? "item" : "items"}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator color="#1E584C" />
              <Text className="mt-3 text-sm text-[#7E8985]">
                Loading listings…
              </Text>
            </View>
          ) : error ? (
            <View className="items-center rounded-2xl bg-white px-6 py-12">
              <Ionicons
                name="cloud-offline-outline"
                size={30}
                color="#84908B"
              />
              <Text className="mt-3 text-center text-sm leading-5 text-[#68736F]">
                {error}
              </Text>
            </View>
          ) : (
            <View className="items-center rounded-2xl bg-white px-6 py-12">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EDF2F0]">
                <Ionicons name="search-outline" size={23} color="#52736A" />
              </View>
              <Text className="mt-4 text-base font-bold text-[#263330]">
                No listings found
              </Text>
              <Text className="mt-1 text-center text-sm leading-5 text-[#7E8985]">
                Try a different keyword or browse another category.
              </Text>
            </View>
          )
        }
      />
      <FilterModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}
