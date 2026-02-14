const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/auth';

const runTest = async () => {
    try {
        console.log('Testing Registration...');
        const form = new FormData();
        form.append('name', 'Test Owner');
        form.append('email', `testowner_${Date.now()}@example.com`); // Unique email
        form.append('password', 'password123');
        form.append('businessName', 'Invictus Corp');
        form.append('businessType', 'Retail');
        form.append('startingCash', '50000');

        form.append('inventory', fs.createReadStream(path.join(__dirname, 'test_inventory.csv')));
        form.append('sales', fs.createReadStream(path.join(__dirname, 'test_sales.csv')));
        form.append('expenses', fs.createReadStream(path.join(__dirname, 'test_expenses.csv')));

        const registerRes = await axios.post(`${API_URL}/register`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Registration Successful:', registerRes.data);
        const token = registerRes.data.token;

        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: registerRes.data.email,
            password: 'password123',
        });

        console.log('Login Successful:', loginRes.data);

        console.log('Testing Protected Route (Me)...');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log('Protected Route Access Successful:', meRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
};

runTest();
