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
  getMockSeasonalData(businessType, itemName, category) {
    console.log(` Generating mock seasonal data for: ${itemName} (${businessType}/${category})`);
    
    const itemLower = itemName.toLowerCase();
    let multipliers = { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 };
    let recommendations = '';
    let isAllSeasonItem = false;

    // Check for all-season items first (consistent demand all year)
    const allSeasonKeywords = ['milk', 'flour', 'salt', 'sugar', 'rice', 'wheat', 'oil', 'ghee', 'butter', 'curd', 'yogurt', 'cheese', 'paneer', 'bread', 'soap', 'shampoo', 'toothpaste', 'pepper', 'spice', 'masala', 'turmeric', 'basic', 'essential', 'everyday', 'egg', 'water', 'dal', 'lentil', 'staple', 'daily'];
    if (allSeasonKeywords.some(keyword => itemLower.includes(keyword))) {
      multipliers = { spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.0 };
      isAllSeasonItem = true;
      recommendations = `${itemName} is an essential item with consistent demand all year round. Maintain steady stock levels!`;
    }
    // Smart patterns based on business type and item
    else if (businessType === 'restaurant' || businessType === 'cafe' || businessType === 'food') {
      if (itemLower.includes('cold') || itemLower.includes('ice') || itemLower.includes('cool')) {
        multipliers = { spring: 1.3, summer: 2.0, autumn: 1.2, winter: 0.6 };
        recommendations = `${itemName} Demand is very high in summer (2x). Keep double the stock from March to August!`;
      } else if (itemLower.includes('hot') || itemLower.includes('tea') || itemLower.includes('coffee')) {
        multipliers = { spring: 1.0, summer: 0.6, autumn: 1.3, winter: 1.8 };
        recommendations = `${itemName} Sells best in winter (1.8x). Stock up from September onwards!`;
      } else if (itemLower.includes('juice') || itemLower.includes('shake')) {
        multipliers = { spring: 1.4, summer: 1.8, autumn: 1.1, winter: 0.7 };
        recommendations = `${itemName} Popular in summer (1.8x) and spring (1.4x). Increase stock from February!`;
      }
    } else if (businessType === 'retail' || businessType === 'clothing') {
      if (itemLower.includes('winter') || itemLower.includes('sweater') || itemLower.includes('jacket')) {
        multipliers = { spring: 0.5, summer: 0.3, autumn: 1.6, winter: 2.0 };
        recommendations = `${itemName} Peak demand is in winter (2x). Stock up from August onwards!`;
      } else if (itemLower.includes('summer') || itemLower.includes('cotton') || itemLower.includes('shorts')) {
        multipliers = { spring: 1.5, summer: 2.0, autumn: 0.8, winter: 0.4 };
        recommendations = `${itemName} Summer peak (2x). Increase stock from January for March onwards!`;
      }
    } else if (businessType === 'electronics' || businessType === 'appliances') {
      if (itemLower.includes('ac') || itemLower.includes('cooler') || itemLower.includes('fan')) {
        multipliers = { spring: 1.6, summer: 2.0, autumn: 1.0, winter: 0.5 };
        recommendations = `${itemName} Peak season is March-June (2x). Stock up from January!`;
      } else if (itemLower.includes('heater') || itemLower.includes('geyser')) {
        multipliers = { spring: 0.6, summer: 0.4, autumn: 1.4, winter: 2.0 };
        recommendations = `${itemName} Best in winter (2x). Be ready by August!`;
      }
    }

    if (!isAllSeasonItem && multipliers.spring === 1.0 && multipliers.summer === 1.0) {
      multipliers = { spring: 1.1, summer: 1.2, autumn: 0.9, winter: 0.8 };
      recommendations = `${itemName} Moderate seasonal variation. Slight increase in summer!`;
    }

    const peakSeason = Object.keys(multipliers).reduce((a, b) => 
      multipliers[a] > multipliers[b] ? a : b
    );
    const lowSeason = Object.keys(multipliers).reduce((a, b) => 
      multipliers[a] < multipliers[b] ? a : b
    );

    // Calculate dynamic demand pattern based on multiplier variation
    const maxMultiplier = multipliers[peakSeason];
    const minMultiplier = multipliers[lowSeason];
    const variation = maxMultiplier - minMultiplier;
    
    let demandPattern = 'medium';
    if (isAllSeasonItem) {
      demandPattern = 'all-year';
    } else if (maxMultiplier >= 1.8 || variation >= 1.2) {
      demandPattern = 'high';
    } else if (maxMultiplier <= 1.1 && variation <= 0.5) {
      demandPattern = 'low';
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
      const prompt = `
You are an expert business analyst specializing in inventory management for small businesses in India.

Business Type: ${businessType}
Item Name: ${itemName}
Category: ${category || 'general'}
Current Quantity: ${currentQuantity}
Average Daily Usage: ${dailyUsage}

Analyze this item's seasonal demand pattern for a ${businessType} business in India.

Provide ONLY a JSON response (no markdown, no explanation) with this exact structure:
{
  "seasonalMultipliers": {
    "spring": <number between 0.5 to 2.0>,
    "summer": <number between 0.5 to 2.0>,
    "autumn": <number between 0.5 to 2.0>,
    "winter": <number between 0.5 to 2.0>
  },
  "demandPattern": "<high/medium/low>",
  "recommendations": "<brief 1-2 line recommendation in Hinglish>",
  "peakSeason": "<spring/summer/autumn/winter>",
  "lowSeason": "<spring/summer/autumn/winter>"
}

Multiplier Guide:
- 2.0 = Very high demand (double the base stock)
- 1.5 = High demand (50% more stock)
- 1.0 = Normal demand (base stock)
- 0.7 = Low demand (30% less stock)
- 0.5 = Very low demand (half the base stock)

Consider Indian climate, festivals, and typical consumption patterns for ${businessType}.
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