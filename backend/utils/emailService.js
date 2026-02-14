const nodemailer = require("nodemailer");

/**
 * Create Nodemailer transporter
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password (not regular password)
        },
    });
};

/**
 * Generate HTML template for financial risk alert
 */
const generateFinancialAlertHTML = (data) => {
    const {
        userName,
        businessName,
        riskLevel,
        projectedCash,
        currentCash,
        overdueCount,
        overdueAmount,
        upcomingAmount,
        riskScore,
        topSuggestion,
        aiExplanation
    } = data;

    const riskColor = {
        HIGH: '#FF9800',
        CRITICAL: '#F44336'
    }[riskLevel] || '#FF9800';

    const riskEmoji = {
        HIGH: '⚠️',
        CRITICAL: '🚨'
    }[riskLevel] || '⚠️';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .header h1 { font-size: 24px; margin-bottom: 10px; }
                .header p { font-size: 14px; opacity: 0.9; }
                .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .alert-box { background: linear-gradient(135deg, ${riskColor}20 0%, ${riskColor}10 100%); border-left: 4px solid ${riskColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .alert-title { font-size: 18px; font-weight: bold; color: ${riskColor}; margin-bottom: 10px; }
                .alert-message { color: #555; line-height: 1.8; }
                .metric { display: inline-block; width: 48%; margin: 10px 1%; padding: 15px; background: #f0f0f0; border-radius: 4px; }
                .metric-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 8px; }
                .metric-value { font-size: 22px; font-weight: bold; color: #333; }
                .metric-value.negative { color: #f44336; }
                .suggestion-box { background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .suggestion-box strong { color: #2E7D32; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
                .cta-button:hover { background: #5568d3; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
                .divider { border-top: 1px solid #ddd; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${riskEmoji} Financial Risk Alert</h1>
                    <p>Vyapaar Sathi - ${businessName}</p>
                </div>
                
                <div class="content">
                    <p>Hi <strong>${userName}</strong>,</p>
                    
                    <p style="margin-top: 15px;">Your business financial metrics have triggered a <strong>${riskLevel} risk level</strong> alert. Please review the details below and take action immediately.</p>
                    
                    <div class="alert-box">
                        <div class="alert-title">${riskEmoji} ${riskLevel} Risk Status</div>
                        <div class="alert-message">${aiExplanation}</div>
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
                        <div class="metric">
                            <div class="metric-label">Current Cash</div>
                            <div class="metric-value">₹${currentCash.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Projected Cash</div>
                            <div class="metric-value ${projectedCash < 0 ? 'negative' : ''}">₹${projectedCash.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Risk Score</div>
                            <div class="metric-value">${riskScore}/100</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Overdue Invoices</div>
                            <div class="metric-value">${overdueCount}</div>
                        </div>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px;">
                        <strong>Financial Breakdown:</strong>
                        <ul style="margin-top: 10px; margin-left: 20px;">
                            <li>Overdue Amount: <strong>₹${overdueAmount.toLocaleString('en-IN')}</strong></li>
                            <li>Upcoming Payments: <strong>₹${upcomingAmount.toLocaleString('en-IN')}</strong></li>
                            <li>Total Pending: <strong>₹${(overdueAmount + upcomingAmount).toLocaleString('en-IN')}</strong></li>
                        </ul>
                    </div>
                    
                    <div class="suggestion-box">
                        <strong style="color: #2E7D32;">💡 Suggested Action:</strong>
                        <p style="margin-top: 10px; color: #333;">${topSuggestion}</p>
                    </div>
                    
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                        Log in to Vyapaar Sathi immediately to view detailed Payment Radar analytics and take corrective actions.
                    </p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-radar" class="cta-button">
                        View Payment Radar
                    </a>
                    
                    <div class="divider"></div>
                    
                    <p style="color: #999; font-size: 13px;">
                        <strong>Note:</strong> You will receive a maximum of one alert per 24 hours to prevent notification fatigue. You can disable email notifications in your account settings.
                    </p>
                </div>
                
                <div class="footer">
                    <p>© 2026 Vyapaar Sathi - Financial Management System</p>
                    <p>This is an automated alert. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
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
