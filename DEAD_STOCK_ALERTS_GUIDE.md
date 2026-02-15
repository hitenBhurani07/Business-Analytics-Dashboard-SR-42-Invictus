# Dead Stock Alerts Implementation Guide

## Overview
The Dead Stock Alerts feature uses **Mistral AI API** to intelligently identify non-selling inventory items and provide actionable business solutions to move dead stock. The system combines inventory analysis with AI-powered recommendations that focus on bundling, cross-selling, discounting, and promotional strategies.

## Features

### 1. **Intelligent Dead Stock Detection**
- Analyzes inventory and sales data for each user
- Identifies dead stock based on:
  - Low or zero sales (salesCount = 0 or very low)
  - Not sold recently (daysLastSold > 30 days)
  - Poor turnover ratio (turnover_ratio < 0.3)
  - High inventory relative to sales

### 2. **Risk Level Classification**
- **HIGH**: Urgent attention required - immediate action recommended
- **MEDIUM**: Moderate concern - action recommended within 1-2 weeks
- **LOW**: Minor issue - monitor and consider strategies

### 3. **AI-Powered Business Solutions**
Each dead stock item receives up to 5 tailored business solutions:
- 📦 **Bundle with Best-Sellers**: Combine with high-performing items
- 💰 **Seasonal Flash Sale**: Limited-time discount campaigns
- 🔗 **Cross-Sell Strategies**: Recommend complementary items to customers
- 🎁 **Gift with Purchase**: Use as incentive for larger orders
- 📱 **Bulk/Wholesale Offers**: Target retailers and resellers

### 4. **Category Color-Coding**
Solutions are color-coded by strategy type for quick visual identification:
- Blue: 📦 Bundling strategies
- Yellow: 💰 Discount approaches
- Green: 🔗 Cross-selling tactics
- Purple: 🎁 Promotional campaigns
- Orange: 📱 Bulk/Wholesale offers

## Architecture

### Backend Components

#### **deadStockController.js**
- Main analysis engine
- Integrates with Mistral AI API
- Processes inventory and sales data
- Generates business solutions

**Key Functions:**
1. `analyzeDeadStock`: Main analysis endpoint
   - Fetches user inventory and sales
   - Calls Mistral API for dead stock identification
   - Generates 5 business solutions per item
   - Includes fallback solutions if API fails

2. `callMistralWithRetry`: Mistral API integration
   - Implements retry logic (up to 2 retries)
   - Handles rate limiting (429 errors)
   - 10-second timeout per request
   - Temperature set to 0.3 (focused responses)

3. `generateDefaultSolutions`: Fallback solution generator
   - 5 pre-configured business solutions
   - Dynamic pricing calculations
   - Fallback if Mistral API fails

#### **Routes: deadStockRoutes.js**
```javascript
POST /api/deadstock/analyze
- Requires: Authentication token
- Protected by authMiddleware
- Returns: Detailed analysis with solutions
```

### Frontend Components

#### **DeadStockAlerts.jsx**
Interactive UI for dead stock analysis with:
- Analysis trigger button
- Real-time loading state
- Color-coded risk levels
- Detailed inventory metrics
- Solution display with category icons
- Performance data table

## API Response Structure

```json
{
  "message": "Dead stock analysis completed with business solutions",
  "deadStockAlerts": [
    {
      "itemName": "Product Name",
      "risk_level": "high|medium|low",
      "currentStock": 100,
      "salesCount": 2,
      "quantitySold": 5,
      "daysLastSold": 45,
      "reason": "Low sales frequency and poor turnover",
      "urgency": "High - immediate action needed",
      "solutions": [
        {
          "title": "Solution Title",
          "description": "Detailed action steps",
          "expectedOutcome": "Expected results (e.g., '40-60% movement in 2-3 weeks')",
          "category": "bundling|discount|crosssell|promotion|bulk"
        }
      ]
    }
  ],
  "inventoryData": [...],
  "overallAnalysis": "Overall insights...",
  "summary": "Quick summary..."
}
```

## Mistral API Integration

### Configuration
- **API Endpoint**: `https://api.mistral.ai/v1/chat/completions`
- **Model**: `mistral-small-latest`
- **Temperature**: 0.3 (deterministic responses)
- **Timeout**: 10 seconds
- **API Key**: Set in `.env` as `MISTRAL_API_KEY`

### Prompts Used

#### 1. **Main Analysis Prompt**
Analyzes inventory data and identifies dead stock items
- Input: Inventory and sales data in JSON format
- Output: List of dead stock alerts with risk levels

