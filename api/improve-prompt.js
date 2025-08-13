import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide a valid prompt' 
            });
        }

        if (prompt.length > 5000) {
            return res.status(400).json({ 
                success: false, 
                error: 'Prompt is too long. Please limit to 5000 characters.' 
            });
        }

        const systemPrompt = `You are a prompt engineering expert. Transform the user's rough prompt into a highly effective one using these principles:

1. Add clear context and role definition
2. Specify the exact output format wanted
3. Include relevant constraints and requirements
4. Add examples if they would help
5. Make instructions unambiguous
6. Specify tone, audience, length when relevant

Take this rough prompt and dramatically improve it. Return only the improved prompt, nothing else.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            max_tokens: 1000,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt.trim()
                }
            ]
        });

        const improvedPrompt = completion.choices[0].message.content.trim();

        return res.status(200).json({
            success: true,
            improvedPrompt: improvedPrompt,
            originalLength: prompt.length,
            improvedLength: improvedPrompt.length
        });

    } catch (error) {
        console.error('Error improving prompt:', error);
        
        if (error.status === 401) {
            return res.status(500).json({ 
                success: false, 
                error: 'API configuration error. Please check your API key.' 
            });
        }
        
        if (error.status === 429) {
            return res.status(429).json({ 
                success: false, 
                error: 'Rate limit exceeded. Please try again in a moment.' 
            });
        }

        return res.status(500).json({ 
            success: false, 
            error: 'Failed to improve prompt. Please try again.' 
        });
    }
}