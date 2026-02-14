const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
    try {
        console.log('--- Authenticating ---');

        const timestamp = Date.now();
        const email = `dashboard_test_${timestamp}@example.com`;
        console.log(`Creating new test user: ${email}...`);

        const form = new FormData();
        form.append('name', 'Dashboard Tester');
        form.append('email', email);
        form.append('password', 'password123');
        form.append('businessName', 'Test Biz');
        form.append('businessType', 'Retail');
        form.append('startingCash', 100000);

        // Append files
        if (fs.existsSync('test_inventory.csv')) form.append('inventory', fs.createReadStream('test_inventory.csv'));
        if (fs.existsSync('test_sales.csv')) form.append('sales', fs.createReadStream('test_sales.csv'));
        if (fs.existsSync('test_expenses.csv')) form.append('expenses', fs.createReadStream('test_expenses.csv'));

        const registerRes = await axios.post(`${API_URL}/auth/register`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const token = registerRes.data.token;
        console.log('Registration successful, token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- Testing Dashboard Endpoints ---');

        console.log('1. GET /dashboard/summary');
        const summary = await axios.get(`${API_URL}/dashboard/summary`, config);
        console.log('Success:', summary.data);

        console.log('\n2. GET /dashboard/alerts');
        const alerts = await axios.get(`${API_URL}/dashboard/alerts`, config);
        console.log('Success:', alerts.data);

        console.log('\n3. GET /dashboard/inventory-risk');
        const risk = await axios.get(`${API_URL}/dashboard/inventory-risk`, config);
        console.log('Success:', risk.data);

        console.log('\n4. GET /dashboard/cash-projection');
        const projection = await axios.get(`${API_URL}/dashboard/cash-projection`, config);
        console.log('Success:', projection.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data && error.response.data.stack) {
            console.error('Stack:', error.response.data.stack);
        }
    }
};

runTest();
