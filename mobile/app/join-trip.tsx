import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter, Link } from "expo-router";
import GroupCodeStep from './components/auth/GroupCodeStep';
import NameStep from './components/auth/NameStep';
import EmailPasswordStep from './components/auth/EmailPasswordStep';
import AccountCreatedStep from "./components/auth/AccountCreatedStep";
import { contentContainerConfig } from "../lib/navigationConfig";

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
    // - If called with creds (email/password) it will perform signUp and profile upsert
    //   and store the created user id in `signedUpUserId` so the finalization can
    //   be performed later (from NameStep).
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

            // If credentials are provided, perform signup and then show the
            // account-created / verify-email step. We intentionally do NOT create
            // a profile here; the user must verify their email first and then
            // we can finalize membership when they are authenticated.
            if (creds?.email && creds?.password) {
                const { data: signData, error: signError } = await supabase.auth.signUp({
                    email: creds.email.trim(),
                    password: creds.password,
                    options: { 
                        data: { 
                            name: name.trim(),
                            full_name: name.trim()
                        } 
                    },
                });

                if (signError) {
                    console.error('Error signing up user', signError);
                    setError(signError.message || 'Unable to create account with that email. Please try again.');
                    setLoading(false);
                    return;
                }

                const newUser = (signData as any)?.user;
                if (newUser && newUser.id) {
                    setSignedUpUserId(newUser.id);
                }

                // store email and immediately finalize the join (no verification step)
                const providedEmail = creds.email.trim();
                setEmail(providedEmail);

                // Call finalizeJoin directly so the profile is created and membership added
                // pass providedEmail to ensure the upsert includes it immediately
                // Track if finalization succeeds
                let finalizationSucceeded = false;
                
                try {
                    await finalizeJoin(setError, setLoading, providedEmail);
                    finalizationSucceeded = true;
                } catch (finalizeError: any) {
                    console.error('Finalization failed', finalizeError);
                    // Sign out the user since we couldn't complete the process
                    await supabase.auth.signOut();
                    setError(finalizeError?.message || 'Failed to complete signup. Please try again.');
                    return;
                }
                
                // Only move to success step if finalization succeeded
                if (finalizationSucceeded) {
                    setStep(4);
                }
                return;
            }
        } catch (error: any) {
            console.error('handleSignUp exception', error);
            setError(error?.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // finalizeJoin
   
    const finalizeJoin = async (setError: (m: string | null) => void, setLoading: (b: boolean) => void, emailArg?: string) => {
        setError(null);
        if (!activeJoinCodeId) {
            const errorMsg = 'Missing join code. Please restart the flow.';
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            setLoading(true);

            // Determine final user id: prefer the id created during signup, else use current session
            let userId = signedUpUserId;
            if (!userId) {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData?.user) {
                    console.error('No authenticated user for finalization', userError);
                    const errorMsg = 'Please sign in or verify your email first.';
                    setError(errorMsg);
                    throw new Error(errorMsg);
                }
                userId = userData.user.id;
            }

            // Update auth user metadata with chosen name (best-effort)
            try {
                await supabase.auth.updateUser({ data: { name: name.trim(), full_name: name.trim() } });
            } catch (e) {
                console.warn('Unable to update auth user metadata', e);
            }

            // Check if profile already exists (might be created by trigger)
            const { data: existingProfile, error: checkError } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();

            // Create or update profile with auth_role as null and updated_at set to now
            if (existingProfile) {
                // Profile exists, just update it
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        auth_role: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);

                if (updateError) {
                    console.error('Profile update error', updateError);
                    const errorMsg = 'Unable to update profile. Please try again.';
                    setError(errorMsg);
                    throw new Error(errorMsg);
                }
            } else {
                // Profile doesn't exist, create it
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: userId,
                        auth_role: null,
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) {
                    console.error('Profile insert error', profileError);
                    const errorMsg = 'Unable to create profile. Please try again.';
                    setError(errorMsg);
                    throw new Error(errorMsg);
                }
            }

            // Fetch join code row to get trip_id and current uses_count
            const { data: joinRow, error: joinFetchError } = await supabase
                .from('trip_join_codes')
                .select('trip_id, uses_count')
                .eq('id', activeJoinCodeId)
                .maybeSingle();

            if (joinFetchError || !joinRow) {
                console.error('Unable to load join code', joinFetchError);
                const errorMsg = 'Unable to finalize join. Please try again.';
                setError(errorMsg);
                throw new Error(errorMsg);
            }

            const tripId = joinRow.trip_id;

            // Increment uses_count for the join code
            if (!joinCodeClaimed) {
                try {
                    const newUsesCount = (joinRow.uses_count ?? 0) + 1;
                    const { error: updateErr } = await supabase
                        .from('trip_join_codes')
                        .update({ uses_count: newUsesCount })
                        .eq('id', activeJoinCodeId);

                    if (updateErr) {
                        console.error('Unable to increment join code uses_count', updateErr);
                        // not fatal: continue
                    } else {
                        setJoinCodeClaimed(true);
                    }
                } catch (e) {
                    console.error('Increment error', e);
                }
            }

            // Fetch trip to get current group_size
            const { data: tripData, error: tripFetchError } = await supabase
                .from('trips')
                .select('group_size')
                .eq('id', tripId)
                .maybeSingle();

            if (tripFetchError || !tripData) {
                console.error('Unable to fetch trip data', tripFetchError);
                const errorMsg = 'Unable to load trip information.';
                setError(errorMsg);
                throw new Error(errorMsg);
            }

            // Increment group_size for the trip
            const newGroupSize = (tripData.group_size ?? 0) + 1;
            const { error: tripUpdateError } = await supabase
                .from('trips')
                .update({ group_size: newGroupSize })
                .eq('id', tripId);

            if (tripUpdateError) {
                console.error('Unable to increment trip group_size', tripUpdateError);
                // not fatal: continue
            }

            // Create trip membership
            const { data: membership, error: membershipError } = await supabase
                .from('trip_memberships')
                .insert({ 
                    trip_id: tripId, 
                    user_id: userId 
                })
                .select()
                .maybeSingle();

            if (membershipError) {
                console.error('Failed to create trip membership', membershipError);
                const errorMsg = 'Unable to add you to the trip. Please try again.';
                setError(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            // Re-throw the error so handleSignUp can catch it and sign the user out
            throw error;
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
                            <AccountCreatedStep />
                        )}

                        
                        {/* Already have account / Footer */}
                        {step !== 4 && <View className="items-center mt-6">
                            <Text className="text-sm text-muted-foreground">Already have an account?{' '}
                                <Link href="/login" className="text-primary font-medium">Log in</Link>
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
