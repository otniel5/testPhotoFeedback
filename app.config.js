import 'dotenv/config';

export default {
    expo: {
        name: "testPhoto-AI",
        scheme: "photoai",
        newArchEnabled: true,
        extra: {
            googleAiKey: process.env.EXPO_PUBLIC_GOOGLE_AI_KEY,
        },
    },
}; 