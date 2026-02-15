// Email Service Stub
// Using stub functions to allow server to run without nodemailer

/**
 * Send generic email (stub - no actual email sent)
 */
const sendEmail = async (to, subject, text) => {
    try {
        console.log('\n📧 [EMAIL SERVICE STUB] Would send email');
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log('   ℹ️  (Actual email disabled - nodemailer not configured)');
        return { success: true, message: 'Email would be sent (stub mode)' };
    } catch (error) {
        console.error('Email stub error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Get transporter (stub - no actual transporter)
 */
const getTransporter = () => {
    return {
        sendMail: async (mailOptions) => {
            console.log('Transporter stub: email would be sent to', mailOptions.to);
            return { messageId: 'stub-' + Date.now() };
        }
    };
};

/**
 * Send financial risk alert email
 * @param {Object} data - Email data including user info and financial metrics
 */
const sendFinancialRiskAlert = async (data) => {
    try {
        console.log('\n📧 [EMAIL SERVICE] Sending financial risk alert...');
        console.log(`   To: ${data.userEmail}`);
        console.log(`   Risk Level: ${data.riskLevel}`);

        // Validate credentials
        if (!process.env.EMAIL_USER) {
            console.error('❌ EMAIL_USER not configured in .env');
            return { success: false, error: 'EMAIL_USER not configured' };
        }
        if (!process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_PASS not configured in .env');
            return { success: false, error: 'EMAIL_PASS not configured' };
        }

        console.log(`   From: ${process.env.EMAIL_USER}`);

        const transporter = getTransporter();
        console.log('   ✓ Transporter created');

        const htmlContent = generateFinancialAlertHTML(data);
        console.log(`   ✓ HTML template generated (${htmlContent.length} bytes)`);

        const mailOptions = {
            from: `"Vyapaar Sathi" <${process.env.EMAIL_USER}>`,
            to: data.userEmail,
            subject: '⚠️ Financial Risk Alert - Vyapaar Sathi',
            html: htmlContent,
            text: `Financial Risk Alert for ${data.businessName}: ${data.riskLevel} risk detected. Projected cash: ₹${data.projectedCash}. Action needed: ${data.topSuggestion}`
        };

        console.log('   ✓ Mail options prepared, sending via SMTP...');

        const info = await transporter.sendMail(mailOptions);

        console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
        console.log('   Email Details:', {
            to: data.userEmail,
            messageId: info.messageId,
            riskLevel: data.riskLevel,
            timestamp: new Date().toISOString()
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('\n❌ FAILED TO SEND EMAIL');

        console.error('   Error Details:', {
            message: error.message,
            code: error.code,
            response: error.response,
            userEmail: data.userEmail,
            timestamp: new Date().toISOString()
        });

        // Common Gmail errors
        if (error.code === 'EAUTH') {
            console.error('   💡 HINT: Gmail authentication failed. Check EMAIL_PASS (should be 16-char App Password, not regular password)');
        } else if (error.message.includes('invalid login')) {
            console.error('   💡 HINT: Invalid Gmail credentials. Verify EMAIL_USER and EMAIL_PASS in .env');
        }

        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail: async (to, subject, text) => {
        try {
            const transporter = getTransporter();
            const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
            await transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email sending failed:', error.message);
            return { success: false, error: error.message };
        }
    },
    sendFinancialRiskAlert,
    getTransporter
};
