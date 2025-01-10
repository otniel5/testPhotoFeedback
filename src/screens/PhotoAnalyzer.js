import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzePhoto } from '../services/aiService';

const PhotoAnalyzer = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets?.[0]) {
            setSelectedImage(result.assets[0]);
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
            console.error('Error analyzing photo:', error);
            setFeedback({
                positives: ['Error analyzing photo'],
                suggestions: ['Please try again'],
            });
        }
        setLoading(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Photo AI Feedback</Text>

            <TouchableOpacity style={styles.button} onPress={selectImage}>
                <Text style={styles.buttonText}>Select Photo</Text>
            </TouchableOpacity>

            {selectedImage && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.analyzeButton]}
                        onPress={analyzeImage}
                    >
                        <Text style={styles.buttonText}>Analyze Photo</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && (
                <ActivityIndicator size="large" color="#0000ff" />
            )}

            {feedback && (
                <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackTitle}>Positive Feedback:</Text>
                    {feedback.positives.map((positive, index) => (
                        <Text key={`positive-${index}`} style={styles.feedbackText}>
                            • {positive}
                        </Text>
                    ))}

                    <Text style={[styles.feedbackTitle, styles.suggestionsTitle]}>
                        Suggestions for Improvement:
                    </Text>
                    {feedback.suggestions.map((suggestion, index) => (
                        <Text key={`suggestion-${index}`} style={styles.feedbackText}>
                            • {suggestion}
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    analyzeButton: {
        backgroundColor: '#34C759',
    },
    imageContainer: {
        marginVertical: 20,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
    },
    feedbackContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    suggestionsTitle: {
        marginTop: 20,
    },
    feedbackText: {
        fontSize: 16,
        marginBottom: 5,
        lineHeight: 22,
    },
});

export default PhotoAnalyzer; 