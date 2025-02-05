import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { analyzePhoto } from "../../services/aiService";
import { Ionicons } from "@expo/vector-icons";

interface ImageAsset {
  uri: string;
  width: number;
  height: number;
}

interface FeedbackData {
  positives: string[];
  suggestions: string[];
}

interface Language {
  code: "en" | "he";
  direction: "ltr" | "rtl";
}

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>({
    code: "en",
    direction: "ltr",
  });

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
        base64: false,
        exif: false,
        presentationStyle: "fullScreen",
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Selected asset:", asset);

        if (!asset.uri) {
          throw new Error("No image URI received");
        }

        setSelectedImage({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
        });
        setFeedback(null);
        setError(null);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      alert(
        "Please try selecting a different image or check if the image format is supported (JPEG, PNG)."
      );
    }
  };

  console.log("Current selectedImage:", selectedImage);

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    try {
      const response = await analyzePhoto(selectedImage, language.code);
      if (
        response.positives.length === 0 &&
        response.suggestions.length === 0
      ) {
        throw new Error("Failed to analyze image");
      }
      setFeedback(response);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      setError(
        language.code === "en"
          ? "Failed to analyze image. Please try again."
          : "ניתוח התמונה נכשל. אנא נסה שוב."
      );
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) =>
      prev.code === "en"
        ? { code: "he", direction: "rtl" }
        : { code: "en", direction: "ltr" }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuBar}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={toggleLanguage}
        >
          <Ionicons name="globe-outline" size={24} color="#fff" />
          <Text style={styles.languageText}>{language.code.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          {language.code === "en" ? "Photo Feedback" : "משוב תמונה"}
        </Text>
        <Text style={styles.titleAI}>AI</Text>
      </View>

      <Text style={styles.subtitle}>
        {language.code === "en"
          ? "Get professional feedback on your photos using AI"
          : "קבל משוב מקצועי על התמונות שלך באמצעות בינה מלאכותית"}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        {!selectedImage ? (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleImageSelection}
          >
            <Text style={styles.selectButtonText}>Select Image</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.imageWrapper}>
              {selectedImage && (
                <>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.selectedImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handleImageSelection}
                  >
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={analyzeImage}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.analyzeButton,
                  loading && styles.analyzeButtonDisabled,
                ]}
                onPress={analyzeImage}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" />
                    <Text style={[styles.analyzeButtonText, { marginLeft: 8 }]}>
                      Analyzing...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                )}
              </TouchableOpacity>
            )}

            {feedback && !error && (
              <View style={styles.feedbackContainer}>
                <View style={styles.feedbackSection}>
                  <View style={styles.feedbackHeader}>
                    <Ionicons name="thumbs-up" size={24} color="#4CAF50" />
                    <Text style={styles.feedbackTitle}>What's Great</Text>
                  </View>
                  {feedback.positives.map((positive, index) => (
                    <Text key={`positive-${index}`} style={styles.feedbackText}>
                      {positive}
                    </Text>
                  ))}
                </View>

                <View
                  style={[styles.feedbackSection, styles.suggestionsSection]}
                >
                  <View style={styles.feedbackHeader}>
                    <Ionicons name="bulb" size={24} color="#5B5CFF" />
                    <Text style={styles.feedbackTitle}>Suggestions</Text>
                  </View>
                  {feedback.suggestions.map((suggestion, index) => (
                    <Text
                      key={`suggestion-${index}`}
                      style={styles.feedbackText}
                    >
                      {suggestion}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  bottomPadding: {
    height: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
  },
  titleAI: {
    fontSize: 40,
    fontWeight: "bold",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 24,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  selectButton: {
    backgroundColor: "#5B5CFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 60,
    alignSelf: "center",
    minWidth: 200,
  },
  selectButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  imageWrapper: {
    width: "100%",
    height: 400,
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  analyzeButton: {
    backgroundColor: "#5B5CFF",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    marginVertical: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackContainer: {
    marginTop: 20,
  },
  feedbackSection: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsSection: {
    marginTop: 10,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 12,
  },
  feedbackText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
    lineHeight: 26,
  },
  changeImageButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#5B5CFF",
  },
  languageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuBar: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 40,
  },
});
