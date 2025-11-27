/**
 * OpenAI Service
 * 
 * Handles communication with OpenAI API for the Murshid chatbot
 */

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface OpenAIResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * System prompt that defines Murshid's personality and knowledge base
 */
const SYSTEM_PROMPT = `You are Murshid (مرشد), a knowledgeable and respectful Islamic guide specializing in Umrah and Hajj rituals.

Your role:
- Provide authentic guidance based on the Quran and Sunnah
- Be compassionate, patient, and respectful
- Include relevant Arabic text (duas, phrases) where appropriate
- Give practical, step-by-step instructions when needed
- Remind users to consult with their group scholars for specific rulings
- Keep responses concise but thorough (aim for 2-4 paragraphs)

Format guidelines:
- Use "---" as a divider between sections
- Include Arabic text on its own line for emphasis
- Provide English transliterations and translations
- Use numbered lists for multi-step processes

Topics you cover:
- Ihram and intention (niyyah)
- Tawaf and Sa'i procedures
- Duas for different locations and rituals
- Etiquette in the Haramain
- Historical sites (ziyarat) in Makkah and Madinah
- Common mistakes to avoid
- Spiritual reflections and reminders

Always maintain a tone of humility and remember that you are here to guide, not to replace formal Islamic education or local scholars.`;

/**
 * Send a chat message to OpenAI and get a response
 */
export async function sendChatMessage(
    conversationHistory: ChatMessage[]
): Promise<{
    success: boolean;
    response?: string;
    error?: string;
}> {
    try {
        if (!OPENAI_API_KEY) {
            return {
                success: false,
                error: 'OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.',
            };
        }

        // Prepare messages with system prompt
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            ...conversationHistory,
        ];

        // Call OpenAI API
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Cost-effective model, you can change to gpt-4 or gpt-3.5-turbo
                messages,
                temperature: 0.7, // Balance between creative and focused
                max_tokens: 800, // Limit response length
                top_p: 1,
                frequency_penalty: 0.2,
                presence_penalty: 0.1,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error?.message || `API error: ${response.status} ${response.statusText}`,
            };
        }

        const data: OpenAIResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
            return {
                success: false,
                error: 'No response from AI',
            };
        }

        const aiResponse = data.choices[0].message.content;

        // Log token usage for debugging (optional)
        if (data.usage) {
            console.log(`[OpenAI] Tokens used: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
        }

        return {
            success: true,
            response: aiResponse,
        };
    } catch (err) {
        console.error('OpenAI API Error:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to communicate with AI service',
        };
    }
}

/**
 * Get a streaming response from OpenAI (for future implementation)
 * This would allow showing the response as it's being generated
 */
export async function sendChatMessageStream(
    conversationHistory: ChatMessage[],
    onChunk: (chunk: string) => void
): Promise<{
    success: boolean;
    error?: string;
}> {
    // TODO: Implement streaming for better UX
    // This would use Server-Sent Events (SSE) to receive partial responses
    return {
        success: false,
        error: 'Streaming not yet implemented',
    };
}
