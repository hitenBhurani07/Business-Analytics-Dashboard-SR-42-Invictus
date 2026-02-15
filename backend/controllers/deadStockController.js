const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const axios = require('axios');

// Fallback function to generate default business solutions
const generateDefaultSolutions = (itemName, originalItem, topSellingItems) => {
    const sellingPrice = originalItem?.sellingPrice || 100;
    const costPrice = originalItem?.costPrice || 50;
    const discountPrice = Math.round(sellingPrice * 0.6); // 40% discount
    const bundleDiscount = Math.round((sellingPrice * 1.5) * 0.85); // Bundle at 15% off 1.5x price

    return [
        {
            title: '📦 Bundle with Best-Sellers',
            description: `Create attractive bundles combining "${itemName}" with top-selling items like ${topSellingItems}. Offer bundle at Rs ${bundleDiscount} (save Rs ${Math.round(sellingPrice * 0.3)} per bundle). This encourages customers to buy dead stock with proven bestsellers.`,
            expectedOutcome: 'Move 40-60% of dead stock within 2-3 weeks while maintaining profit margins',
            category: 'bundling'
        },
        {
            title: '💰 Seasonal Flash Sale',
            description: `Launch a limited-time discount campaign: Reduce "${itemName}" to Rs ${discountPrice} (40% off). Promote as "Last Stock Clearance" or "Seasonal Close-out". Set a deadline (e.g., "This weekend only") to create urgency.`,
            expectedOutcome: 'Clear 30-50% of inventory with bulk buyer interest',
            category: 'discount'
        },
        {
            title: '🔗 Cross-Sell with Complementary Items',
            description: `Identify products that complement "${itemName}" in customer journey. Offer combo deals: Buy bestseller, get "${itemName}" at 50% off. Train sales staff to recommend this combo. Use point-of-sale promotions.`,
            expectedOutcome: 'Increase basket size by 25-35% while clearing dead stock',
            category: 'crosssell'
        },
        {
            title: '🎁 Gift with Purchase Promotion',
            description: `Use "${itemName}" as a free gift for purchases above Rs ${sellingPrice * 2}. Customers feel they're getting bonus value, and you clear stock. Create attractive gift packaging to enhance perceived value.`,
            expectedOutcome: 'Move 50-70% of stock; increase average order value by 15-20%',
            category: 'promotion'
        },
        {
            title: '📱 Bulk/Wholesale Offer',
            description: `Approach local retailers, corporate bulk buyers, or resellers with special wholesale pricing. Offer 30-35% discount on bulk orders (e.g., buy 50+ units). Recovering cost price is better than holding dead stock.`,
            expectedOutcome: 'Clear 60-80% of inventory in 1-2 weeks through bulk sales',
            category: 'bulk'
        }
    ];
};

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
                const waitTime = attempt * 3000;
                console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                
                if (attempt <= maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
            }
            
            throw err;
        }
    }
    
    throw lastError;
};

