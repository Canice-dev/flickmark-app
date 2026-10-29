import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, useUnstableNativeVariable } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

const categories = [
  {
    label: "All",
    category: "All",
    image: require("../../../assets/images/all.png"),
  },
  {
    label: "Homes",
    category: "Housing",
    image: require("../../../assets/images/homes.png"),
  },
  {
    label: "Electronics",
    category: "Electronics",
    image: require("../../../assets/images/electronic.png"),
  },
  {
    label: "Fashion",
    category: "Fashion",
    image: require("../../../assets/images/fashion.png"),
  },
  {
    label: "Others",
    category: "Other",
    image: require("../../../assets/images/others.png"),
  },
];

function formatPrice(price: string) {
  const amount = Number(price);
  return Number.isFinite(amount)
    ? `₦${amount.toLocaleString("en-NG")}`
    : "Price on request";
}

function toHexColor(channels: unknown, fallback: string) {
  if (typeof channels !== "string") return fallback;
  const values = channels.trim().split(/\s+/).map(Number);
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) {
    return fallback;
  }
  return `#${values.map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
}

function useThemeColor(
  variable: string,
  lightFallback: string,
  darkFallback: string,
) {
  const { colorScheme } = useColorScheme();
  return toHexColor(
    useUnstableNativeVariable(variable),
    colorScheme === "dark" ? darkFallback : lightFallback,
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const primaryColor = useThemeColor("--color-primary", "#9738CE", "#B44EDE");
  const mutedColor = useThemeColor("--color-muted", "#808084", "#99999E");
  const [imageFailed, setImageFailed] = useState(false);
  const coverImage = listing.imageUrls[0];

  return (
    <View className="mx-5 mb-5 overflow-hidden">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${listing.title}`}
        onPress={() =>
          router.push({ pathname: "/listing/[id]", params: { id: listing.id } })
        }
      >
        <View className="h-[230px] w-full rounded-3xl overflow-hidden bg-primary-soft">
          {coverImage && !imageFailed ? (
            <Image
              source={{ uri: coverImage }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={32} color={mutedColor} />
              <Text className="mt-2 text-xs text-muted">
                {coverImage ? "Image unavailable" : "No photos available"}
              </Text>
            </View>
          )}
          {listing.status === "sold" && (
            <View className="absolute left-3 top-3 rounded-full bg-warning px-3 py-1.5">
              <Text className="text-[11px] font-bold text-on-warning">
                Sold
              </Text>
            </View>
          )}
        </View>

        <View className="pb-4 pt-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className="flex-1 text-[16px] font-semibold leading-5 text-foreground"
              numberOfLines={1}
            >
              {listing.title}
            </Text>
            <Text className="text-[16px] font-bold text-primary">
              {formatPrice(listing.price)}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="location-outline" size={15} color={mutedColor} />
            <Text className="ml-1 flex-1 text-xs text-muted" numberOfLines={1}>
              {[listing.address, listing.city].filter(Boolean).join(", ")}
            </Text>
            <Text className="ml-2 mr-1 text-xs font-medium text-muted">
              {listing.category}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const primaryColor = useThemeColor("--color-primary", "#9738CE", "#B44EDE");
  const foregroundColor = useThemeColor(
    "--color-foreground",
    "#161616",
    "#F6F6F7",
  );
  const mutedColor = useThemeColor("--color-muted", "#808084", "#99999E");
  const { user } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

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

  const visibleListings = useMemo(
    () =>
      selectedCategory === "All"
        ? listings
        : listings.filter((listing) => listing.category === selectedCategory),
    [listings, selectedCategory],
  );

  const renderListing: ListRenderItem<Listing> = useCallback(
    ({ item }) => <ListingCard listing={item} />,
    [],
  );
  const firstName = user?.firstName?.trim() || "there";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        className="absolute left-0 right-0 top-0 z-10 bg-background px-5 pb-4"
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
        style={{
          paddingTop: insets.top + 12,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Image
                source={require("../../../assets/images/logo-mark.png")}
                contentFit="contain"
                style={{ height: 35, width: 35 }}
              />
              <Text className="text-[20px] font-bold tracking-tight text-primary">
                FlickMart
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            className="items-center justify-center rounded-full bg-surface"
            onPress={() => router.push("/(tabs)/profile")}
          >
            {user?.imageUrl && !avatarFailed ? (
              <Image
                source={{ uri: user.imageUrl }}
                contentFit="cover"
                style={{ width: 30, height: 30, borderRadius: 29 }}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <Ionicons
                name="person-outline"
                size={21}
                color={foregroundColor}
              />
            )}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search listings"
          className="mt-5 min-h-14 flex-row items-center rounded-full bg-surface px-4"
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="search-outline" size={21} color={mutedColor} />
          <Text className="ml-3 flex-1 text-[14px] text-muted">
            Search homes, phones, fashion...
          </Text>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
            <Ionicons
              name="options-outline"
              size={18}
              color={foregroundColor}
            />
          </View>
        </Pressable>

        <FlatList
          data={categories}
          horizontal
          keyExtractor={(category) => category.category}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingRight: 20 }}
          className="mt-6"
          renderItem={({ item: category }) => {
            const selected = selectedCategory === category.category;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Browse ${category.label}`}
                className="w-[62px] items-center"
                onPress={() => setSelectedCategory(category.category)}
              >
                <View
                  className={`h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-3xl bg-primary-soft ${selected ? "border border-muted" : "border border-border"}`}
                >
                  <Image
                    source={category.image}
                    contentFit="contain"
                    style={{ width: 52, height: 52 }}
                  />
                </View>
                <Text
                  className={`mt-2 text-center text-[11px] font-semibold ${selected ? "text-primary" : "text-muted"}`}
                  numberOfLines={1}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={visibleListings}
        renderItem={renderListing}
        keyExtractor={(listing) => listing.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 28 }}
        refreshing={isRefreshing}
        onRefresh={() => void loadListings(true)}
        ListHeaderComponent={
          <>
            <View className="mb-4 mt-7 flex-row items-center justify-between px-5">
              <View>
                <Text className="text-[20px] font-bold tracking-tight text-foreground">
                  Fresh finds near you
                </Text>
                <Text className="mt-1 text-[12px] text-muted">
                  Discover something worth keeping
                </Text>
              </View>
              {!isLoading && !error && (
                <Text className="text-xs font-medium text-muted">
                  {visibleListings.length}{" "}
                  {visibleListings.length === 1 ? "item" : "items"}
                </Text>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color={primaryColor} />
              <Text className="mt-3 text-sm text-muted">
                Finding fresh listings...
              </Text>
            </View>
          ) : error ? (
            <View className="mx-5 items-center rounded-2xl bg-surface px-6 py-10">
              <Ionicons
                name="cloud-offline-outline"
                size={28}
                color={mutedColor}
              />
              <Text className="mt-3 text-center text-sm leading-5 text-muted">
                {error}
              </Text>
            </View>
          ) : (
            <View className="mx-5 items-center rounded-2xl bg-surface px-6 py-10">
              <Ionicons name="search-outline" size={28} color={mutedColor} />
              <Text className="mt-3 text-center font-semibold text-foreground">
                No listings yet
              </Text>
              <Text className="mt-1 text-center text-sm text-muted">
                Check back soon for new finds near you.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
