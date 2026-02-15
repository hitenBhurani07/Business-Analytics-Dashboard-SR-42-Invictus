const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.useMockData = true;
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  // Mock seasonal data generator (intelligent patterns)
  // Mock seasonal data generator (intelligent patterns)
  getMockSeasonalData(businessType, itemName, category) {
    console.log(` Generating mock seasonal data for: ${itemName} (${businessType}/${category})`);

    const itemLower = itemName.toLowerCase();
    let multipliers = { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 };
    let recommendations = '';
    let peakSeason = 'spring';
    let lowSeason = 'winter';
    let demandPattern = 'medium';

    // Check for all-season items first (consistent demand all year)
    const allSeasonKeywords = ['milk', 'flour', 'salt', 'sugar', 'rice', 'wheat', 'oil', 'ghee', 'butter', 'curd', 'yogurt', 'cheese', 'paneer', 'bread', 'soap', 'shampoo', 'toothpaste', 'pepper', 'spice', 'masala', 'turmeric', 'basic', 'essential', 'everyday', 'egg', 'water', 'dal', 'lentil', 'staple', 'daily'];

    if (allSeasonKeywords.some(keyword => itemLower.includes(keyword))) {
      multipliers = { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 };
      demandPattern = 'all-year';
      peakSeason = 'spring';
      lowSeason = 'spring';
      recommendations = `${itemName} is an essential item with consistent demand all year round. Maintain steady stock levels!`;
    }
    // Smart patterns based on business type and item
    else if (businessType === 'restaurant' || businessType === 'cafe' || businessType === 'food') {
      if (itemLower.includes('cold') || itemLower.includes('ice') || itemLower.includes('cool') || itemLower.includes('coke') || itemLower.includes('pepsi')) {
        multipliers = { spring: 1.3, summer: 2.0, autumn: 1.2, winter: 0.6 };
        peakSeason = 'summer';
        lowSeason = 'winter';
        demandPattern = 'high';
        recommendations = `${itemName} demand peaks in summer (2x). Stock up heavily from March to August!`;
      } else if (itemLower.includes('hot') || itemLower.includes('tea') || itemLower.includes('coffee') || itemLower.includes('chai')) {
        multipliers = { spring: 1.0, summer: 0.6, autumn: 1.3, winter: 1.8 };
        peakSeason = 'winter';
        lowSeason = 'summer';
        demandPattern = 'high';
        recommendations = `${itemName} sells best in winter (1.8x). Increase stock from October onwards!`;
      } else if (itemLower.includes('juice') || itemLower.includes('shake') || itemLower.includes('smoothie')) {
        multipliers = { spring: 1.4, summer: 1.8, autumn: 1.1, winter: 0.7 };
        peakSeason = 'summer';
        lowSeason = 'winter';
        demandPattern = 'high';
        recommendations = `${itemName} popular in summer (1.8x). Boost inventory from February!`;
      } else if (itemLower.includes('chocolate') || itemLower.includes('candy') || itemLower.includes('sweet')) {
        multipliers = { spring: 1.1, summer: 0.8, autumn: 1.2, winter: 1.4 };
        peakSeason = 'winter';
        lowSeason = 'summer';
        demandPattern = 'medium';
        recommendations = `${itemName} sells better in cooler months. Summer heat affects demand.`;
      }
    } else if (businessType === 'retail' || businessType === 'clothing') {
      if (itemLower.includes('winter') || itemLower.includes('sweater') || itemLower.includes('jacket') || itemLower.includes('coat')) {
        multipliers = { spring: 0.5, summer: 0.3, autumn: 1.6, winter: 2.0 };
        peakSeason = 'winter';
        lowSeason = 'summer';
        demandPattern = 'high';
        recommendations = `${itemName} peaks in winter (2x). Stock heavily from September onwards!`;
      } else if (itemLower.includes('summer') || itemLower.includes('cotton') || itemLower.includes('shorts') || itemLower.includes('tshirt')) {
        multipliers = { spring: 1.5, summer: 2.0, autumn: 0.8, winter: 0.4 };
        peakSeason = 'summer';
        lowSeason = 'winter';
        demandPattern = 'high';
        recommendations = `${itemName} summer essential (2x). Build inventory from February!`;
      }
    } else if (businessType === 'electronics' || businessType === 'appliances') {
      if (itemLower.includes('ac') || itemLower.includes('cooler') || itemLower.includes('fan')) {
        multipliers = { spring: 1.6, summer: 2.0, autumn: 1.0, winter: 0.5 };
        peakSeason = 'summer';
        lowSeason = 'winter';
        demandPattern = 'high';
        recommendations = `${itemName} peaks March-June (2x). Prepare inventory from January!`;
      } else if (itemLower.includes('heater') || itemLower.includes('geyser') || itemLower.includes('blower')) {
        multipliers = { spring: 0.6, summer: 0.4, autumn: 1.4, winter: 2.0 };
        peakSeason = 'winter';
        lowSeason = 'summer';
        demandPattern = 'high';
        recommendations = `${itemName} winter essential (2x). Stock from September!`;
      }
    }

    // Default pattern for unmatched items
    if (multipliers.spring === 1.0 && multipliers.summer === 1.0 && demandPattern === 'medium') {
      multipliers = { spring: 1.1, summer: 1.2, autumn: 0.9, winter: 0.8 };
      peakSeason = 'summer';
      lowSeason = 'winter';
      recommendations = `${itemName} shows moderate seasonal variation with slight summer preference.`;
    }

    return {
      seasonalMultipliers: multipliers,
      demandPattern: demandPattern,
      recommendations: recommendations,
      peakSeason: peakSeason,
      lowSeason: lowSeason
    };
  }

  // Analyze seasonal demand for an item
  async analyzeSeasonalDemand(businessType, itemName, category, currentQuantity, dailyUsage) {
    try {
      // Use mock data if billing not enabled
      if (this.useMockData) {
        console.log(' Using intelligent mock data (Enable billing for real AI analysis)');
        const mockData = this.getMockSeasonalData(businessType, itemName, category);

        // Simulate API delay for realistic feel
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          success: true,
          data: mockData
        };
      }

      // Real AI analysis (when billing enabled)
      // Real AI analysis (when billing enabled)
      const prompt = `
You are an expert business analyst specializing in inventory management for small businesses.

Business Type: ${businessType}
Item Name: ${itemName}
Category: ${category || 'general'}
Current Quantity: ${currentQuantity}
Average Daily Usage: ${dailyUsage}

CRITICAL INSTRUCTIONS:
1. Analyze this item's seasonal demand pattern based on typical consumer behavior
2. Identify which season has PEAK demand and which has LOWEST demand
3. For all-year items (rice, milk, flour, salt, bread, eggs, basic groceries), set ALL multipliers to 1.0 and demandPattern to "all-year"
4. Provide recommendations in ENGLISH ONLY (no Hindi/Hinglish)

Examples:
- Cold drinks: Peak=summer (2.0x), Low=winter (0.6x)
- Hot coffee: Peak=winter (1.8x), Low=summer (0.6x)
- Ice cream: Peak=summer (2.0x), Low=winter (0.5x)
- Winter jackets: Peak=winter (2.0x), Low=summer (0.3x)
- Rice/Milk/Flour: All seasons 1.0x, demandPattern="all-year"

Provide ONLY a JSON response (no markdown, no backticks, no explanation) with this exact structure:
{
  "seasonalMultipliers": {
    "spring": <number between 0.3 to 2.0>,
    "summer": <number between 0.3 to 2.0>,
    "autumn": <number between 0.3 to 2.0>,
    "winter": <number between 0.3 to 2.0>
  },
  "demandPattern": "<high/medium/low/all-year>",
  "recommendations": "<1-2 line recommendation in ENGLISH explaining peak season and strategy>",
  "peakSeason": "<spring/summer/autumn/winter>",
  "lowSeason": "<spring/summer/autumn/winter>"
}

MULTIPLIER RULES:
- 2.0 = Peak season (very high demand)
- 1.5 = High demand
- 1.0 = Normal demand OR all-year items
- 0.7 = Low demand
- 0.5 = Off-season (very low demand)
- 0.3 = Minimal demand

For all-year items: Set spring=1.0, summer=1.0, autumn=1.0, winter=1.0, demandPattern="all-year", peakSeason="spring", lowSeason="spring"
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiAnalysis = JSON.parse(text);

      return {
        success: true,
        data: aiAnalysis
      };

    } catch (error) {
      console.error('AI Analysis Error:', error.message);

      // Fallback to mock data
      const mockData = this.getMockSeasonalData(businessType, itemName, category);
      return {
        success: true,
        data: mockData
      };
    }
  }

  // Calculate optimal reorder point based on season
  calculateReorderPoint(baseReorderPoint, seasonalMultiplier, dailyUsage) {
    let adjustedReorderPoint = Math.ceil(baseReorderPoint * seasonalMultiplier);
    const safetyStock = Math.ceil(dailyUsage * 7);
    return Math.max(adjustedReorderPoint, safetyStock, 5);
  }

  // Bulk analyze all inventory items for a user
  async analyzeAllInventory(userId, businessType, inventoryItems) {
    try {
      const currentSeason = this.getCurrentSeason();
      const results = [];

      for (const item of inventoryItems) {
        const analysis = await this.analyzeSeasonalDemand(
          businessType,
          item.itemName,
          item.category,
          item.quantity,
          item.dailyUsage
        );

        const currentMultiplier = analysis.data.seasonalMultipliers[currentSeason];
        const newReorderPoint = this.calculateReorderPoint(
          item.baseReorderPoint,
          currentMultiplier,
          item.dailyUsage
        );

        results.push({
          itemId: item._id,
          itemName: item.itemName,
          oldReorderPoint: item.reorderPoint,
          newReorderPoint: newReorderPoint,
          seasonalMultipliers: analysis.data.seasonalMultipliers,
          currentSeason: currentSeason,
          aiInsights: {
            lastAnalyzed: new Date(),
            recommendations: analysis.data.recommendations,
            demandPattern: analysis.data.demandPattern,
            peakSeason: analysis.data.peakSeason,
            lowSeason: analysis.data.lowSeason
          }
        });

        // Small delay between items
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      return {
        success: true,
        results: results,
        currentSeason: currentSeason
      };

    } catch (error) {
      console.error('Bulk Analysis Error:', error);
      return {
        success: false,
        message: 'Failed to analyze inventory',
        error: error.message
      };
    }
  }
}

module.exports = new AIService();