import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowRight, Hash } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

type Props = {
  // callback to give the verified code back to the parent for downstream steps
  setGroupCodeText: (code: string) => void;
  // setters from parent so this step can perform DB logic locally
  setActiveJoinCodeId: (id: string | null) => void;
  setJoinCodeClaimed: (b: boolean) => void;
  setStep: (n: number) => void;
};

export default function GroupCodeStep({ setGroupCodeText, setActiveJoinCodeId, setJoinCodeClaimed, setStep }: Props) {
  // Local group code inputs and refs
  const [groupCode, setGroupCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isStep1Valid = groupCode.join('').trim().length >= 6;

  const handleVerifyGroupCode = async () => {
    setLocalError(null);
    const code = groupCode.join('').trim();
    if (!code) {
      setLocalError('Please enter a group code.');
      return;
    }

    try {
      setLoadingLocal(true);
      // Fetch the join code row
      const { data: row, error: fetchError } = await supabase
        .from('trip_join_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase fetch error', fetchError);
        setLocalError('Unable to verify code. Please try again.');
        return;
      }

      if (!row) {
        setLocalError('Invalid group code.');
        return;
      }

      // Check active flag
      if (row.is_active === false) {
        setLocalError('This join code is not active.');
        return;
      }

      // Check usage limit (null join_limit means unlimited)
      const uses = row.uses_count ?? 0;
      const limit = row.join_limit;
      if (typeof limit === 'number' && limit >= 0 && uses >= limit) {
        setLocalError('This join code has reached its usage limit.');
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
          setLocalError('Unable to claim the code right now. Please try again.');
          return;
        }

        // store active join code id in case later steps need it
        setActiveJoinCodeId(row.id);
        setJoinCodeClaimed(true);
        // notify parent of the plain group code text for downstream steps
        try {
          setGroupCodeText(code);
        } catch (e) {
          // non-fatal
        }

        // advance to phone verification step
        setStep(2);
      } catch (e) {
        console.error('Increment uses_count failed', e);
        setLocalError('Unable to claim the code right now. Please try again.');
        return;
      }
    } finally {
      setLoadingLocal(false);
    }
  };

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
  return (
    <>
      {/* Header */}
      <View className="items-center">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Hash size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Enter Group Code</Text>
        <Text className="text-muted-foreground text-center">Enter the code shared by your group leader</Text>
      </View>

      {/* Form */}
      <View className="items-center space-y-4 gap-3">
        <Text className="text-center text-muted-foreground text-sm mt-4">Enter your group code</Text>
        <View className="w-full items-center">
          <View className="flex-row justify-center gap-3">
            {groupCode.map((char, index) => (
              <View key={index} className="w-10 h-14 bg-card rounded-lg border-2 items-center justify-center" style={{ borderColor: char ? '#4A6741' : 'hsl(40 15% 85%)' }}>
                <TextInput
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  value={char}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  className="w-full h-full text-center text-foreground font-bold text-xl"
                  maxLength={1}
                  autoCapitalize="characters"
                  keyboardType="default"
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleVerifyGroupCode} disabled={!isStep1Valid || loadingLocal} className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${isStep1Valid && !loadingLocal ? 'bg-primary' : 'bg-sand-200'}`}>
          {loadingLocal ? (
            <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
          ) : null}
          <Text className={`font-bold text-base mr-2 ${isStep1Valid && !loadingLocal ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
            {loadingLocal ? 'Verifying...' : 'Continue'}
          </Text>
          {!loadingLocal && <ArrowRight size={20} color={isStep1Valid ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"} />}
        </TouchableOpacity>

        {/* Error display */}
        {localError && (
          <View className="mb-6 w-full"><View className="bg-red-50 border border-red-200 rounded-xl p-3 w-full"><Text className="text-sm text-red-700">{localError}</Text></View></View>
        )}

        <View className="bg-sand-50 rounded-xl p-4 border border-sand-200">
          <Text className="text-sm font-semibold text-foreground mb-2">Don't have a group code?</Text>
          <Text className="text-sm text-muted-foreground">Contact your group leader or tour organizer to get your unique group code.</Text>
        </View>
      </View>
    </>
  );
}
