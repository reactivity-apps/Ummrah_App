import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, BookOpen, MapPin, Moon, Info, ChevronRight, ArrowLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useFadeIn } from '../../lib/sharedElementTransitions';

// --- Constants & Theme ---
const COLORS = {
    primary: '#4A6741', // Muted Green
    secondary: '#8C9E84', // Lighter Green
    gold: '#C5A059', // Soft Gold
    ivory: '#FDFBF7', // Background
    white: '#FFFFFF',
    text: '#2D3748',
    textLight: '#718096',
    border: '#E2E8F0',
};

// --- Types ---
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface Suggestion {
    id: string;
    text: string;
    icon: React.ReactNode;
}

// --- Components ---

// 1. Geometric Pattern SVG (Simplified 8-point star motif)
const GeometricPattern = ({ size = 100, color = COLORS.gold, opacity = 0.1 }: { size?: number, color?: string, opacity?: number }) => (
    <Svg height={size} width={size} viewBox="0 0 100 100" style={{ position: 'absolute', opacity }}>
        <G stroke={color} strokeWidth="1" fill="none">
            <Path d="M50 0 L61 35 L97 35 L68 57 L79 91 L50 70 L21 91 L32 57 L3 35 L39 35 Z" />
            <Circle cx="50" cy="50" r="45" />
            <Circle cx="50" cy="50" r="35" />
        </G>
    </Svg>
);

// 2. Typing Indicator with Pulsing Light
const TypingIndicator = () => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className="flex-row items-center space-x-2 p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-sand-100 self-start mt-2">
            <Animated.View style={[animatedStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }]} />
            <Animated.View style={[animatedStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, transform: [{ scale: 0.8 }] }]} />
            <Animated.View style={[animatedStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, transform: [{ scale: 0.6 }] }]} />
            <Text className="text-xs text-sand-400 ml-2 font-medium">Murshid is reflecting...</Text>
        </View>
    );
};

