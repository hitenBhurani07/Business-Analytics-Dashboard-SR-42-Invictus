const nodemailer = require('nodemailer');

/**
 * Get real Gmail transporter with Nodemailer
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Generate HTML email template for financial alert
 */
const generateFinancialAlertHTML = (data) => {
    const {
        riskLevel,
        riskScore,
        currentCash,
        projectedCash,
        overdueAmount,
        upcomingAmount,
        overdueCount,
        aiExplanation,
        topSuggestion
    } = data;

    const getRiskColor = () => {
        if (riskLevel === 'CRITICAL') return '#dc2626';
        if (riskLevel === 'HIGH') return '#ea580c';
        return '#16a34a';
    };

    const getRiskBgColor = () => {
        if (riskLevel === 'CRITICAL') return '#fee2e2';
        if (riskLevel === 'HIGH') return '#fed7aa';
        return '#dcfce7';
    };

    const riskColor = getRiskColor();
    const riskBgColor = getRiskBgColor();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        
        .alert-box { background: ${riskBgColor}; border-left: 5px solid ${riskColor}; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
        .alert-title { color: ${riskColor}; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .alert-content { color: #444; font-size: 14px; }
        
        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; }
        .metric-label { color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
        .metric-value { color: #1f2937; font-size: 20px; font-weight: bold; }
        
        .insight-box { background: white; padding: 20px; border-radius: 4px; border: 1px solid #e5e7eb; margin-bottom: 20px; }
        .insight-title { color: #667eea; font-weight: bold; margin-bottom: 10px; font-size: 14px; }
        .insight-text { color: #555; font-size: 13px; line-height: 1.6; }
        
        .action-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .action-title { color: #1e40af; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
        .action-text { color: #1e3a8a; font-size: 13px; }
        
        .footer { text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        .button:hover { background: #764ba2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Financial Risk Alert</h1>
            <p>Vyapaar Sathi Payment Radar Report</p>
        </div>

        <div class="alert-box">
            <div class="alert-title">Risk Level: <span style="color: ${riskColor};">${riskLevel}</span></div>
            <div class="alert-content">
                Risk Score: <strong>${riskScore}/100</strong><br>
                Your financial health requires immediate attention. Review the metrics below to understand your cash position.
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Current Cash</div>
                <div class="metric-value">₹${currentCash.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Projected Cash</div>
                <div class="metric-value" style="color: ${projectedCash < 0 ? '#dc2626' : '#16a34a'};">₹${projectedCash.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Overdue Amount</div>
                <div class="metric-value" style="color: #dc2626;">₹${overdueAmount.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Upcoming Payments</div>
                <div class="metric-value" style="color: #ea580c;">₹${upcomingAmount.toLocaleString('en-IN')}</div>
            </div>
        </div>

        <div class="insight-box">
            <div class="insight-title">🤖 AI Financial Insight</div>
            <div class="insight-text">${aiExplanation}</div>
        </div>

        <div class="action-box">
            <div class="action-title">🎯 Recommended Action</div>
            <div class="action-text">${topSuggestion}</div>
            <a href="http://localhost:5173/payment-radar" class="button">View Full Report</a>
        </div>

        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">Summary</h3>
            <ul style="color: #555; font-size: 13px; line-height: 1.8; margin: 10px 0;">
                <li>You have <strong>${overdueCount} overdue invoice(s)</strong> requiring immediate payment</li>
                <li>Total pending amount: <strong>₹${(overdueAmount + upcomingAmount).toLocaleString('en-IN')}</strong></li>
                <li>Current cash position: <strong>₹${currentCash.toLocaleString('en-IN')}</strong></li>
                ${projectedCash < 0 ? `<li style="color: #dc2626;"><strong>⚠️ WARNING: Projected cash is NEGATIVE</strong></li>` : ''}
            </ul>
        </div>

        <div class="footer">
            <p>This is an automated alert from Vyapaar Sathi. Please do not reply to this email.</p>
            <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Send financial risk alert email via actual Gmail SMTP
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

        // Create real transporter
        const transporter = getTransporter();
        console.log('   ✓ Gmail transporter created');

        // Generate HTML
        const htmlContent = generateFinancialAlertHTML(data);
        console.log(`   ✓ HTML template generated (${htmlContent.length} bytes)`);

        // Prepare mail options
        const mailOptions = {
            from: `"Vyapaar Sathi" <${process.env.EMAIL_USER}>`,
            to: data.userEmail,
            subject: '⚠️ Financial Risk Alert - Vyapaar Sathi',
            html: htmlContent,
            text: `Financial Risk Alert: ${data.riskLevel} risk level detected. Projected cash: ₹${data.projectedCash}. Action needed: ${data.topSuggestion}`
        };

        console.log('   ✓ Mail options prepared');
        console.log('   📤 Connecting to Gmail SMTP...');

        // Send email via Gmail
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
        console.error('   Error Message:', error.message);
        console.error('   Error Code:', error.code);

        // Provide helpful debugging hints
        if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
            console.error('\n💡 TROUBLESHOOTING:');
            console.error('   1. EMAIL_PASS must be a 16-character Gmail App Password (NOT your regular password)');
            console.error('   2. To get App Password:');
            console.error('      - Go to: https://myaccount.google.com/apppasswords');
            console.error('      - Select "Mail" and "Windows Computer"');
            console.error('      - Copy the 16-char password WITHOUT spaces');
            console.error('   3. Update .env file with the new password');
            console.error('   4. Restart the backend server');
        } else if (error.code === 'ENOTFOUND') {
            console.error('   💡 Network issue: Cannot reach Gmail SMTP server');
        }

        return { success: false, error: error.message };
    }
};

/**
 * Send generic email
 */
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendFinancialRiskAlert,
    getTransporter,
    generateFinancialAlertHTML
};
