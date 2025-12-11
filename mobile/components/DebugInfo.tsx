/**
 * Debug Info Component
 * Shows current environment and redirect URL configuration
 * Useful for troubleshooting deep linking issues
 */

import { View, Text } from 'react-native';
import { getRedirectUrl } from '../lib/utils';

export default function DebugInfo() {
    const redirectUrl = getRedirectUrl();

    if (__DEV__) {
        return (
            <View className="bg-yellow-50 p-3 m-4 rounded-lg border border-yellow-200">
                <Text className="text-xs font-bold text-yellow-900 mb-2">DEBUG INFO</Text>
                <Text className="text-xs text-yellow-800">Redirect URL: {redirectUrl}</Text>
                <Text className="text-xs text-yellow-600 mt-2">Add this URL to Supabase Redirect URLs!</Text>
            </View>
        );
    }

    return null;
}