exports.analyzeDeadStock = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all inventory and sales for the user
        const [inventory, sales] = await Promise.all([
            Inventory.find({ ownerId: userId }),
            Sales.find({ ownerId: userId }),
        ]);

        if (inventory.length === 0) {
            return res.status(200).json({
                message: 'No inventory found',
                deadStockAlerts: [],
                analysis: 'Add inventory items to analyze dead stock',
            });
        }

        // Calculate sales statistics for each item
        const itemSalesMap = {};
        const itemLastSaleMap = {};
        const today = new Date();
        
        sales.forEach((sale) => {
            if (!itemSalesMap[sale.itemName]) {
                itemSalesMap[sale.itemName] = {
                    totalQuantitySold: 0,
                    totalRevenue: 0,
                    salesCount: 0,
                    daysLastSold: 999,
                };
            }
            itemSalesMap[sale.itemName].totalQuantitySold += sale.quantity;
            itemSalesMap[sale.itemName].totalRevenue += sale.totalAmount;
            itemSalesMap[sale.itemName].salesCount += 1;
            
            // Calculate days since last sale
            const saleDate = new Date(sale.createdAt || sale.date);
            const daysSinceSale = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
            itemSalesMap[sale.itemName].daysLastSold = Math.min(itemSalesMap[sale.itemName].daysLastSold, daysSinceSale);
        });

        // Prepare data for Mistral analysis
        const inventoryAnalysisData = inventory.map((item) => {
            const salesData = itemSalesMap[item.itemName] || {
                totalQuantitySold: 0,
                totalRevenue: 0,
                salesCount: 0,
                daysLastSold: 999,
            };
            return {
                itemName: item.itemName,
                quantity: item.quantity,
                costPrice: item.costPrice,
                sellingPrice: item.sellingPrice,
                profit_margin: ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100).toFixed(2),
                totalQuantitySold: salesData.totalQuantitySold,
                totalRevenue: salesData.totalRevenue,
                salesCount: salesData.salesCount,
                daysLastSold: salesData.daysLastSold,
                turnover_ratio: salesData.totalQuantitySold > 0 ? (salesData.totalQuantitySold / item.quantity).toFixed(2) : 0,
            };
        });

        // Create detailed prompt for Mistral analysis
        const analysisPrompt = `You are a business inventory and sales analyst. Analyze the following inventory and sales data to identify "dead stock" - items that are not selling well or not selling regularly.

Inventory and Sales Data:
${JSON.stringify(inventoryAnalysisData, null, 2)}

Important: Calculate high-demand items (items with high sales volume/frequency) and identify which are the top sellers. This will help generate bundle recommendations.

A dead stock item is identified by:
1. Low or zero sales (salesCount = 0 or very low >= 5)
2. Not sold recently (daysLastSold > 30)
3. Poor turnover ratio (turnover_ratio < 0.3)
4. High inventory relative to sales (quantity > 50 with low sales)

For each dead stock item identified, provide:
- Item name
- Current quantity in stock
- Sales count and total quantity sold
- Days since last sale
- Reason why it's dead stock
- Risk level (high/medium/low)

Also provide:
- List of top-selling items that could be bundled with dead stock
- Recommendations for combining dead stock with high-demand products

Format response as JSON ONLY (no other text):
{
  "deadStockAlerts": [
    {
      "itemName": "string",
      "risk_level": "high/medium/low",
      "currentStock": number,
      "salesCount": number,
      "quantitySold": number,
      "daysLastSold": number,
      "reason": "string",
      "urgency": "string"
    }
  ],
  "topSellingItems": ["item1", "item2", "item3"],
  "overallAnalysis": "string",
  "summary": "string"
}`;

        console.log('Analyzing dead stock with Mistral...');
        const analysisResponse = await callMistralWithRetry(analysisPrompt);
        
        let analysisResult;
        try {
            const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            } else {
                analysisResult = {
                    deadStockAlerts: [],
                    overallAnalysis: analysisResponse,
                    summary: 'Analysis completed',
                };
            }
        } catch (parseError) {
            analysisResult = {
                deadStockAlerts: [],
                overallAnalysis: analysisResponse,
                summary: 'Analysis completed with custom format',
            };
        }

        // Generate customized business solutions for each dead stock item
        console.log('Generating business solutions...');
        const deadStockAlertsWithSolutions = await Promise.all(
            (analysisResult.deadStockAlerts || []).map(async (alert) => {
                try {
                    // Find the original inventory item for more context
                    const originalItem = inventory.find(i => i.itemName === alert.itemName);
                    
                    // Get top selling items to recommend for bundling
                    const topSells = analysisResult.topSellingItems || inventoryAnalysisData
                        .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
                        .slice(0, 3)
                        .map(item => item.itemName)
                        .join(', ');

                    const solutionPrompt = `You are a retail business strategist specializing in dead stock management and inventory optimization.

DEAD STOCK ITEM TO SOLVE:
- Product Name: "${alert.itemName}"
- Current Stock: ${alert.currentStock} units
- Selling Price: Rs ${originalItem?.sellingPrice || 100}
- Cost Price: Rs ${originalItem?.costPrice || 50}
- Days Since Last Sale: ${alert.daysLastSold} days
- Total Sales: ${alert.salesCount}
- Profit Margin: ${originalItem?.profit_margin || 50}%

TOP SELLING ITEMS TO BUNDLE WITH: ${topSells || 'Various high-demand products'}

Generate 5 SPECIFIC, ACTIONABLE, CREATIVE business solutions to move this dead stock. Focus heavily on:
1. Bundle deals with high-demand items
2. Cross-selling strategies
3. Discount/promotional schemes
4. Customer pairing strategies
5. Seasonal or special occasion bundling

Make solutions practical for a retail business. Include specific percentage discounts or pricing strategies.

IMPORTANT: Return ONLY valid JSON array, no other text:
[
  {
    "title": "Bundle with High-Demand Item",
    "description": "Detailed action steps and strategy",
    "expectedOutcome": "Specific outcome (e.g., 'Move 50% of stock in 2 weeks')",
    "category": "bundling/discount/crosssell/promotion/seasonal"
  }
]`;

                    const solutionResponse = await callMistralWithRetry(solutionPrompt);
                    let solutions = [];
                    
                    try {
                        const jsonMatch = solutionResponse.match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[0]);
                            solutions = Array.isArray(parsed) ? parsed : [];
                        }
                    } catch (e) {
                        console.error('Error parsing solutions:', e.message);
                        // Fallback: Generate default solutions
                        solutions = generateDefaultSolutions(alert.itemName, originalItem, topSells);
                    }

                    // Fallback if solutions are empty
                    if (!solutions || solutions.length === 0) {
                        solutions = generateDefaultSolutions(alert.itemName, originalItem, topSells);
                    }

                    return {
                        ...alert,
                        solutions: solutions.slice(0, 5), // Max 5 solutions
                    };
                } catch (err) {
                    console.error('Error generating solutions for', alert.itemName, ':', err.message);
                    return {
                        ...alert,
                        solutions: [],
                    };
                }
            })
        );

        res.status(200).json({
            message: 'Dead stock analysis completed with business solutions',
            inventoryData: inventoryAnalysisData,
            deadStockAlerts: deadStockAlertsWithSolutions,
            overallAnalysis: analysisResult.overallAnalysis,
            summary: analysisResult.summary,
        });
    } catch (err) {
        console.error('Dead stock analysis error:', err.message);
        res.status(500).json({
            message: 'Error analyzing dead stock',
            error: err.message,
        });
    }
};
