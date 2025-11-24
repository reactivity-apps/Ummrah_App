import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter, Link } from "expo-router";
import GroupCodeStep from './components/joinTripSteps/GroupCodeStep';
import NameStep from './components/joinTripSteps/NameStep';
import EmailPasswordStep from './components/joinTripSteps/EmailPasswordStep';

export default function JoinTripScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); 
    const [name, setName] = useState('');
    // split phone into area/country code and number
    const [areaCode, setAreaCode] = useState('1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [groupCodeText, setGroupCodeText] = useState('');
    const [activeJoinCodeId, setActiveJoinCodeId] = useState<string | null>(null);
    const [joinCodeClaimed, setJoinCodeClaimed] = useState(false);
    const [email, setEmail] = useState('');
    const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null);


    // getFullPhone()
    // - Purpose: Combine `areaCode` and `phoneNumber` into a sanitized E.164-like
    //   phone string (always starts with '+'). Used for display and for Supabase OTP calls.
    // - Used by: handleVerifyPhoneStep, handleVerifyOtp, handleResendOtp, handleJoinGroup
    const getFullPhone = () => {
        // Build a cleaned E.164-style number with leading '+' and digits only.
        const ac = (areaCode || '').toString();
        const acDigits = ac.replace(/\D/g, '');
        const cleaned = (phoneNumber || '').replace(/\D/g, '');
        const combined = `${acDigits}${cleaned}`;
        if (!combined) return '';
        return `+${combined}`;
    };    

    // handleJoinGroup()
    // - Purpose: Finalize joining the trip: ensure an authenticated user exists
    //   (best-effort client signUp if phone verified but no session), upsert the
    //   `profiles` row for the user, claim the join code (if not already claimed),
    //   and create a `trip_membership` tied to the authenticated user's id.
    // - Used by: NameStep (Join Group button)

    // Previous implementation of handleJoinGroup (phone/otp flow) commented out below.
    /*
    const handleJoinGroup = async (setError: (m: string | null) => void, setLoading: (b: boolean) => void) => {
        // Finalize joining: create profile / membership and ensure join code is claimed.
        setError(null);
        if (!activeJoinCodeId) {
            setError('Missing join code. Please restart the flow.');
            return;
        }

        try {
            setLoading(true);

            // get authenticated user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error('No authenticated user', userError);
                setError('Unable to determine your account. Please complete verification first.');
                return;
            }
            const user = userData.user;

            const fullPhone = getFullPhone();

            // Update the auth user's display name (user_metadata) so other parts of the
            // app that read the auth user see the chosen name.
            try {
                const { data: updatedUser, error: updateUserError } = await supabase.auth.updateUser({ data: { name: name.trim(), full_name: name.trim() } });
                if (updateUserError) {
                    // Not fatal — continue, but log for debugging
                    console.warn('Unable to update auth user metadata', updateUserError);
                }
            } catch (e) {
                console.warn('Exception updating auth user metadata', e);
            }

            // Upsert profile (user_id is PK)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .upsert({ user_id: user.id, name: name.trim(), phone: fullPhone })
                .select()
                .maybeSingle();

            if (profileError) {
                console.error('Profile upsert error', profileError);
                setError('Unable to create profile. Please try again.');
                return;
            }

            // Fetch join code row to get trip_id and current uses_count
            const { data: joinRow, error: joinFetchError } = await supabase
                .from('trip_join_codes')
                .select('trip_id, uses_count')
                .eq('id', activeJoinCodeId)
                .maybeSingle();

            if (joinFetchError || !joinRow) {
                console.error('Unable to load join code', joinFetchError);
                setError('Unable to finalize join. Please try again.');
                return;
            }

            const tripId = joinRow.trip_id;

            // Only increment uses_count here if we haven't already claimed it earlier
            if (!joinCodeClaimed) {
                try {
                    const newCount = (joinRow.uses_count ?? 0) + 1;
                    const { data: updated, error: updateErr } = await supabase
                        .from('trip_join_codes')
                        .update({ uses_count: newCount })
                        .eq('id', activeJoinCodeId)
                        .select()
                        .maybeSingle();

                    if (updateErr) {
                        console.error('Unable to increment join code uses_count', updateErr);
                        // not fatal: continue, but show a warning
                    } else {
                        setJoinCodeClaimed(true);
                    }
                } catch (e) {
                    console.error('Increment error', e);
                }
            }

            // Create trip membership
            const { data: membership, error: membershipError } = await supabase
                .from('trip_memberships')
                .insert({ trip_id: tripId, user_id: user.id, role: 'traveler' })
                .select()
                .maybeSingle();

            if (membershipError) {
                console.error('Failed to create trip membership', membershipError);
                setError('Unable to add you to the trip. Please try again.');
                return;
            }

            // Success — navigate to main tabs
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };
    */

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
                    options: { data: { name: name.trim() } },
                });

                if (signError) {
                    console.error('Error signing up user', signError);
                    setError('Unable to create account with that email. Please try again.');
                    return;
                }

                const newUser = (signData as any)?.user;
                if (newUser && newUser.id) {
                    setSignedUpUserId(newUser.id);
                }

                // store email and immediately finalize the join (no verification step)
                // NOTE: calling setEmail is async — pass the email directly to finalizeJoin
                const providedEmail = creds.email.trim();
                setEmail(providedEmail);
                // Call finalizeJoin directly so the profile is created and membership added
                // pass providedEmail to ensure the upsert includes it immediately
                await finalizeJoin(setError, setLoading, providedEmail);
                return;
            }
            
        } finally {
            setLoading(false);
        }
    };

    // finalizeJoin
    // - Purpose: called after the user verifies their email and signs in.
    //   This will upsert the profile, claim the join code (increment uses_count)
    //   and create the trip_membership for the authenticated user.
    const finalizeJoin = async (setError: (m: string | null) => void, setLoading: (b: boolean) => void, emailArg?: string) => {
        setError(null);
        if (!activeJoinCodeId) {
            setError('Missing join code. Please restart the flow.');
            return;
        }

        try {
            setLoading(true);

            // Determine final user id: prefer the id created during signup, else use current session
            let userId = signedUpUserId;
            if (!userId) {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData?.user) {
                    console.error('No authenticated user for finalization', userError);
                    setError('Please sign in or verify your email first.');
                    return;
                }
                userId = userData.user.id;
            }

            // Update auth user metadata with chosen name (best-effort)
            try {
                await supabase.auth.updateUser({ data: { name: name.trim(), full_name: name.trim() } });
            } catch (e) {
                console.warn('Unable to update auth user metadata', e);
            }

            // Upsert profile (user_id is PK)
            const upsertObj: any = { user_id: userId, name: name.trim() };
            const finalEmail = emailArg ?? email;
            if (finalEmail) upsertObj.email = finalEmail;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .upsert(upsertObj)
                .select()
                .maybeSingle();

            if (profileError) {
                console.error('Profile upsert error', profileError);
                setError('Unable to create profile. Please try again.');
                return;
            }

            // Fetch join code row to get trip_id and current uses_count
            const { data: joinRow, error: joinFetchError } = await supabase
                .from('trip_join_codes')
                .select('trip_id, uses_count')
                .eq('id', activeJoinCodeId)
                .maybeSingle();

            if (joinFetchError || !joinRow) {
                console.error('Unable to load join code', joinFetchError);
                setError('Unable to finalize join. Please try again.');
                return;
            }

            const tripId = joinRow.trip_id;

            // Only increment uses_count here if we haven't already claimed it earlier
            if (!joinCodeClaimed) {
                try {
                    const newCount = (joinRow.uses_count ?? 0) + 1;
                    const { data: updated, error: updateErr } = await supabase
                        .from('trip_join_codes')
                        .update({ uses_count: newCount })
                        .eq('id', activeJoinCodeId)
                        .select()
                        .maybeSingle();

                    if (updateErr) {
                        console.error('Unable to increment join code uses_count', updateErr);
                        // not fatal: continue, but show a warning
                    } else {
                        setJoinCodeClaimed(true);
                    }
                } catch (e) {
                    console.error('Increment error', e);
                }
            }

            // Create trip membership
            const { data: membership, error: membershipError } = await supabase
                .from('trip_memberships')
                .insert({ trip_id: tripId, user_id: userId, role: 'traveler' })
                .select()
                .maybeSingle();

            if (membershipError) {
                console.error('Failed to create trip membership', membershipError);
                setError('Unable to add you to the trip. Please try again.');
                return;
            }

            // Success — navigate to main tabs
            router.replace({
                pathname: '/(tabs)',
                params: { message: 'new-user' },
            });
        } finally {
            setLoading(false);
        }
    };
   
    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 32 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-6 py-8">
                        {/*
                        Old multi-step flow (commented out):
                        1: GroupCodeStep -> 2: PhoneStep -> 3: OtpStep -> 4: NameStep
                        
                        {step === 1 ? (
                            <GroupCodeStep
                                setGroupCodeText={setGroupCodeText}
                                setActiveJoinCodeId={setActiveJoinCodeId}
                                setJoinCodeClaimed={setJoinCodeClaimed}
                                setStep={setStep}
                            />
                        ) : step === 2 ? (
                            <PhoneStep
                                areaCode={areaCode}
                                setAreaCode={setAreaCode}
                                phoneNumber={phoneNumber}
                                setPhoneNumber={setPhoneNumber}
                                onOtpSent={() => setStep(3)}
                                getFullPhone={getFullPhone}
                                setStep={setStep}
                                groupCodeText={groupCodeText}
                            />
                        ) : step === 3 ? (
                            <OtpStep
                                setStep={setStep}
                                groupCodeText={groupCodeText}
                                phoneDisplay={getFullPhone()}
                            />
                        ) : (
                            <NameStep
                                name={name}
                                setName={setName}
                                handleJoinGroup={handleJoinGroup}
                                setStep={setStep}
                                groupCodeText={groupCodeText}
                            />
                        )}
                        */}

                        {/* New flow: 1: GroupCodeStep -> 2: EmailPasswordStep -> 3: NameStep -> 4: AccountCreatedStep */}
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
                        ) : (
                            <EmailPasswordStep
                                onEmailEntered={(e) => setEmail(e)}
                                setStep={setStep}
                                handleSignUp={handleSignUp}
                                groupCodeText={groupCodeText}
                            />
                          
                        )}

                        {/* Already have account / Footer */}
                        <View className="items-center mt-6">
                            <Text className="text-sm text-muted-foreground">Already have an account?{' '}
                                <Link href="/login" className="text-primary font-medium">Log in</Link>
                            </Text>
                        </View>

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
