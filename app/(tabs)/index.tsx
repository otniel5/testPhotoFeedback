import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

export default function TabOneScreen() {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelection = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
      });
      setFeedback(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const response = await analyzePhoto(selectedImage);
      setFeedback(response);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      setFeedback({
        positives: ["Error analyzing photo"],
        suggestions: ["Please try again"],
      });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Feedback</Text>
        <Text style={styles.titleAI}>AI</Text>
      </View>

      <Text style={styles.subtitle}>
        Get professional feedback on your photos using AI
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
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={handleImageSelection}
            >
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeImage}
            >
              <Text style={styles.analyzeButtonText}>
                {loading ? "Analyzing..." : "Analyze with AI"}
              </Text>
            </TouchableOpacity>

            {feedback && (
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
    marginTop: 80,
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
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
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
});