#### 2. **Solution Generation Prompt**
Creates specific, actionable business solutions
- Input: Dead stock item details + top-selling items
- Output: JSON array of 5 solutions with categories

### Error Handling
- **Rate Limiting (429)**: Automatic retry with exponential backoff
- **API Failures**: Falls back to `generateDefaultSolutions()`
- **JSON Parsing Errors**: Graceful degradation with fallback data
- **Missing Data**: Returns appropriate N/A or default values

## Usage Flow

### Step 1: Trigger Analysis
User clicks "Analyze Dead Stock" button on the DeadStockAlerts page

### Step 2: Backend Processing
1. Fetch inventory and sales data for authenticated user
2. Calculate metrics for each item (turnover ratio, days since sale, etc.)
3. Call Mistral API to identify dead stock
4. For each dead stock item, generate 5 business solutions
5. Return comprehensive analysis with solutions

### Step 3: Frontend Display
1. Show analysis summary
2. Display dead stock alerts with:
   - Risk level badge
   - Stock metrics
   - Reason for classification
   - Categorized solutions with icons
3. Show inventory performance table
4. Display overall analysis insights

## Testing

### Manual Testing
Run the test script to verify API structure:
```bash
cd backend
node test_deadstock.js
```

### API Testing with cURL
```bash
curl -X POST http://localhost:5000/api/deadstock/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Prerequisites for Testing
1. Authenticated user with valid token
2. At least one inventory item in database
3. At least one sales record for testing
4. Valid Mistral API key in `.env`

## Configuration

### Environment Variables (.env)
```
MISTRAL_API_KEY=your_api_key_here
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vyapaar
JWT_SECRET=your_secret
```

### Dead Stock Thresholds (in deadStockController.js)
You can adjust these in the Mistral API prompt:
- `salesCount = 0 or very low >= 5` (low sales)
- `daysLastSold > 30` (not sold recently)
- `turnover_ratio < 0.3` (poor turnover)
- `quantity > 50 with low sales` (high inventory)

## Customization

### Adding New Solution Categories
1. Update `getCategoryIcon()` in DeadStockAlerts.jsx
2. Update `getCategoryColor()` in DeadStockAlerts.jsx
3. Update solution prompt in deadStockController.js
4. Update `generateDefaultSolutions()` for new categories

### Adjusting Risk Levels
Edit the Mistral API prompt in deadStockController.js to use different criteria:
- Modify `daysLastSold` threshold
- Adjust `turnover_ratio` minimum
- Change sales count minimum

### Customizing Solution Prompts
Edit `solutionPrompt` in deadStockController.js to:
- Add industry-specific solutions
- Focus on different strategies
- Include seasonal considerations
- Add margin-based recommendations

## Performance Considerations

### Optimization Tips
1. **Batch Processing**: Analyze all items at once (more efficient)
2. **Caching**: Consider caching results for 24 hours
3. **API Optimization**: Use `mistral-small-latest` for speed
4. **Data Filtering**: Exclude items with high sales volume from analysis

### Scaling
For large inventories (1000+ items):
1. Use pagination in inventory fetching
2. Batch solutions generation (5-10 items per request)
3. Implement async processing with job queue
4. Cache top-selling items calculation

## Troubleshooting

### Issue: "MISTRAL_API_KEY environment variable not set"
**Solution**: Add your API key to `.env` file

### Issue: "Rate limited" (429 errors)
**Solution**: Handled automatically with retry logic and backoff

### Issue: No solutions generated
**Solution**: Fallback solutions will be generated automatically

### Issue: Solutions not displayed
**Check**:
1. Solutions array is not empty
2. Category field is present in solution object
3. Browser console for JavaScript errors

### Issue: API Timeout
**Solution**: Increase timeout in `callMistralWithRetry()` function (currently 10s)

## Future Enhancements

1. **Email Alerts**: Send dead stock alerts to users
2. **Automation**: Auto-apply discounts to dead stock items
3. **Historical Tracking**: Track solution effectiveness over time
4. **Custom Strategies**: Allow users to set custom dead stock definitions
5. **Predictive Analysis**: Forecast future dead stock before it happens
6. **Integration**: Connect to inventory management systems
7. **Multi-Language**: Support for multiple languages in solutions
8. **A/B Testing**: Test different solutions and measure results

## Support

For issues or questions:
1. Check the error messages in browser console
2. Review backend logs in terminal
3. Verify Mistral API key and quotas
4. Ensure MongoDB is connected
5. Check authentication token validity

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅
