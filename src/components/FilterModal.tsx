import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export type SearchFilters = {
  minPrice: string;
  maxPrice: string;
  availability: "all" | "active" | "sold";
};

export const defaultSearchFilters: SearchFilters = {
  minPrice: "",
  maxPrice: "",
  availability: "all",
};

type FilterModalProps = {
  visible: boolean;
  filters: SearchFilters;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
};

export default function FilterModal({
  visible,
  filters,
  onClose,
  onApply,
}: FilterModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [draft, setDraft] = useState(filters);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const applyFilters = () => {
    onApply(draft);
    onClose();
  };

  const resetFilters = () => setDraft(defaultSearchFilters);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/35">
        <Pressable
          className="flex-1"
          accessibilityLabel="Close filters"
          onPress={onClose}
        />
        <View
          className="rounded-t-[30px] border-t border-border bg-background px-5 pb-8 pt-3"
          style={{ marginBottom: keyboardHeight }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-border" />
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">Filters</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? "#CBD2CE" : "#52605B"}
              />
            </Pressable>
          </View>

          <Text className="mb-2 mt-6 text-sm font-semibold text-foreground">
            Price range
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-border bg-surface px-4">
              <TextInput
                value={draft.minPrice}
                onChangeText={(minPrice) =>
                  setDraft((value) => ({ ...value, minPrice }))
                }
                placeholder="Minimum"
                placeholderTextColor={isDark ? "#858F8A" : "#98A29E"}
                keyboardType="numeric"
                className="h-14 text-[15px] text-foreground"
                accessibilityLabel="Minimum price"
              />
            </View>
            <View className="flex-1 rounded-2xl border border-border bg-surface px-4">
              <TextInput
                value={draft.maxPrice}
                onChangeText={(maxPrice) =>
                  setDraft((value) => ({ ...value, maxPrice }))
                }
                placeholder="Maximum"
                placeholderTextColor={isDark ? "#858F8A" : "#98A29E"}
                keyboardType="numeric"
                className="h-14 text-[15px] text-foreground"
                accessibilityLabel="Maximum price"
              />
            </View>
          </View>

          <Text className="mb-2 mt-6 text-sm font-semibold text-foreground">
            Availability
          </Text>
          <View className="flex-row gap-2">
            {(["all", "active", "sold"] as const).map((option) => {
              const selected = draft.availability === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`flex-1 rounded-xl py-3 ${
                    selected
                      ? "bg-[#183C35] dark:bg-[#376E5F]"
                      : "border border-border bg-surface"
                  }`}
                  onPress={() =>
                    setDraft((value) => ({ ...value, availability: option }))
                  }
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      selected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {option === "all"
                      ? "All"
                      : option === "active"
                        ? "Available"
                        : "Sold"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-8 flex-row gap-3">
            <Pressable
              className="flex-1 items-center justify-center rounded-2xl border border-border bg-surface py-4"
              onPress={resetFilters}
            >
              <Text className="text-sm font-bold text-foreground">Reset</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center justify-center rounded-2xl bg-[#183C35] py-4"
              onPress={applyFilters}
            >
              <Text className="text-sm font-bold text-white">Show results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
