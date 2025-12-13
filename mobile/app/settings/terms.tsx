import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Last Updated */}
                <View className="mb-6">
                    <Text className="text-xs text-muted-foreground">
                        Last updated: December 13, 2025
                    </Text>
                </View>

                {/* Introduction */}
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-foreground mb-4">Terms of Service</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            Welcome to Ummrah App. By accessing or using our application, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
                        </Text>
                    </View>
                </View>

                {/* Acceptance of Terms */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">1. Acceptance of Terms</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            By creating an account and using Ummrah App, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our application.
                        </Text>
                    </View>
                </View>

                {/* Use of Service */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">2. Use of Service</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed mb-3">
                            Ummrah App is designed to assist users in planning and managing their Umrah pilgrimage. You agree to use the service only for lawful purposes and in accordance with these terms.
                        </Text>
                        <Text className="text-foreground leading-relaxed">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </Text>
                    </View>
                </View>

                {/* User Responsibilities */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">3. User Responsibilities</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed mb-2">You agree not to:</Text>
                        <Text className="text-foreground leading-relaxed ml-4">
                            • Use the app for any illegal or unauthorized purpose{'\n'}
                            • Violate any laws in your jurisdiction{'\n'}
                            • Interfere with or disrupt the service or servers{'\n'}
                            • Attempt to gain unauthorized access to any portion of the app{'\n'}
                            • Share false or misleading information
                        </Text>
                    </View>
                </View>

                {/* Content and Intellectual Property */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">4. Intellectual Property</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            All content, features, and functionality of Ummrah App are owned by us and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any content from the app without our prior written consent.
                        </Text>
                    </View>
                </View>

                {/* Limitation of Liability */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">5. Limitation of Liability</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            Ummrah App is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                        </Text>
                    </View>
                </View>

                {/* Changes to Terms */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">6. Changes to Terms</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new terms within the app. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.
                        </Text>
                    </View>
                </View>

                {/* Termination */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">7. Termination</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                        </Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-foreground mb-3">8. Contact Us</Text>
                    <View className="bg-card p-4 rounded-xl border border-sand-200">
                        <Text className="text-foreground leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us through the app support section or at support@ummrahapp.com
                        </Text>
                    </View>
                </View>

                {/* Footer Note */}
                <View className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <Text className="text-xs text-muted-foreground text-center leading-relaxed">
                        These terms constitute a legally binding agreement between you and Ummrah App. By continuing to use our services, you acknowledge that you have read and understood these terms.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
