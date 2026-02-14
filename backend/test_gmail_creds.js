/**
 * Verify Gmail credentials work
 * Run: node test_gmail_creds.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');

console.log('========================================');
console.log('🔐 GMAIL CREDENTIALS TEST');
console.log('========================================\n');

// Check credentials exist
console.log('📋 Environment Variables:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ MISSING'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? `✓ (${process.env.EMAIL_PASS.length} chars)` : '❌ MISSING'}`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('\n❌ Missing credentials! Add to .env:');
    console.error('   EMAIL_USER=your-email@gmail.com');
    console.error('   EMAIL_PASS=xxxx xxxx xxxx xxxx\n');
    process.exit(1);
}

// Test connection
console.log('\n🔗 Testing Gmail connection...\n');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ CONNECTION FAILED\n');
        console.error('Error:', error.message);
        
        if (error.code === 'EAUTH') {
            console.error('\n💡 HINT: Authentication failed');
            console.error('   Ensure you\'re using a Gmail App Password (16 characters)');
            console.error('   Not your regular Gmail password!\n');
            console.error('   Steps to generate App Password:');
            console.error('   1. Go to myaccount.google.com/security');
            console.error('   2. Enable 2-Step Verification');
            console.error('   3. Click App passwords');
            console.error('   4. Select Mail → Windows Computer');
            console.error('   5. Copy the 16-character password');
        }
    } else {
        console.log('✅ CONNECTION SUCCESSFUL\n');
        console.log('credentials are working!');
        console.log(`   User: ${process.env.EMAIL_USER}`);
        console.log('   Ready to send emails\n');
        
        // Send test email
        console.log('📧 Sending test email...\n');
        
        const mailOptions = {
            from: `"Vyapaar Sathi" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '✅ Vyapaar Sathi - Email System Test',
            html: `
                <h2>Email System Test Successful!</h2>
                <p>If you're reading this, the email sending system is working correctly.</p>
                <p>You can now test the Payment Radar alert system.</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ FAILED TO SEND TEST EMAIL');
                console.error('Error:', error.message);
            } else {
                console.log('✅ TEST EMAIL SENT');
                console.log(`   MessageID: ${info.messageId}`);
                console.log(`   Check your inbox: ${process.env.EMAIL_USER}\n`);
            }
            process.exit(0);
        });
    }
});
