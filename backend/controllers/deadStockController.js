const Inventory = require('../models/Inventory');
const Sales = require('../models/Sales');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        sales.forEach((sale) => {
            if (!itemSalesMap[sale.itemName]) {
                itemSalesMap[sale.itemName] = {
                    totalQuantitySold: 0,
                    totalRevenue: 0,
                    salesCount: 0,
                };
            }
            itemSalesMap[sale.itemName].totalQuantitySold += sale.quantity;
            itemSalesMap[sale.itemName].totalRevenue += sale.totalAmount;
            itemSalesMap[sale.itemName].salesCount += 1;
        });

        // Prepare data for Gemini analysis
        const inventoryAnalysisData = inventory.map((item) => {
            const salesData = itemSalesMap[item.itemName] || {
                totalQuantitySold: 0,
                totalRevenue: 0,
                salesCount: 0,
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
                turnover_ratio: salesData.totalQuantitySold > 0 ? (salesData.totalQuantitySold / item.quantity).toFixed(2) : 0,
            };
        });

        // Create prompt for Gemini
        const prompt = `You are a business inventory analyst. Analyze the following inventory and sales data to identify "dead stock" - items that are not selling well compared to others.

Inventory and Sales Data:
${JSON.stringify(inventoryAnalysisData, null, 2)}

Based on this data:
1. Identify items that are dead stock (low sales, poor turnover, high inventory relative to sales)
2. For each dead stock item, provide:
   - Item name
   - Current quantity in stock
   - Sales count and total quantity sold
   - Reason why it's considered dead stock
   - Suggested action (reduce price, remove, promote, etc.)
3. Provide an overall analysis and recommendations

Format your response as a JSON object with this structure:
{
  "deadStockAlerts": [
    {
      "itemName": "string",
      "risk_level": "high/medium/low",
      "currentStock": number,
      "salesCount": number,
      "quantitySold": number,
      "reason": "string",
      "recommendation": "string",
      "urgency": "string"
    }
  ],
  "overallAnalysis": "string",
  "summary": "string"
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response
        let analysisResult;
        try {
            // Try to find JSON in the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            } else {
                analysisResult = {
                    deadStockAlerts: [],
                    overallAnalysis: responseText,
                    summary: 'Could not parse structured analysis',
                };
            }
        } catch (parseError) {
            analysisResult = {
                deadStockAlerts: [],
                overallAnalysis: responseText,
                summary: 'Analysis completed with custom format',
            };
        }

        res.status(200).json({
            message: 'Dead stock analysis completed',
            inventoryData: inventoryAnalysisData,
            ...analysisResult,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error analyzing dead stock',
            error: err.message,
        });
    }
};
