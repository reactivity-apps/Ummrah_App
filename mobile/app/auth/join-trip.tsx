import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, Link } from "expo-router";
import GroupCodeStep from './join-trip-steps/GroupCodeStep';
import NameStep from './join-trip-steps/NameStep';
import EmailPasswordStep from './join-trip-steps/EmailPasswordStep';
import AccountCreatedStep from "./join-trip-steps/AccountCreatedStep";
import { contentContainerConfig } from "../../lib/navigationConfig";
import DebugInfo from "../../components/DebugInfo";
import { getRedirectUrl } from "../../lib/utils";

export default function JoinTripScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); 
    const [name, setName] = useState('');
    // const [areaCode, setAreaCode] = useState('1');
    // const [phoneNumber, setPhoneNumber] = useState('');
    const [groupCodeText, setGroupCodeText] = useState('');
    const [activeJoinCodeId, setActiveJoinCodeId] = useState<string | null>(null);
    const [joinCodeClaimed, setJoinCodeClaimed] = useState(false);
    const [email, setEmail] = useState('');
    const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null);


    // New email-based signup flow
    // - If called with creds (email/password) it will perform signUp and store
    //   pending join data in user metadata for post-verification processing
    const handleSignUp = async (
        setError: (m: string | null) => void,
        setLoading: (b: boolean) => void,
        creds?: { email?: string; password?: string }
    ) => {
        setError(null);

        if (!activeJoinCodeId) {
            setError('Missing join code. Please restart the flow.');
            return;
        }

        try {
            setLoading(true);

            if (creds?.email && creds?.password) {
                // First, get the trip_id from the join code
                const { data: joinCodeData, error: joinCodeError } = await supabase
                    .from('trip_join_codes')
                    .select('trip_id')
                    .eq('id', activeJoinCodeId)
                    .single();

                if (joinCodeError || !joinCodeData) {
                    console.error('Unable to fetch join code data', joinCodeError);
                    setError('Invalid join code. Please try again.');
                    return;
                }

                console.log(getRedirectUrl())

                // Sign up with pending join data stored in metadata
                const { data: signData, error: signError } = await supabase.auth.signUp({
                    email: creds.email.trim(),
                    password: creds.password,
                    options: { 
                        data: { 
                            name: name.trim(),
                            full_name: name.trim(),
                            pending_join: {
                                trip_id: joinCodeData.trip_id,
                                join_code_id: activeJoinCodeId,
                            }
                        },
                        emailRedirectTo: getRedirectUrl(),
                    },
                });

                if (signError) {
                    console.error('Error signing up user', signError);
                    setError(signError.message || 'Unable to create account with that email. Please try again.');
                    return;
                }

                const newUser = (signData as any)?.user;
                if (newUser && newUser.id) {
                    setSignedUpUserId(newUser.id);
                }

                // Store email
                setEmail(creds.email.trim());
                
                // Move to verification step
                setStep(4);
                return;
            }
            
        } catch (error: any) {
            console.error('handleSignUp exception', error);
            setError(error?.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={contentContainerConfig}
                    keyboardShouldPersistTaps="handled"
                >
                    <View>
                        <DebugInfo />
                        {/*
                            Old multi-step flow (commented out):
                            1: GroupCodeStep -> 2: PhoneStep -> 3: OtpStep -> 4: NameStep
                        */}

                        {/* New flow: 1: GroupCodeStep -> 2: NameStep -> 3: EmailPasswordStep -> 4: AccountCreatedStep */}
                        {step === 1 ? (
                            <GroupCodeStep
                                setGroupCodeText={setGroupCodeText}
                                setActiveJoinCodeId={setActiveJoinCodeId}
                                setJoinCodeClaimed={setJoinCodeClaimed}
                                setStep={setStep}
                            />
                        ) : step === 2 ? (
                             <NameStep
                                name={name}
                                setName={setName}
                                setStep={setStep}
                                groupCodeText={groupCodeText}
                            />
                        ) : step === 3 ? (
                            <EmailPasswordStep
                                onEmailEntered={(e) => setEmail(e)}
                                setStep={setStep}
                                handleSignUp={handleSignUp}
                                groupCodeText={groupCodeText}
                            />
                          
                        ) : (
                            <AccountCreatedStep email={email} />
                        )}

                        {/* Already have account / Footer */}
                        {step !== 4 && <View className="items-center mt-6">
                            <Text className="text-sm text-muted-foreground">Already have an account?{' '}
                                <Link href="/auth/login" className="text-primary font-medium">Log in</Link>
                            </Text>
                        </View>}

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
