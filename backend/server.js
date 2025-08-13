const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Read API key from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const apiKey = envContent.match(/OPENAI_API_KEY=(.+)/)[1];

// Get content type based on file extension
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json'
    };
    return mimeTypes[ext] || 'text/plain';
}

// Server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoint
    if (pathname === '/api/improve-prompt' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { prompt } = JSON.parse(body);

                if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Please provide a valid prompt' }));
                    return;
                }

                const systemPrompt = `You are a prompt engineering expert. Transform the user's rough prompt into a highly effective one using these principles:

1. Add clear context and role definition
2. Specify the exact output format wanted
3. Include relevant constraints and requirements
4. Add examples if they would help
5. Make instructions unambiguous
6. Specify tone, audience, length when relevant

Take this rough prompt and dramatically improve it. Return only the improved prompt, nothing else.`;

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        max_tokens: 1000,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: prompt.trim() }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.status}`);
                }

                const data = await response.json();
                const improvedPrompt = data.choices[0].message.content.trim();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    improvedPrompt: improvedPrompt,
                    originalLength: prompt.length,
                    improvedLength: improvedPrompt.length
                }));

            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to improve prompt' }));
            }
        });
        return;
    }

    // Explain improvements endpoint
    if (pathname === '/api/explain-improvements' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { original, improved } = JSON.parse(body);

                if (!original || !improved) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing original or improved prompt' }));
                    return;
                }

                const systemPrompt = `Compare the original prompt with the improved prompt and identify the key improvements made. Return a JSON array of improvement objects, each with "title" and "description" fields.

Focus on these types of improvements:
- Added context or role definition
- Specified output format
- Added constraints or requirements
- Improved clarity and specificity
- Added examples or guidance
- Defined tone, audience, or length

Be specific about what was added or changed.`;

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        max_tokens: 800,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: `Original: "${original}"\n\nImproved: "${improved}"` }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.status}`);
                }

                const data = await response.json();
                let improvements;
                
                try {
                    improvements = JSON.parse(data.choices[0].message.content.trim());
                } catch {
                    // Fallback if JSON parsing fails
                    improvements = [
                        {
                            title: "General Improvements",
                            description: data.choices[0].message.content.trim()
                        }
                    ];
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    improvements: improvements
                }));

            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to explain improvements' }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? '../frontend/index.html' : `../frontend${pathname}`;
    
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
    } else {
        res.writeHead(404);
        res.end('File not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`🧬 Evolve running at http://localhost:${port}`);
    console.log('✅ Frontend and backend both running!');
    console.log('📱 Open http://localhost:3000 in your browser to test');
    console.log('🚀 Transform Your Prompts, Amplify Your Results');
});