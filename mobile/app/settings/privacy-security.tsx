import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Lock, Eye } from "lucide-react-native";

export default function PrivacySecurityScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Privacy Features */}
                <View className="px-5 mt-6">
                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        Data Protection
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 mb-4">
                        {/* Encryption */}
                        <View className="p-4 border-b border-sand-100">
                            <View className="flex-row items-start">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Lock size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">
                                        End-to-End Encryption
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed">
                                        Your personal information, trip details, and communications are encrypted both in transit and at rest using industry-standard protocols.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Data Access */}
                        <View className="p-4">
                            <View className="flex-row items-start">
                                <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Eye size={20} color="#4A6741" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold mb-1">
                                        Limited Data Access
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed">
                                        Only you and authorized trip organizers can access your information. We implement strict access controls and audit logs.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                        What We Collect
                    </Text>

                    <View className="bg-card rounded-xl border border-sand-200 p-4 mb-6">
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            • Personal information (name, email, phone number)
                            {'\n'}• Emergency contact details
                            {'\n'}• Trip participation and history
                            {'\n'}• Location data (only when using trip features)
                            {'\n'}• App usage analytics (anonymized)
                            {'\n\n'}
                            <Text className="font-semibold text-foreground">We do not collect:</Text>
                            {'\n'}• Payment card information (processed by secure payment providers)
                            {'\n'}• Biometric data
                            {'\n'}• Contacts or other device data
                        </Text>
                    </View>
                </View>

                {/* Footer Info */}
                <View className="px-5 mt-8">
                    <View className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                        <Text className="text-xs text-muted-foreground leading-relaxed">
                            For more information about how we handle your data, please review our Privacy Policy and Terms of Service. If you have questions or concerns, contact us at privacy@ummrahapp.com
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
