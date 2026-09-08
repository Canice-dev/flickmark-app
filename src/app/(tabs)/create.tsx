import { Ionicons } from "@expo/vector-icons";
import {
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

const categories = [
  { label: "Housing", icon: "home-outline" },
  { label: "Electronics", icon: "phone-portrait-outline" },
  { label: "Fashion", icon: "shirt-outline" },
  { label: "Other", icon: "grid-outline" },
] as const;

export default function CreateScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <View>
            <Text className="text-[25px] font-bold tracking-[-0.6px] text-[#101114]">
              Create a listing
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm shadow-black/10">
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
            <Text className=" px-3 py-1.5 text-base font-semibold text-[#101114]">
              0 / 6
            </Text>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable className="h-28 w-28 items-center justify-center rounded-3xl border-2 border-dashed border-gray-400 bg-gray-100">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="camera-outline" size={21} color="#15705B" />
              </View>
              <Text className="mt-2 text-xs font-semibold text-[#101114]">
                Add photo
              </Text>
            </Pressable>
            <View className="h-28 w-28 items-center justify-center rounded-3xl bg-[#F1F3F5]">
              <Ionicons name="image-outline" size={25} color="#CBD5E1" />
            </View>
            <View className="h-28 w-28 items-center justify-center rounded-3xl bg-[#F1F3F5]">
              <Ionicons name="image-outline" size={25} color="#CBD5E1" />
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-base font-bold text-[#101114]">Title</Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="Give your listing a clear title"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View className="mt-6">
            <Text className="text-base font-bold text-[#101114]">Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
            >
              <View className="flex-row gap-3 pr-5">
                {categories.map((category, index) => (
                  <Pressable
                    key={category.label}
                    className={`min-w-[104px] items-center rounded-2xl border px-3 py-3.5 ${index === 0 ? "border-[#15705B] bg-[#EAF4F1]" : "border-gray-200 bg-white"}`}
                  >
                    <Ionicons
                      name={category.icon}
                      size={21}
                      color={index === 0 ? "#15705B" : "#64748B"}
                    />
                    <Text
                      className={`mt-1.5 text-xs font-semibold ${index === 0 ? "text-[#15705B]" : "text-slate-600"}`}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              Description
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 h-28 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="Describe your property or item..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              // value={form.description}
              // onChangeText={(v) => updateForm({ description: v })}
            />
          </View>

          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              Address
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="e.g. Hilltop junction"
              placeholderTextColor="#94A3B8"
              // value={form.address}
              // onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              City
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="e.g. Nsukka"
              placeholderTextColor="#94A3B8"
              // value={form.city}
              // onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              Price
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="e.g. 120000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              // value={form.price}
              // onChangeText={(v) => updateForm({ price: v })}
            />
          </View>

          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              Mobile Number
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="e.g. 09134859402"
              placeholderTextColor="#94A3B8"
              // value={form.mobile_number}
              // onChangeText={(v) => updateForm({ mobile_number: v })}
              keyboardType="numeric"
            />
          </View>
          <View className="mt-3 mb-3">
            <Text className="text-base font-bold text-gray-800 mb-1.5">
              Whatsapp Number
            </Text>
            <TextInput
              className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
              placeholder="e.g. 09134859402"
              placeholderTextColor="#94A3B8"
              // value={form.whatsapp_number}
              // onChangeText={(v) => updateForm({ whatsapp_number: v })}
              keyboardType="numeric"
            />
          </View>

          <View className="mt-3 mb-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-base font-bold text-gray-800 mb-1.5">
                Coordinates
              </Text>
              <Pressable
                // onPress={handleDetectLocation}
                // disabled={detectingLocation}
                className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                {/* {detectingLocation ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons name="locate-outline" size={13} color="#c0c0c0" />
                )} */}
                <Ionicons name="locate-outline" size={13} color="#c0c0c0" />
                <Text className="text-gray-800 text-sm font-bold">
                  {/* {detectingLocation ? "Detecting..." : "Detect Location"} */}
                  Detect Location
                </Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
                  placeholder="Latitude"
                  placeholderTextColor="#94A3B8"
                  // value={form.latitude}
                  // onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-[#101114] shadow-sm shadow-black/5"
                  placeholder="Longitude"
                  placeholderTextColor="#94A3B8"
                  // value={form.longitude}
                  // onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>
        <Pressable className="min-h-[60px]  items-center justify-center mx-5 mb-3 gap-3 rounded-full bg-[#182a3b]">
          <Text className="text-base font-bold text-white">Post</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
