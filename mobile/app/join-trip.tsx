import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import GroupCodeStep from './joinTripSteps/GroupCodeStep';
import PhoneStep from './joinTripSteps/PhoneStep';
import OtpStep from './joinTripSteps/OtpStep';
import NameStep from './joinTripSteps/NameStep';

export default function JoinTripScreen() {
    const router = useRouter();
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [step, setStep] = useState(1); // 1: group code, 2: phone, 3: otp, 4: name
    const [name, setName] = useState('');
    // split phone into area/country code and number
    const [areaCode, setAreaCode] = useState('1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [groupCode, setGroupCode] = useState<string[]>(Array(10).fill(''));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeJoinCodeId, setActiveJoinCodeId] = useState<string | null>(null);
    const [joinCodeClaimed, setJoinCodeClaimed] = useState(false);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...groupCode];
        newCode[index] = text.toUpperCase();
        setGroupCode(newCode);

        // Auto-focus next input if text entered
        if (text && index < 10) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !groupCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // NOTE: The following function is used by `GroupCodeStep`.
    // handleVerifyGroupCode()
    // - Purpose: Validate the entered 10-character group code against the DB,
    //   ensure the code is active and under its join limit, then claim it (best-effort)
    //   and advance the flow to the phone verification step.
    // - Used by: GroupCodeStep (Continue button)

    const handleVerifyGroupCode = async () => {
        setErrorMessage(null);
        const code = groupCode.join('').trim();       
        // require full 10-character code
        if (code.length < 10) {
            setErrorMessage('Please enter the full 10-character group code.');
            return;
        }
        if (!code) {
            setErrorMessage('Please enter a group code.');
            return;
        }

        try {
            setLoading(true);

            // Fetch the join code row
            const { data: row, error: fetchError } = await supabase
                .from('trip_join_codes')
                .select('*')
                .eq('code', code)
                .maybeSingle();

            if (fetchError) {
                console.error('Supabase fetch error', fetchError);
                setErrorMessage('Unable to verify code. Please try again.');
                return;
            }

            if (!row) {
                setErrorMessage('Invalid group code.');
                return;
            }

            // Check active flag
            if (row.is_active === false) {
                setErrorMessage('This join code is not active.');
                return;
            }

            // Check usage limit (null join_limit means unlimited)
            const uses = row.uses_count ?? 0;
            const limit = row.join_limit;
            if (typeof limit === 'number' && limit >= 0 && uses >= limit) {
                setErrorMessage('This join code has reached its usage limit.');
                return;
            }

            // All checks passed — increment uses_count (best-effort)
            try {
                const newCount = uses + 1;
                const { data: updated, error: updateError } = await supabase
                    .from('trip_join_codes')
                    .update({ uses_count: newCount })
                    .eq('id', row.id)
                    .select()
                    .maybeSingle();

                if (updateError) {
                    console.error('Supabase update error', updateError);
                    setErrorMessage('Unable to claim the code right now. Please try again.');
                    return;
                }

                // store active join code id in case later steps need it
                setActiveJoinCodeId(row.id);
                setJoinCodeClaimed(true);

                // advance to phone verification step
                setStep(2);
            } catch (e) {
                console.error('Increment uses_count failed', e);
                setErrorMessage('Unable to claim the code right now. Please try again.');
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpChars, setOtpChars] = useState<string[]>(Array(6).fill(''));
    const otpInputRefs = useRef<(TextInput | null)[]>([]);
    const [resendTimer, setResendTimer] = useState(0);
    const resendInterval = useRef<number | null>(null);

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

    // isPhoneNumberValid(num)
    // - Purpose: Basic digit-count validation for the local portion of the phone.
    // - Used by: PhoneStep (enables Verify button) and handleVerifyPhoneStep validation.
    const isPhoneNumberValid = (num: string) => {
        const digits = num.replace(/\D/g, '');
        return digits.length >= 10;
    };


    // handleVerifyPhoneStep()
    // - Purpose: Send an OTP to the combined phone number via Supabase and
    //   start the resend cooldown, then move to the OTP entry step.
    // - Used by: PhoneStep (Verify Phone button)
    const handleVerifyPhoneStep = async () => {
        setErrorMessage(null);
        if (!areaCode.trim() || !phoneNumber.trim()) {
            setErrorMessage('Please enter your area code and phone number to verify.');
            return;
        }

        if (!isPhoneNumberValid(phoneNumber)) {
            setErrorMessage('Please enter a valid phone number (7–15 digits).');
            return;
        }

        const fullPhone = getFullPhone();
        console.log('Sending OTP to', fullPhone);

        try {
            // Prevent sending an OTP if the phone is already associated with an account.
            // We check the `profiles` table which stores phone numbers linked to users.
            // If your project stores phones elsewhere (e.g., a `users` table), adjust this query.
            const { data: existing, error: existingErr } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('phone', fullPhone)
                .maybeSingle();

            if (existingErr) {
                console.warn('Error checking existing phone', existingErr);
                // Not fatal: continue to attempt OTP in case the lookup failed, but inform devs.
            } else if (existing) {
                // Phone already has an account — instruct the user to sign in instead.
                setErrorMessage('An account already exists for this phone number. Please sign in instead.');
                return;
            }

            setLoading(true);
            // Send OTP using Supabase (SMS)
            const { data, error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
            if (error) {
                console.error('Error sending OTP', error);
                setErrorMessage('Unable to send verification code. Please try again.');
                return;
            }

            // Start resend cooldown and advance to OTP entry step
            startResendCountdown(60);
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const startResendCountdown = (seconds: number) => {
        // clear existing
        if (resendInterval.current) {
            clearInterval(resendInterval.current);
        }
        setResendTimer(seconds);
        resendInterval.current = setInterval(() => {
            setResendTimer((s) => {
                if (s <= 1) {
                    if (resendInterval.current) {
                        clearInterval(resendInterval.current);
                        resendInterval.current = null;
                    }
                    return 0;
                }
                return s - 1;
            });
        }, 1000) as unknown as number;
    };

    useEffect(() => {
        return () => {
            if (resendInterval.current) {
                clearInterval(resendInterval.current);
                resendInterval.current = null;
            }
        };
    }, []);

    // Clear resend timer when leaving OTP step
    useEffect(() => {
        if (step !== 3 && resendInterval.current) {
            clearInterval(resendInterval.current);
            resendInterval.current = null;
            setResendTimer(0);
        }
    }, [step]);

    const handleOtpChange = (text: string, index: number) => {
        // allow only digits
        const digits = text.replace(/\D/g, '');
        // copy current
        const newChars = [...otpChars];
        if (digits.length === 0) {
            newChars[index] = '';
            setOtpChars(newChars);
            return;
        }

        // if user pasted multiple digits, spread them
        for (let i = 0; i < digits.length && index + i < newChars.length; i++) {
            newChars[index + i] = digits[i];
        }
        setOtpChars(newChars);

        // focus next empty
        const nextIndex = newChars.findIndex((c, i) => i > index && !c);
        const target = nextIndex === -1 ? Math.min(index + digits.length, newChars.length - 1) : nextIndex;
        if (target <= newChars.length - 1) {
            otpInputRefs.current[target]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newChars = [...otpChars];
            if (newChars[index]) {
                // clear current
                newChars[index] = '';
                setOtpChars(newChars);
            } else if (index > 0) {
                otpInputRefs.current[index - 1]?.focus();
                const prev = [...otpChars];
                prev[index - 1] = '';
                setOtpChars(prev);
            }
        }
    };


    // handleVerifyOtp()
    // - Purpose: Verify the OTP entered by the user with Supabase. On success,
    //   it sets phoneVerified=true and advances the flow to the name entry step.
    // - Used by: OtpStep (Verify Code button)

    const handleVerifyOtp = async () => {
        setErrorMessage(null);
        const otpCode = otpChars.join('').trim();
        if (!otpCode) {
            setErrorMessage('Please enter the verification code.');
            return;
        }

        try {
            setLoading(true);
            // Verify OTP with Supabase
            const fullPhone = getFullPhone();
            const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otpCode, type: 'sms' });
            if (error) {
                console.error('OTP verify error', error);
                setErrorMessage('Invalid verification code.');
                return;
            }

            // success — ensure we have an authenticated user
            // verifyOtp should establish a session, but sometimes client state may not have the user yet.
            const { data: userResult } = await supabase.auth.getUser();
            if (!userResult?.user) {
                console.error('No authenticated user after verifyOtp');
                setErrorMessage('Verification succeeded but we could not establish your account locally. Please close and try signing in again.');
                return;
            }

            console.log(userResult)

            setPhoneVerified(true);
            setStep(4);
        } finally {
            setLoading(false);
        }
    };

    // handleResendOtp()
    // - Purpose: Re-send the OTP (if not on cooldown) and restart the resend timer.
    // - Used by: OtpStep (Resend code)

    const handleResendOtp = async () => {
        setErrorMessage(null);
        if (resendTimer > 0) return;
        try {
            setLoading(true);
            const fullPhone = getFullPhone();
            const { data, error } = await supabase.auth.signInWithOtp({ phone: fullPhone, });
            if (error) {
                console.error('Resend OTP error', error);
                setErrorMessage('Unable to resend code. Please try again later.');
                return;
            }
            startResendCountdown(60);
        } finally {
            setLoading(false);
        }
    };

    // handleJoinGroup()
    // - Purpose: Finalize joining the trip: ensure an authenticated user exists
    //   (best-effort client signUp if phone verified but no session), upsert the
    //   `profiles` row for the user, claim the join code (if not already claimed),
    //   and create a `trip_membership` tied to the authenticated user's id.
    // - Used by: NameStep (Join Group button)

    const handleJoinGroup = async () => {
        // Finalize joining: create profile / membership and ensure join code is claimed.
        setErrorMessage(null);
        if (!activeJoinCodeId) {
            setErrorMessage('Missing join code. Please restart the flow.');
            return;
        }

        try {
            setLoading(true);

            // get authenticated user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error('No authenticated user', userError);
                setErrorMessage('Unable to determine your account. Please complete verification first.');
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
                setErrorMessage('Unable to create profile. Please try again.');
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
                setErrorMessage('Unable to finalize join. Please try again.');
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
                setErrorMessage('Unable to add you to the trip. Please try again.');
                return;
            }

            // Success — navigate to main tabs
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };


    const handleBack = () => {
        setErrorMessage(null);
        setStep(1);
    };

    const goToStep = (n: number) => {
        setErrorMessage(null);
        setStep(n);
    };

    const isStep1Valid = groupCode.join('').trim().length >= 10;
    const isPhoneValid = areaCode.trim() !== '' && phoneNumber.trim() !== '' && isPhoneNumberValid(phoneNumber);

    // sanitize area code updates (store digits only, no plus)
    const updateAreaCode = (text: string) => setAreaCode(text.replace(/\D/g, ''));
    const isNameValid = name.trim() !== '';

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
                            <GroupCodeStep
                                groupCode={groupCode}
                                inputRefs={inputRefs}
                                handleCodeChange={handleCodeChange}
                                handleKeyPress={handleKeyPress}
                                handleVerifyGroupCode={handleVerifyGroupCode}
                                isStep1Valid={isStep1Valid}
                                loading={loading}
                                errorMessage={errorMessage}
                            />
                        ) : step === 2 ? (
                            <PhoneStep
                                areaCode={areaCode}
                                setAreaCode={updateAreaCode}
                                phoneNumber={phoneNumber}
                                setPhoneNumber={setPhoneNumber}
                                handleVerifyPhoneStep={handleVerifyPhoneStep}
                                isPhoneValid={isPhoneValid}
                                loading={loading}
                                errorMessage={errorMessage}
                                handleBack={handleBack}
                                groupCodeText={groupCode.join('')}
                            />
                        ) : step === 3 ? (
                            <OtpStep
                                otpChars={otpChars}
                                otpInputRefs={otpInputRefs}
                                handleOtpChange={handleOtpChange}
                                handleOtpKeyPress={handleOtpKeyPress}
                                handleVerifyOtp={handleVerifyOtp}
                                handleResendOtp={handleResendOtp}
                                resendTimer={resendTimer}
                                loading={loading}
                                errorMessage={errorMessage}
                                goToStep={goToStep}
                                groupCodeText={groupCode.join('')}
                                phoneDisplay={getFullPhone()}
                            />
                        ) : (
                            <NameStep
                                name={name}
                                setName={setName}
                                handleJoinGroup={handleJoinGroup}
                                isNameValid={isNameValid}
                                goToStep={goToStep}
                                groupCodeText={groupCode.join('')}
                            />
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
