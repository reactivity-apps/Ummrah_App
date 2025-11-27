import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import Animated from "react-native-reanimated";
import { GUIDES } from "../../data/mock";
import {
    ArrowLeft,
    CheckCircle2,
    BookOpen,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    ArrowRight,
    Sparkles
} from "lucide-react-native";
import { useFadeIn } from "../../lib/sharedElementTransitions";
import { DetailSkeleton } from "../../components/SkeletonLoader";
import Svg, { Path, Circle as SvgCircle } from "react-native-svg";

// Crescent Icon Component
const CrescentIcon = ({ size = 16, color = "#C5A059" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill={color}
        />
    </Svg>
);

export default function GuideDetailScreen() {
    const { id } = useLocalSearchParams();
    const guide = GUIDES.find(g => g.id === id);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0])); // First step expanded by default

    // Smooth entrance animations
    const heroStyle = useFadeIn(0);
    const contentStyle = useFadeIn(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const toggleStep = (index: number) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const currentStepIndex = GUIDES.findIndex(g => g.id === id);
    const nextGuide = currentStepIndex < GUIDES.length - 1 ? GUIDES[currentStepIndex + 1] : null;

    if (!guide) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50 items-center justify-center">
                <Text className="text-muted-foreground">Guide not found</Text>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-sand-50">
                <DetailSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-sand-50">
            {/* Header with Progress */}
            <View className="px-4 py-3 bg-card border-b border-sand-200">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/guide')} className="mr-3 p-2 -ml-2" activeOpacity={0.7}>
                        <ArrowLeft size={24} color="#4A6741" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
                                Step {currentStepIndex + 1} of {GUIDES.length}
                            </Text>
                            <CrescentIcon size={12} />
                        </View>
                        <Text className="text-xl font-bold text-foreground">{guide.title}</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="bg-sand-100 h-1.5 rounded-full overflow-hidden">
                    <View
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${((currentStepIndex + 1) / GUIDES.length) * 100}%` }}
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Hero Section with Icon */}
                <Animated.View style={heroStyle} className="px-4 pt-6">
                    <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 items-center border border-primary/20">
                        <View className="w-20 h-20 bg-white/80 rounded-full items-center justify-center mb-4 shadow-sm">
                            <BookOpen size={40} color="#4A6741" />
                        </View>
                        <Text className="text-2xl font-bold text-foreground text-center mb-2">{guide.title}</Text>
                        <Text className="text-base text-muted-foreground text-center leading-relaxed">{guide.description}</Text>
                    </View>
                </Animated.View>

                <Animated.View style={contentStyle} className="px-4">
                    {/* Status Badge */}
                    <View className="mt-6 mb-6">
                        <View className={`self-start px-4 py-2.5 rounded-full border shadow-sm ${guide.status === 'completed'
                                ? 'bg-emerald-50 border-emerald-200'
                                : guide.status === 'current'
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-sand-100 border-sand-200'
                            }`}>
                            <Text className={`font-bold text-sm ${guide.status === 'completed'
                                    ? 'text-emerald-700'
                                    : guide.status === 'current'
                                        ? 'text-amber-700'
                                        : 'text-muted-foreground'
                                }`}>
                                {guide.status === 'completed' ? '✓ Completed' : guide.status === 'current' ? '● In Progress' : '○ Upcoming'}
                            </Text>
                        </View>
                    </View>

                    {/* Spiritual Context */}
                    <View className="bg-[#FFFBF5] rounded-xl p-4 mb-6 border border-[#C5A059]/20">
                        <View className="flex-row items-center mb-2">
                            <Sparkles size={16} color="#C5A059" />
                            <Text className="text-sm font-bold text-[#8B7355] ml-2 uppercase tracking-wide">
                                Spiritual Significance
                            </Text>
                        </View>
                        <Text className="text-sm text-foreground/70 leading-relaxed italic">
                            {guide.title === 'Ihram' &&
                                "Entering the state of Ihram symbolizes purity and equality before Allah. All pilgrims wear simple garments, removing distinctions of wealth and status, reminding us that we stand as equals in the sight of our Creator."}
                            {guide.title === 'Tawaf' &&
                                "Tawaf represents the believer's devotion and the unity of the Ummah. As you circle the House of Allah, you join millions who have done so throughout history, all turning toward the same center in worship."}
                            {guide.title === "Sa'i" &&
                                "Sa'i commemorates Hajar's desperate search for water for her son Ismail. Her trust in Allah was rewarded with the miraculous spring of Zamzam, teaching us perseverance and reliance on Allah in times of hardship."}
                            {guide.title === 'Halq or Taqsir' &&
                                "Cutting the hair symbolizes humility and the completion of your spiritual journey. It marks your exit from the sacred state, having fulfilled your obligations with sincerity and devotion."}
                        </Text>
                    </View>

                    {/* Detailed Steps */}
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-foreground mb-4">How to Perform</Text>

                        {guide.steps.map((step, index) => {
                            const isExpanded = expandedSteps.has(index);

                            return (
                                <View key={index} className="mb-3">
                                    <TouchableOpacity
                                        onPress={() => toggleStep(index)}
                                        activeOpacity={0.7}
                                        className={`bg-card rounded-xl border shadow-sm ${isExpanded ? 'border-primary/30' : 'border-sand-200'
                                            }`}
                                    >
                                        {/* Step Header */}
                                        <View className="p-4">
                                            <View className="flex-row items-start">
                                                <View className="h-9 w-9 bg-primary/10 rounded-full items-center justify-center mr-3 mt-0.5 border border-primary/20">
                                                    <Text className="text-primary font-bold text-base">{index + 1}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-foreground mb-1">
                                                        {step.title}
                                                    </Text>
                                                    <Text className="text-sm text-muted-foreground leading-relaxed">
                                                        {step.description}
                                                    </Text>
                                                </View>
                                                <View className="ml-2 mt-1">
                                                    {isExpanded ? (
                                                        <ChevronUp size={20} color="#9CA3AF" />
                                                    ) : (
                                                        <ChevronDown size={20} color="#9CA3AF" />
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <View className="px-4 pb-4">
                                                <View className="border-t border-sand-100 pt-4">
                                                    {/* Why This Matters */}
                                                    <View className="bg-[#FFFBF5] p-3 rounded-lg mb-3 border border-sand-100">
                                                        <Text className="text-xs font-semibold text-[#8B7355] mb-1.5 uppercase tracking-wide">
                                                            Why This Step
                                                        </Text>
                                                        <Text className="text-sm text-foreground/70 leading-relaxed italic">
                                                            {step.details}
                                                        </Text>
                                                    </View>

                                                    {/* Actionable Instructions */}
                                                    <View className="mb-3">
                                                        <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                                            Instructions
                                                        </Text>
                                                        <View className="space-y-2">
                                                            {step.description.split('.').filter(s => s.trim()).map((instruction, i) => (
                                                                <View key={i} className="flex-row items-start">
                                                                    <Text className="text-primary font-bold mr-2">•</Text>
                                                                    <Text className="text-sm text-foreground leading-relaxed flex-1">
                                                                        {instruction.trim()}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </View>

                                                    {/* Dua Section (conditional based on step) */}
                                                    {(step.title.includes('Talbiyah') || step.title.includes('Niyyah')) && (
                                                        <View className="bg-white p-3 rounded-lg border border-primary/20">
                                                            <Text className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                                                                Dua to Recite
                                                            </Text>
                                                            <Text className="text-right text-lg leading-loose mb-2" style={{ fontFamily: 'System' }}>
                                                                لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
                                                            </Text>
                                                            <Text className="text-xs text-muted-foreground italic">
                                                                "Labbayk Allahumma Labbayk" - Here I am, O Allah, here I am
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    {/* Common Mistakes Section */}
                    <View className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
                        <View className="flex-row items-center mb-3">
                            <AlertCircle size={18} color="#EF4444" />
                            <Text className="text-sm font-bold text-red-900 ml-2 uppercase tracking-wide">
                                Common Mistakes to Avoid
                            </Text>
                        </View>
                        <View className="space-y-2">
                            {guide.title === 'Ihram' && (
                                <>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Don't wear sewn garments for men after entering Ihram</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Avoid using scented products after intention</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Don't cut hair or nails while in Ihram state</Text>
                                </>
                            )}
                            {guide.title === 'Tawaf' && (
                                <>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Keep the Kaaba on your left at all times</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Complete all 7 circuits without shortcuts</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Pray the 2 rakats soon after completing Tawaf</Text>
                                </>
                            )}
                            {guide.title === "Sa'i" && (
                                <>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Ensure you complete all 7 laps (Safa to Marwa = 1)</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Men should jog only between the green markers</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Begin at Safa, end at Marwa</Text>
                                </>
                            )}
                            {guide.title === 'Halq or Taqsir' && (
                                <>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Cut from all areas of the head, not just one spot</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Women should not shave, only trim</Text>
                                    <Text className="text-sm text-red-900/80 leading-relaxed">• Ensure sufficient length is cut (at least fingertip)</Text>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        {guide.status === 'current' && (
                            <TouchableOpacity className="bg-primary p-4 rounded-xl flex-row items-center justify-center shadow-sm">
                                <CheckCircle2 size={20} color="white" />
                                <Text className="text-white font-bold ml-2 text-base">Mark as Complete</Text>
                            </TouchableOpacity>
                        )}

                        {nextGuide && guide.status === 'completed' && (
                            <TouchableOpacity
                                onPress={() => router.push(`/guide/${nextGuide.id}`)}
                                className="bg-card border-2 border-primary p-4 rounded-xl flex-row items-center justify-center"
                            >
                                <Text className="text-primary font-bold mr-2 text-base">Continue to {nextGuide.title}</Text>
                                <ArrowRight size={20} color="#4A6741" />
                            </TouchableOpacity>
                        )}

                        {guide.status === 'upcoming' && (
                            <View className="bg-sand-100 p-4 rounded-xl border border-sand-200">
                                <Text className="text-center text-muted-foreground font-medium">
                                    Complete previous steps to unlock this section
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
