/**
 * Test script to verify email alert system
 * Run: node test_email_alerts.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Sales = require('./models/Sales');
const jwt = require('jsonwebtoken');

console.log('========================================');
console.log('🧪 EMAIL ALERT SYSTEM TEST');
console.log('========================================\n');

// Step 1: Verify Environment Variables
console.log('📋 Step 1: Checking Environment Variables');
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✓ Set' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '❌ Missing'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ Missing'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? `✓ Set (${process.env.EMAIL_PASS.length} chars)` : '❌ Missing'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set (using default)'}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('\n❌ Missing email credentials in .env file!');
    console.error('Please add:');
    console.error('   EMAIL_USER=your-email@gmail.com');
    console.error('   EMAIL_PASS=xxxx xxxx xxxx xxxx (16-char Gmail App Password)');
    process.exit(1);
}

// Step 2: Connect to Database
console.log('\n📊 Step 2: Connecting to MongoDB');
console.log(`   URI: ${process.env.MONGO_URI}`);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('   ✓ Connected'))
    .catch(err => {
        console.error('   ❌ Connection failed:', err.message);
        process.exit(1);
    });

// Step 3: Main test function
const runTest = async () => {
    try {
        console.log('\n👤 Step 3: Setting up test user');

        // Clean up existing test user
        await User.deleteOne({ email: 'emailtest@example.com' });
        await Expense.deleteMany({ ownerId: null }); // Clean orphaned expenses
        
        // Create test user with HIGH-risk scenario
        const testUser = new User({
            name: 'Test User',
            email: 'emailtest@example.com',
            password: 'hashed_password_here',
            businessName: 'Test Business',
            businessType: 'Retail',
            startingCash: 50000,
            emailNotificationsEnabled: true
        });

        await testUser.save();
        console.log(`   ✓ Test user created: ${testUser.email}`);
        console.log(`   ✓ emailNotificationsEnabled: ${testUser.emailNotificationsEnabled}`);
        console.log(`   ✓ startingCash: ₹${testUser.startingCash}`);

        // Add HIGH expenses to trigger alert
        console.log('\n💸 Step 4: Adding high-risk expenses');
        const expenses = [
            {
                ownerId: testUser._id,
                title: 'Monthly Rent',
                category: 'Rent',
                amount: 100000,
                status: 'Pending',
                dueDate: new Date()
            },
            {
                ownerId: testUser._id,
                title: 'Staff Salaries',
                category: 'Salaries',
                amount: 150000,
                status: 'Pending',
                dueDate: new Date()
            },
            {
                ownerId: testUser._id,
                title: 'Office Utilities',
                category: 'Utilities',
                amount: 50000,
                status: 'Pending',
                dueDate: new Date()
            }
        ];

        await Expense.insertMany(expenses);
        console.log(`   ✓ Added ${expenses.length} high expenses`);
        console.log(`   ✓ Total amount: ₹${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`);

        // Generate JWT token
        console.log('\n🔐 Step 5: Generating JWT token');
        const token = jwt.sign(
            { id: testUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(`   ✓ Token generated (valid for 1 hour)`);

        // Test Payment Radar API
        console.log('\n📈 Step 6: Testing Payment Radar calculation');
        const { getPaymentRadar } = require('./controllers/dashboardController');

        // Mock request/response objects
        const mockReq = {
            user: { _id: testUser._id }
        };

        let responseData = null;
        const mockRes = {
            json: (data) => {
                responseData = data;
            },
            status: function(code) {
                this.statusCode = code;
                return this;
            }
        };

        // Call the controller
        await getPaymentRadar(mockReq, mockRes);

        if (responseData) {
            console.log(`   ✓ Payment Radar calculated`);
            console.log(`   ✓ Current Cash: ₹${responseData.financialStatus.currentCash}`);
            console.log(`   ✓ Projected Cash: ₹${responseData.financialStatus.projectedCashAfterPayments}`);
            console.log(`   ✓ Risk Level: ${responseData.financialStatus.riskLevel}`);
            console.log(`   ✓ Risk Score: ${responseData.analytics.riskScore}/100`);
        } else {
            console.error('   ❌ Payment Radar failed to generate response');
            throw new Error('Payment Radar response is empty');
        }

        // Wait a bit for email to be sent in background
        console.log('\n⏳ Step 7: Waiting for email to send (5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if email was sent
        const updatedUser = await User.findById(testUser._id);
        if (updatedUser.lastAlertSent) {
            console.log('   ✓ Email was SENT!');
            console.log(`   ✓ lastAlertSent: ${updatedUser.lastAlertSent}`);
            console.log(`   ✓ Check your inbox for: ⚠️ Financial Risk Alert - Vyapaar Sathi`);
        } else {
            console.log('   ⚠️  No email sent - check server logs for reasons');
        }

        // Summary
        console.log('\n========================================');
        console.log('✅ TEST COMPLETE');
        console.log('========================================');
        console.log('\n📧 Expected: Email should arrive at harshitabhatia003@gmail.com soon');
        console.log('   Subject: ⚠️ Financial Risk Alert - Vyapaar Sathi');
        console.log('   Body: High risk alert with financial metrics\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed\n');
        process.exit(0);
    }
};

// Run after a short delay to ensure connection
setTimeout(runTest, 1000);
