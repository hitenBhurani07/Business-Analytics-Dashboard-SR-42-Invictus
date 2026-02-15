const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper function to call Mistral API with retry logic
const callMistralWithRetry = async (prompt, maxRetries = 2) => {
    let lastError;
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
        throw new Error('MISTRAL_API_KEY environment variable not set');
    }
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            console.log(`Mistral API call attempt ${attempt}/${maxRetries + 1}`);
            const response = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                    model: 'mistral-small-latest',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            return response.data.choices[0].message.content;
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${attempt} failed:`, err.message);
            
            // If rate limited, wait and retry
            if (err.response?.status === 429) {
                const waitTime = attempt * 3000; // 3s, 6s, 9s
                console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                
                if (attempt <= maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
            }
            
            // For other errors, throw immediately
            throw err;
        }
    }
    
    throw lastError;
};

// Process inventory voice input
router.post('/process-inventory', async (req, res) => {
    try {
        const { text } = req.body;
        
        console.log('Inventory voice input:', text?.substring(0, 50) + '...');
        
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No speech detected' });
        }

        const prompt = `Extract inventory data from this voice transcription. The user may speak any language or format.
        
Transcription: "${text}"

Please extract ONLY these fields if mentioned in the speech:
- itemName: The name of the product/item
- quantity: The number of units (numeric)
- costPrice: The cost price per unit (numeric)
- sellingPrice: The selling/retail price per unit (numeric)

Return ONLY a valid JSON object with these fields. Use null for missing values. Do not add explanations.
Example format: {"itemName": "pen", "quantity": 100, "costPrice": 5, "sellingPrice": 8}`;

        const content = await callMistralWithRetry(prompt);
        console.log('Mistral response:', content?.substring(0, 100) + '...');
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('No JSON found in response:', content);
            return res.status(400).json({ error: 'Could not extract data from AI response' });
        }

        const extracted = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data: extracted });
    } catch (err) {
        console.error('Inventory voice processing error:', err.message);
        console.error('Error response:', err.response?.data);
        
        const status = err.response?.status || 500;
        const errorMsg = err.response?.data?.error?.message || err.message;
        
        res.status(status).json({
            error: 'Failed to process voice input',
            details: errorMsg
        });
    }
});

// Process sales voice input
router.post('/process-sales', async (req, res) => {
    try {
        const { text } = req.body;
        
        console.log('Sales voice input:', text?.substring(0, 50) + '...');
        
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No speech detected' });
        }

        const prompt = `Extract sales data from this voice transcription. The user may speak any language or format.
        
Transcription: "${text}"

Please extract ONLY these fields if mentioned in the speech:
- itemName: The name of the product/item sold
- quantity: The number of units sold (numeric)
- totalAmount: The total sale amount/price (numeric)

Return ONLY a valid JSON object with these fields. Use null for missing values. Do not add explanations.
Example format: {"itemName": "pen", "quantity": 10, "totalAmount": 80}`;

        const content = await callMistralWithRetry(prompt);
        console.log('Mistral response:', content?.substring(0, 100) + '...');
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('No JSON found in response:', content);
            return res.status(400).json({ error: 'Could not extract data from AI response' });
        }

        const extracted = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data: extracted });
    } catch (err) {
        console.error('Sales voice processing error:', err.message);
        console.error('Error response:', err.response?.data);
        
        const status = err.response?.status || 500;
        const errorMsg = err.response?.data?.error?.message || err.message;
        
        res.status(status).json({
            error: 'Failed to process voice input',
            details: errorMsg
        });
    }
});

// Process expense voice input
router.post('/process-expenses', async (req, res) => {
    try {
        const { text } = req.body;
        
        console.log('Expense voice input:', text?.substring(0, 50) + '...');
        
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'No speech detected' });
        }

        const validCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Office Supplies', 'Travel', 'Other'];
        
        const prompt = `Extract expense data from this voice transcription. The user may speak any language or format.
        
Transcription: "${text}"

Please extract ONLY these fields if mentioned in the speech:
- title: The name/description of the expense
- amount: The expense amount (numeric)
- category: The expense category. MUST be one of: ${validCategories.join(', ')}. If unclear, use "Other".

Return ONLY a valid JSON object with these fields. Use null for title/amount if not detected, but always include category.
Example format: {"title": "office rent", "amount": 500, "category": "Rent"}`;

        const content = await callMistralWithRetry(prompt);
        console.log('Mistral response:', content?.substring(0, 100) + '...');
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error('No JSON found in response:', content);
            return res.status(400).json({ error: 'Could not extract data from AI response' });
        }

        const extracted = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data: extracted });
    } catch (err) {
        console.error('Expense voice processing error:', err.message);
        console.error('Error response:', err.response?.data);
        
        const status = err.response?.status || 500;
        const errorMsg = err.response?.data?.error?.message || err.message;
        
        res.status(status).json({
            error: 'Failed to process voice input',
            details: errorMsg
        });
    }
});

module.exports = router;
