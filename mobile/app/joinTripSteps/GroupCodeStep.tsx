import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowRight, Hash } from 'lucide-react-native';

type Props = {
  groupCode: string[];
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleCodeChange: (text: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  handleVerifyGroupCode: () => Promise<void>;
  isStep1Valid: boolean;
  loading: boolean;
  errorMessage: string | null;
};

export default function GroupCodeStep({ groupCode, inputRefs, handleCodeChange, handleKeyPress, handleVerifyGroupCode, isStep1Valid, loading, errorMessage }: Props) {
  return (
    <>
      {/* Header */}
      <View className="items-center mb-10 mt-8">
        <View className="h-20 w-20 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
          <Hash size={40} color="#4A6741" />
        </View>
        <Text className="text-3xl font-bold text-foreground mb-2">Enter Group Code</Text>
        <Text className="text-muted-foreground text-center">Enter the code shared by your group leader</Text>
      </View>

      {/* Loading & error: show right after header and before the form */}
      {loading && (
        <View className="mb-6 w-full items-center"><ActivityIndicator size="small" color="#4A6741" /></View>
      )}

      {errorMessage && (
        <View className="mb-6 w-full"><View className="bg-red-50 border border-red-200 rounded-xl p-3 w-full"><Text className="text-sm text-red-700">{errorMessage}</Text></View></View>
      )}

      {/* Form */}
      <View className="items-center space-y-4">
        <Text className="text-center text-muted-foreground text-sm mt-4">Enter your group code</Text>
        <View className="mb-4 w-full items-center">
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
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleVerifyGroupCode} disabled={!isStep1Valid} className={`rounded-xl p-4 items-center mt-6 flex-row justify-center ${isStep1Valid ? 'bg-primary' : 'bg-sand-200'}`}>
          <Text className={`font-bold text-base mr-2 ${isStep1Valid ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Continue</Text>
          <ArrowRight size={20} color={isStep1Valid ? "hsl(140 80% 95%)" : "hsl(40 5% 55%)"} />
        </TouchableOpacity>



        <View className="bg-sand-50 rounded-xl p-4 border border-sand-200 mt-8">
          <Text className="text-sm font-semibold text-foreground mb-2">Don't have a group code?</Text>
          <Text className="text-sm text-muted-foreground">Contact your group leader or tour organizer to get your unique group code.</Text>
        </View>
      </View>
    </>
  );
}
