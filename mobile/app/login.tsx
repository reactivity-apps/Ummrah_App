import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { LogIn, User, Phone, Hash, ArrowRight, ChevronLeft } from "lucide-react-native";

export default function LoginScreen() {
    const router = useRouter();
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [step, setStep] = useState(1); // 1: group code, 2: personal info
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [groupCode, setGroupCode] = useState<string[]>(Array(10).fill(''));

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...groupCode];
        newCode[index] = text.toUpperCase();
        setGroupCode(newCode);

        // Auto-focus next input if text entered
        if (text && index < 9) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !groupCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyGroupCode = () => {
        // TODO: Verify group code with Supabase
        const code = groupCode.join('');
        console.log('Verifying group code:', code);
        // Move to next step
        setStep(2);
    };

    const handleJoinGroup = () => {
        // TODO: Connect to Supabase auth
        const code = groupCode.join('');
        console.log('Join Group:', { name, phone, groupCode: code });
        // Navigate to main app
        router.replace('/(tabs)');
    };

    const handleBack = () => {
        setStep(1);
    };

    const isStep1Valid = groupCode.join('').trim().length >= 6;
    const isStep2Valid = name.trim() !== '' && phone.trim() !== '';

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-6 py-8">
                        {step === 1 ? (
                            // Step 1: Group Code
                            <>
                                {/* Header */}
                                <View className="items-center mb-12 mt-8">
                                    <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                                        <Hash size={40} color="hsl(140 40% 45%)" />
                                    </View>
                                    <Text className="text-3xl font-bold text-foreground mb-2">
                                        Enter Group Code
                                    </Text>
                                    <Text className="text-muted-foreground text-center">
                                        Enter the code shared by your group leader
                                    </Text>
                                </View>

                                {/* Form */}
                                <View className="items-center space-y-4">
                                    {/* Group Code */}
                                    <View className="mb-4 w-full items-center">
                                        <View className="flex-row justify-center gap-3">
                                            {groupCode.map((char, index) => (
                                                <View
                                                    key={index}
                                                    className="w-10 h-14 bg-card rounded-lg border-2 items-center justify-center"
                                                    style={{
                                                        borderColor: char ? 'hsl(140 40% 45%)' : 'hsl(40 15% 85%)'
                                                    }}
                                                >
                                                    <TextInput
                                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                                        value={char}
                                                        onChangeText={(text) => handleCodeChange(text, index)}
                                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                                        className="w-full h-full text-center text-foreground font-bold text-xl"
                                                        maxLength={1}
                                                        autoCapitalize="characters"
                                                        keyboardType="default"
                                                        autoFocus={index === 0}
                                                        selectTextOnFocus
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                        <Text className="text-center text-muted-foreground text-sm mt-4">
                                            Enter your group code
                                        </Text>
                                    </View>

                                    {/* Continue Button */}
                                    <TouchableOpacity
                                        onPress={handleVerifyGroupCode}
                                        disabled={!isStep1Valid}
                                        className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${isStep1Valid ? 'bg-primary' : 'bg-sand-200'
                                            }`}
                                    >
                                        <Text className={`font-bold text-base mr-2 ${isStep1Valid ? 'text-primary-foreground' : 'text-muted-foreground'
                                            }`}>
                                            Continue
                                        </Text>
                                        <ArrowRight
                                            size={20}
                                            color={isStep1Valid ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"}
                                        />
                                    </TouchableOpacity>

                                    {/* Help Text */}
                                    <View className="bg-sand-50 rounded-xl p-4 border border-sand-200 mt-8">
                                        <Text className="text-sm font-semibold text-foreground mb-2">Don't have a group code?</Text>
                                        <Text className="text-sm text-muted-foreground">
                                            Contact your group leader or tour organizer to get your unique group code.
                                        </Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            // Step 2: Personal Info
                            <>
                                {/* Back Button */}
                                <TouchableOpacity
                                    onPress={handleBack}
                                    className="flex-row items-center mb-4"
                                >
                                    <ChevronLeft size={24} color="hsl(140 40% 45%)" />
                                    <Text className="text-primary font-medium ml-1">Back</Text>
                                </TouchableOpacity>

                                {/* Header */}
                                <View className="items-center mb-12 mt-4">
                                    <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                                        <User size={40} color="hsl(140 40% 45%)" />
                                    </View>
                                    <Text className="text-3xl font-bold text-foreground mb-2">
                                        Your Details
                                    </Text>
                                    <Text className="text-muted-foreground text-center">
                                        Tell us about yourself
                                    </Text>
                                    <View className="bg-primary/10 px-4 py-2 rounded-full mt-3">
                                        <Text className="text-primary font-semibold">
                                            Group: {groupCode.join('')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Form */}
                                <View className="space-y-4">
                                    {/* Name */}
                                    <View className="mb-4">
                                        <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
                                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                                            <User size={20} color="hsl(40 5% 55%)" />
                                            <TextInput
                                                placeholder="Ahmed Hassan"
                                                placeholderTextColor="hsl(40 5% 55%)"
                                                value={name}
                                                onChangeText={setName}
                                                className="ml-3 flex-1 text-foreground"
                                                autoCapitalize="words"
                                                autoFocus
                                            />
                                        </View>
                                    </View>

                                    {/* Phone Number */}
                                    <View className="mb-4">
                                        <Text className="text-sm font-medium text-foreground mb-2">Phone Number</Text>
                                        <View className="flex-row items-center bg-card rounded-xl px-4 py-3 border border-sand-200">
                                            <Phone size={20} color="hsl(40 5% 55%)" />
                                            <TextInput
                                                placeholder="+1 (555) 123-4567"
                                                placeholderTextColor="hsl(40 5% 55%)"
                                                value={phone}
                                                onChangeText={setPhone}
                                                className="ml-3 flex-1 text-foreground"
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>

                                    {/* Submit Button */}
                                    <TouchableOpacity
                                        onPress={handleJoinGroup}
                                        disabled={!isStep2Valid}
                                        className={`rounded-xl p-4 items-center mt-6 ${isStep2Valid ? 'bg-primary' : 'bg-sand-200'
                                            }`}
                                    >
                                        <Text className={`font-bold text-base ${isStep2Valid ? 'text-primary-foreground' : 'text-muted-foreground'
                                            }`}>
                                            Join Group
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Footer */}
                        <View className="mt-auto pt-8">
                            <Text className="text-center text-xs text-muted-foreground">
                                By continuing, you agree to our{'\n'}
                                <Text className="text-primary">Terms of Service</Text> and{' '}
                                <Text className="text-primary">Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
