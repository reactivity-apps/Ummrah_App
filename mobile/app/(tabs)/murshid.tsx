import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, Alert, Animated, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, BookOpen, MapPin, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFadeIn } from '../../lib/sharedElementTransitions';
import { sendChatMessage } from '../../lib/api/services/openai.service';
import { MessageItem, TypingIndicator, type Message } from '../../components/murshid';

// --- Types ---
interface Suggestion {
    id: string;
    text: string;
    icon: React.ReactNode;
}

// --- Main Screen ---
export default function MurshidScreen() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "As-salamu alaykum. I am Murshid, your companion for this sacred journey.\n\nHow may I assist your heart and mind today?"
        }
    ]);

    // Smooth entrance animation
    const contentFadeStyle = useFadeIn(0);

    // Animated value for smooth transitions
    const suggestionsHeight = useRef(new Animated.Value(1)).current;
    const disclaimerOpacity = useRef(new Animated.Value(1)).current;

    const scrollViewRef = useRef<any>(null);

    const suggestions: Suggestion[] = [
        { id: '1', text: "Teach me the Ihram steps", icon: <BookOpen size={14} color="#4A6741" /> },
        { id: '2', text: "What dua in Tawaf?", icon: <Moon size={14} color="#4A6741" /> },
        { id: '3', text: "Etiquette in Masjid al-Haram", icon: <Sparkles size={14} color="#4A6741" /> },
        { id: '4', text: "Historical ziyarat in Madinah", icon: <MapPin size={14} color="#4A6741" /> },
    ];

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // Prepare conversation history for OpenAI
            const conversationHistory = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content,
            }));

            // Call OpenAI API
            const result = await sendChatMessage(conversationHistory);

            if (result.success && result.response) {
                const murshidMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: result.response,
                };
                setMessages(prev => [...prev, murshidMsg]);
            } else {
                // Show error message
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `I apologize, but I'm having trouble connecting right now. ${result.error || 'Please try again in a moment.'}\n\nIn the meantime, please consult with your group scholars for guidance.`,
                };
                setMessages(prev => [...prev, errorMsg]);

                // Optional: Show alert for critical errors
                if (result.error?.includes('API key')) {
                    Alert.alert('Configuration Error', result.error);
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I encountered an unexpected error. Please try again or consult with your group scholars.',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    // Keyboard listeners for smooth UI transitions
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setIsKeyboardVisible(true);
                // Animate suggestions and disclaimer out
                Animated.parallel([
                    Animated.timing(suggestionsHeight, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: false,
                    }),
                    Animated.timing(disclaimerOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
                // Animate suggestions and disclaimer back in
                Animated.parallel([
                    Animated.timing(suggestionsHeight, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: false,
                    }),
                    Animated.timing(disclaimerOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-card" edges={['top']}>
            {/* Header */}
            <View className="px-4 pt-6 pb-4 bg-card border-b border-sand-200">
                <View className="flex-row items-center mb-2">
                    <View className="h-10 w-10 rounded-full border-2 border-[#C5A059]/30 bg-[#C5A059]/10 items-center justify-center mr-3">
                        <Sparkles size={20} color="#C5A059" />
                    </View>
                    <Text className="text-3xl font-bold text-stone-800">Murshid</Text>
                </View>
                <Text className="text-stone-500 text-base ml-13">Your AI spiritual guide</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                {/* Chat Area */}
                <Animated.ScrollView
                    style={contentFadeStyle}
                    ref={scrollViewRef}
                    className="flex-1 bg-background"
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 16,
                        flexGrow: 1,
                    }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    {messages.map((msg) => (
                        <MessageItem key={msg.id} message={msg} />
                    ))}

                    {isTyping && <TypingIndicator />}
                </Animated.ScrollView>

                {/* Bottom Input Container */}
                <View className="bg-[#FDFBF7] border-t border-sand-200">
                    {/* Suggestion Chips - Collapsible */}
                    <Animated.View
                        style={{
                            height: suggestionsHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 70],
                            }),
                            opacity: suggestionsHeight,
                            overflow: 'hidden',
                        }}
                    >
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="py-3 pl-4"
                            contentContainerStyle={{ paddingRight: 16 }}
                        >
                            {suggestions.map((chip) => (
                                <TouchableOpacity
                                    key={chip.id}
                                    onPress={() => {
                                        handleSend(chip.text);
                                        Keyboard.dismiss();
                                    }}
                                    disabled={isTyping}
                                    className="flex-row items-center bg-card border-2 border-sand-200 rounded-full px-4 py-2 mr-3"
                                    style={{ opacity: isTyping ? 0.5 : 1 }}
                                >
                                    {chip.icon}
                                    <Text className="ml-2 text-sm font-medium text-muted-foreground">{chip.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Input Field - Always Visible */}
                    <View className="px-4 py-3 flex-row items-center">
                        <View className="flex-1 bg-white rounded-full px-4 py-3 shadow-sm flex-row items-center mr-3" style={{ borderColor: '#4A6741', borderWidth: 1 }}>
                            <TextInput
                                className="flex-1 text-base"
                                style={{
                                    color: '#4A6741',
                                    minHeight: 24,
                                    maxHeight: 100,
                                    paddingTop: Platform.OS === 'ios' ? 2 : 0,
                                    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
                                }}
                                placeholder="Ask for guidance..."
                                placeholderTextColor="hsl(40 5% 55%)"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    handleSend(inputText);
                                    Keyboard.dismiss();
                                }}
                                blurOnSubmit
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                handleSend(inputText);
                                Keyboard.dismiss();
                            }}
                            disabled={!inputText.trim()}
                            className="w-12 h-12 bg-white border rounded-full items-center justify-center shadow-md"
                            style={{
                                borderColor: inputText.trim() ? '#4A6741' : '#E2E8F0',
                                opacity: inputText.trim() ? 1 : 0.5,
                            }}
                        >
                            <Send size={20} color={inputText.trim() ? '#4A6741' : '#CBD5E0'} />
                        </TouchableOpacity>
                    </View>

                    {/* Disclaimer - Collapsible */}
                    <Animated.View
                        style={{
                            opacity: disclaimerOpacity,
                            transform: [{
                                translateY: disclaimerOpacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                }),
                            }],
                        }}
                    >
                        <View className="pb-3 px-6 items-center">
                            <Text className="text-[10px] text-sand-400 text-center leading-4">
                                Guidance supported by scholarly sources — Verify with your group's scholars whenever needed.
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