// 3. Message Components
const MessageItem = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <Animated.View
                entering={FadeInUp.duration(300)}
                className="self-end rounded-2xl rounded-tr-none px-5 py-3.5 max-w-[85%] my-2"
                style={{ backgroundColor: '#4A6741' }}
            >
                <Text className="text-white text-base leading-6">{message.content}</Text>
            </Animated.View>
        );
    }

    // Murshid Message (Guidance Card)
    return (
        <Animated.View entering={FadeIn.duration(500)} className="self-start bg-white rounded-2xl rounded-tl-none max-w-[90%] my-3 shadow-sm border border-sand-100 overflow-hidden">
            {/* Decorative Top Border */}
            <View className="h-1 w-full bg-sand-100" />

            <View className="p-5">
                {/* Content */}
                {message.content.split('\n').map((paragraph: string, idx: number) => {
                    // Check for Arabic text (simple heuristic)
                    const isArabic = /[\u0600-\u06FF]/.test(paragraph);

                    if (isArabic) {
                        return (
                            <Text key={idx} className="text-right text-2xl text-sand-800 leading-10 mb-4 font-medium" style={{ fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif' }}>
                                {paragraph}
                            </Text>
                        );
                    }

                    // Check for dividers
                    if (paragraph.trim() === '---') {
                        return <View key={idx} className="h-[1px] bg-sand-200 my-3 w-1/2 self-center" />;
                    }

                    return (
                        <Text key={idx} className="text-sand-700 text-base leading-7 mb-2">
                            {paragraph}
                        </Text>
                    );
                })}
            </View>

            {/* Footer / Filigree */}
            <View className="bg-sand-50 px-4 py-2 flex-row justify-between items-center border-t border-sand-100">
                <View className="flex-row items-center">
                    <Sparkles size={12} color={COLORS.gold} />
                    <Text className="text-[10px] text-sand-400 uppercase tracking-widest ml-2">Guidance</Text>
                </View>
                <View className="opacity-20">
                    <GeometricPattern size={20} color={COLORS.primary} />
                </View>
            </View>
        </Animated.View>
    );
};

// --- Main Screen ---
export default function MurshidScreen() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "As-salamu alaykum. I am Murshid, your companion for this sacred journey.\n\nHow may I assist your heart and mind today?"
        }
    ]);

    // Smooth entrance animation
    const contentFadeStyle = useFadeIn(0);

    const scrollViewRef = useRef<any>(null);

    const suggestions: Suggestion[] = [
        { id: '1', text: "Teach me the Ihram steps", icon: <BookOpen size={14} color="#4A6741" /> },
        { id: '2', text: "What dua in Tawaf?", icon: <Moon size={14} color="#4A6741" /> },
        { id: '3', text: "Etiquette in Masjid al-Haram", icon: <Sparkles size={14} color="#4A6741" /> },
        { id: '4', text: "Historical ziyarat in Madinah", icon: <MapPin size={14} color="#4A6741" /> },
    ];

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Mock Response Logic
        setTimeout(() => {
            let responseContent = "I am here to guide you. Please consult with your group scholars for specific rulings.";

            if (text.toLowerCase().includes('dua') || text.toLowerCase().includes('tawaf')) {
                responseContent = "Here is a beautiful supplication for your Tawaf:\n\n---\n\nرَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ\n\n---\n\n\"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.\"\n\nRecite this with presence of heart between the Yemeni Corner and the Black Stone.";
            } else if (text.toLowerCase().includes('ihram')) {
                responseContent = "Entering the state of Ihram involves both physical and spiritual preparation.\n\n1. Perform Ghusl (ritual bath).\n2. Wear the two white sheets (for men).\n3. Pray two rakat Nafl.\n4. Make the Niyyah (intention) and recite the Talbiyah:\n\nلَبَّيْكَ اللَّهُمَّ لَبَّيْكَ\n\nMay Allah accept your intention.";
            }

            const murshidMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent };
            setMessages(prev => [...prev, murshidMsg]);
            setIsTyping(false);
        }, 2000);
    };

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View className="items-center pt-4 pb-6 bg-[#FDFBF7] border-b border-sand-100 z-10 shadow-sm">
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="absolute left-4 top-4 p-2 -ml-2 z-20"
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>

                    <View className="relative">
                        {/* Halo/Glow */}
                        <View className="absolute -inset-1 bg-green-100 rounded-full opacity-50 blur-sm" />

                        {/* Avatar Container */}
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-2 border-[#E2E8F0] overflow-hidden relative shadow-sm">
                            {/* Background Pattern */}
                            <View className="absolute inset-0 opacity-10">
                                <GeometricPattern size={80} color={COLORS.primary} />
                            </View>

                            {/* Avatar Icon/Image */}
                            <View className="bg-[#4A6741] w-16 h-16 rounded-full items-center justify-center">
                                <Text className="text-white text-2xl font-serif">M</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-3 items-center">
                        <Text className="text-xl font-semibold text-sand-800 tracking-wide">Murshid</Text>
                        <Text className="text-lg text-[#C5A059] font-medium -mt-1" style={{ fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif' }}>مرشد</Text>
                    </View>
                </View>

                {/* Chat Area */}
                <Animated.ScrollView
                    style={contentFadeStyle}
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                >
                    {messages.map((msg) => (
                        <MessageItem key={msg.id} message={msg} />
                    ))}

                    {isTyping && <TypingIndicator />}
                </Animated.ScrollView>

                {/* Suggestions & Input */}
                <View className="bg-[#FDFBF7] pb-4">
                    {/* Suggestion Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 pl-4 mb-2">
                        {suggestions.map((chip) => (
                            <TouchableOpacity
                                key={chip.id}
                                onPress={() => handleSend(chip.text)}
                                className="flex-row items-center bg-white border rounded-full px-4 py-2 mr-3 shadow-sm"
                                style={{ borderColor: '#4A6741' }}
                            >
                                {chip.icon}
                                <Text style={{ color: '#4A6741' }} className="ml-2 text-sm font-medium">{chip.text}</Text>
                            </TouchableOpacity>
                        ))}
                        <View className="w-4" />
                    </ScrollView>

                    {/* Input Field */}
                    <View className="px-4 flex-row items-center space-x-3">
                        <View className="flex-1 bg-white rounded-full px-4 py-3 shadow-sm flex-row items-center" style={{ borderColor: '#4A6741', borderWidth: 1 }}>
                            <TextInput
                                className="flex-1 text-base h-6" // Fixed height for alignment
                                style={{ color: '#4A6741' }}
                                placeholder="Ask for guidance..."
                                placeholderTextColor="#A0AEC0"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline={false}
                                returnKeyType="send"
                                onSubmitEditing={() => handleSend(inputText)}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => handleSend(inputText)}
                            className="w-12 h-12 bg-white border border-[#4A6741] rounded-full items-center justify-center shadow-md"
                        >
                            <Send size={20} color="#4A6741" />
                        </TouchableOpacity>
                    </View>

                    {/* Disclaimer */}
                    <View className="mt-4 px-6 items-center">
                        <Text className="text-[10px] text-sand-400 text-center leading-4">
                            Guidance supported by scholarly sources — Verify with your group’s scholars whenever needed.
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
