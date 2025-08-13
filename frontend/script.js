document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const originalPrompt = document.getElementById('originalPrompt');
    const improvedPrompt = document.getElementById('improvedPrompt');
    const improveBtn = document.getElementById('improveBtn');
    const copyBtn = document.getElementById('copyBtn');
    const explainBtn = document.getElementById('explainBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');
    const outputSection = document.getElementById('outputSection');
    const improvementsExplanation = document.getElementById('improvementsExplanation');
    const improvementsList = document.getElementById('improvementsList');
    const originalCount = document.getElementById('originalCount');
    const improvedCount = document.getElementById('improvedCount');
    const infoBtn = document.getElementById('infoBtn');
    const aboutSection = document.getElementById('aboutSection');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingSubmessage = document.getElementById('loadingSubmessage');

    // Fun loading messages
    const loadingMessages = [
        { main: "🧬 Evolving your prompt...", sub: "Teaching AI the art of communication" },
        { main: "🔮 Consulting the prompt wizards...", sub: "They know all the magic words" },
        { main: "🎭 Adding dramatic flair...", sub: "Your prompt deserves an Oscar" },
        { main: "🚀 Launching into prompt space...", sub: "Houston, we have better communication" },
        { main: "🧠 Feeding your prompt brain food...", sub: "It's getting smarter by the second" },
        { main: "✨ Sprinkling AI fairy dust...", sub: "Making the ordinary extraordinary" },
        { main: "🔧 Fine-tuning the verbal engine...", sub: "Maximum efficiency, minimum confusion" },
        { main: "🎨 Painting with words...", sub: "Van Gogh would be proud" },
        { main: "🎯 Aiming for prompt perfection...", sub: "Bullseye incoming..." },
        { main: "🧙‍♂️ Casting improvement spells...", sub: "Abracadabra, better prompts!" }
    ];

    let messageInterval;

    // Info button toggle
    infoBtn.addEventListener('click', function() {
        if (aboutSection.style.display === 'none') {
            aboutSection.style.display = 'block';
            infoBtn.querySelector('.info-text').textContent = 'Hide info';
        } else {
            aboutSection.style.display = 'none';
            infoBtn.querySelector('.info-text').textContent = 'How it works';
        }
    });

    // Character counting
    function updateCharCount(textarea, countElement) {
        countElement.textContent = textarea.value.length;
    }

    originalPrompt.addEventListener('input', function() {
        updateCharCount(originalPrompt, originalCount);
        improveBtn.disabled = this.value.trim().length === 0;
    });


    // Improve prompt functionality
    improveBtn.addEventListener('click', async function() {
        const prompt = originalPrompt.value.trim();
        if (!prompt) return;

        // Show fun loading state
        showFunLoading();

        try {
            const response = await fetch('/api/improve-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                improvedPrompt.value = data.improvedPrompt;
                updateCharCount(improvedPrompt, improvedCount);
                
                // Store original for explanation
                window.currentOriginal = prompt;
                window.currentImproved = data.improvedPrompt;
                
                showOutput();
            } else {
                throw new Error(data.error || 'Failed to improve prompt');
            }
        } catch (error) {
            console.error('Error improving prompt:', error);
            alert('Sorry, there was an error improving your prompt. Please try again.');
        } finally {
            hideFunLoading();
        }
    });

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(improvedPrompt.value);
            showCopySuccess();
        } catch (error) {
            // Fallback for older browsers
            improvedPrompt.select();
            document.execCommand('copy');
            showCopySuccess();
        }
    });

    // Explain improvements functionality
    explainBtn.addEventListener('click', async function() {
        if (!window.currentOriginal || !window.currentImproved) return;
        
        explainBtn.disabled = true;
        explainBtn.textContent = 'Explaining...';
        
        try {
            const response = await fetch('/api/explain-improvements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    original: window.currentOriginal,
                    improved: window.currentImproved
                })
            });

            const data = await response.json();
            
            if (data.success) {
                showExplanations(data.improvements);
            } else {
                throw new Error(data.error || 'Failed to get explanations');
            }
        } catch (error) {
            console.error('Error getting explanations:', error);
            alert('Sorry, there was an error getting explanations. Please try again.');
        } finally {
            explainBtn.disabled = false;
            explainBtn.textContent = '💡 Explain What Changed';
        }
    });

    // New prompt functionality
    newPromptBtn.addEventListener('click', function() {
        originalPrompt.value = '';
        improvedPrompt.value = '';
        updateCharCount(originalPrompt, originalCount);
        updateCharCount(improvedPrompt, improvedCount);
        hideOutput();
        hideExplanations();
        improveBtn.disabled = true;
        originalPrompt.focus();
    });

    // Helper functions
    function setLoadingState(loading) {
        improveBtn.disabled = loading;
        const btnText = improveBtn.querySelector('.btn-text');
        const btnLoading = improveBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            improveBtn.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            improveBtn.classList.remove('loading');
        }
    }

    function showOutput() {
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function hideOutput() {
        outputSection.style.display = 'none';
    }

    function showExplanations(improvements) {
        improvementsList.innerHTML = '';
        improvements.forEach(improvement => {
            const item = document.createElement('div');
            item.className = 'improvement-item';
            item.innerHTML = `
                <div class="improvement-title">${improvement.title}</div>
                <div class="improvement-description">${improvement.description}</div>
            `;
            improvementsList.appendChild(item);
        });
        improvementsExplanation.style.display = 'block';
    }

    function hideExplanations() {
        improvementsExplanation.style.display = 'none';
    }

    function showCopySuccess() {
        const copyText = copyBtn.querySelector('.copy-text');
        const copySuccess = copyBtn.querySelector('.copy-success');
        
        copyText.style.display = 'none';
        copySuccess.style.display = 'inline';
        
        setTimeout(() => {
            copyText.style.display = 'inline';
            copySuccess.style.display = 'none';
        }, 2000);
    }

    // Enter key handling
    originalPrompt.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (!improveBtn.disabled) {
                improveBtn.click();
            }
        }
    });

    // Fun loading functions
    function showFunLoading() {
        loadingOverlay.style.display = 'flex';
        let messageIndex = 0;
        
        // Set initial message
        const initialMessage = loadingMessages[messageIndex];
        loadingMessage.textContent = initialMessage.main;
        loadingSubmessage.textContent = initialMessage.sub;
        
        // Cycle through messages every 2 seconds
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            const message = loadingMessages[messageIndex];
            loadingMessage.textContent = message.main;
            loadingSubmessage.textContent = message.sub;
        }, 2000);
    }

    function hideFunLoading() {
        loadingOverlay.style.display = 'none';
        if (messageInterval) {
            clearInterval(messageInterval);
        }
    }

    // Initial focus
    originalPrompt.focus();
});