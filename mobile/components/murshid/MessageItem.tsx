import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { GeometricPattern } from './GeometricPattern';

const COLORS = {
    primary: '#4A6741',
    gold: '#C5A059',
    sand700: '#57534e',
    sand800: '#44403c',
};

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface MessageItemProps {
    message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <View
                className="self-end rounded-2xl rounded-tr-none px-5 py-3.5 max-w-[85%] my-2"
                style={{ backgroundColor: 'transparent' }}
            >
                <Text className="text-[#4A6741] text-base leading-6">{message.content}</Text>
            </View>
        );
    }

    // Split content to handle Arabic text separately from Markdown
    const renderContent = () => {
        const lines = message.content.split('\n');
        const elements: React.ReactNode[] = [];
        let markdownBuffer: string[] = [];
        
        const flushMarkdownBuffer = (idx: number) => {
            if (markdownBuffer.length > 0) {
                const markdownText = markdownBuffer.join('\n');
                elements.push(
                    <Markdown
                        key={`md-${idx}`}
                        style={{
                            body: { color: COLORS.sand700 },
                            heading1: { fontSize: 20, fontWeight: 'bold', color: COLORS.sand800, marginVertical: 8 },
                            heading2: { fontSize: 18, fontWeight: 'bold', color: COLORS.sand800, marginVertical: 6 },
                            heading3: { fontSize: 16, fontWeight: '600', color: COLORS.sand800, marginVertical: 4 },
                            paragraph: { fontSize: 16, lineHeight: 28, marginBottom: 8, color: COLORS.sand700 },
                            strong: { fontWeight: 'bold', color: COLORS.sand800 },
                            em: { fontStyle: 'italic' },
                            list_item: { marginVertical: 4 },
                            ordered_list: { marginVertical: 4 },
                            bullet_list: { marginVertical: 4 },
                            hr: { backgroundColor: '#e7e5e4', height: 1, marginVertical: 12 },
                        }}
                    >
                        {markdownText}
                    </Markdown>
                );
                markdownBuffer = [];
            }
        };

        lines.forEach((line, idx) => {
            const isArabic = /[\u0600-\u06FF]/.test(line);
            
            if (isArabic) {
                // Flush any pending markdown before rendering Arabic
                flushMarkdownBuffer(idx);
                
                // Render Arabic text with special styling
                elements.push(
                    <Text 
                        key={`arabic-${idx}`} 
                        className="text-right text-2xl text-sand-800 leading-10 mb-4 font-medium" 
                        style={{ fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif' }}
                    >
                        {line}
                    </Text>
                );
            } else if (line.trim() === '---') {
                // Flush markdown and render divider
                flushMarkdownBuffer(idx);
                elements.push(
                    <View key={`divider-${idx}`} className="h-[1px] bg-sand-200 my-3 w-1/2 self-center" />
                );
            } else {
                // Accumulate markdown content
                markdownBuffer.push(line);
            }
        });

        // Flush any remaining markdown
        flushMarkdownBuffer(lines.length);

        return elements;
    };

    // Murshid Message (Guidance Card)
    return (
        <View className="self-start bg-[#FDFBF7] rounded-2xl rounded-tl-none max-w-[90%] my-3 border-2 border-sand-200 overflow-hidden">
            {/* Decorative Top Border */}
            <View className="h-1 w-full bg-sand-100" />

            <View className="p-5">
                {renderContent()}
            </View>

            {/* Footer / Filigree */}
            <View className="px-4 py-2 flex-row justify-between items-center border-t border-sand-100">
                <View className="flex-row items-center">
                    <Sparkles size={12} color={COLORS.gold} />
                    <Text className="text-[10px] text-[#4A6741] uppercase tracking-widest ml-2 font-semibold">Guidance</Text>
                </View>
                <View className="opacity-20">
                    <GeometricPattern size={20} color={COLORS.primary} />
                </View>
            </View>
        </View>
    );
};
