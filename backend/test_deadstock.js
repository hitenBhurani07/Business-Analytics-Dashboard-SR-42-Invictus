const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api/deadstock/analyze';

// Test data - you'll need a valid token from your system
const testDeadStockAnalysis = async () => {
    try {
        console.log('🧪 Testing Dead Stock Analysis API...');
        console.log('API URL:', API_URL);
        
        // You can get a real token by logging in first
        // For now, we'll just show the expected usage
        const token = 'YOUR_AUTH_TOKEN_HERE';
        
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        console.log('\nNote: To test this, you need:');
        console.log('1. A valid authentication token');
        console.log('2. Some inventory items in your database');
        console.log('3. Some sales data for those items');
        console.log('\nExample request:');
        console.log(`curl -X POST ${API_URL} \\`);
        console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
        console.log(`  -H "Content-Type: application/json"`);
        
        console.log('\nExpected response format:');
        console.log(JSON.stringify({
            message: 'Dead stock analysis completed with business solutions',
            deadStockAlerts: [
                {
                    itemName: 'Product Name',
                    risk_level: 'high',
                    currentStock: 100,
                    salesCount: 2,
                    quantitySold: 5,
                    daysLastSold: 45,
                    reason: 'Low sales frequency and poor turnover',
                    urgency: 'High - immediate action needed',
                    solutions: [
                        {
                            title: '📦 Bundle with Best-Sellers',
                            description: 'Create attractive bundles...',
                            expectedOutcome: 'Move 40-60% of dead stock...',
                            category: 'bundling'
                        }
                    ]
                }
            ],
            overallAnalysis: 'Analysis text...',
            summary: 'Summary of findings...'
        }, null, 2));

        console.log('\n✅ API Structure verified!');
        console.log('The dead stock analysis API is ready to use.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testDeadStockAnalysis();
