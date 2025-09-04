# Nalo USSD Integration Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Nalo Account Setup](#nalo-account-setup)
4. [API Configuration](#api-configuration)
5. [Webhook Setup](#webhook-setup)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

## Overview

Nalo USSD integration allows your Towaba voting platform to accept payments via mobile money without requiring internet connectivity. Users can vote by simply dialing a USSD code on their mobile phones.

### Key Features
- **No Internet Required**: Works on any mobile phone
- **Mobile Money Support**: MTN, Vodafone, AirtelTigo
- **Real-time Processing**: Instant payment confirmation
- **Secure Transactions**: Webhook-based verification
- **Universal Access**: Feature phones and smartphones

## Prerequisites

Before starting, ensure you have:
- [ ] Active Towaba voting platform
- [ ] Supabase database configured
- [ ] Domain with SSL certificate
- [ ] Ghana mobile number for testing
- [ ] Mobile money account (MTN/Vodafone/AirtelTigo)

## Nalo Account Setup

### Step 1: Register with Nalo Solutions

1. **Visit Nalo Solutions Website**
   - Go to [https://www.nalosolutions.com](https://www.nalosolutions.com)
   - Click "Get Started" or "Sign Up"

2. **Create Account**
   - Fill in your business details
   - Provide contact information
   - Verify your email address

3. **Business Verification**
   - Submit required business documents
   - Complete KYC (Know Your Customer) process
   - Wait for account approval (1-3 business days)

### Step 2: Choose USSD Code Type

#### Option A: Dedicated USSD Code (Recommended)
- **Cost**: Higher setup fee
- **Benefits**: 
  - Exclusive use of the code
  - Custom branding
  - Better user experience
  - Higher trust factor

#### Option B: Shared USSD Code (Cost-Effective)
- **Cost**: Lower setup fee
- **Benefits**:
  - Shared with other businesses
  - Lower operational costs
  - Quick setup

**Recommended**: Choose dedicated code for better user experience

### Step 3: USSD Code Configuration

1. **Select Your Code**
   - Choose from available codes (e.g., *920*123#)
   - Ensure it's memorable and easy to dial

2. **Configure Menu Structure**
   ```
   Welcome to Towaba Voting Platform
   
   1. Vote for Campaign
   2. Check Campaign Status  
   3. View Results
   4. Help
   
   Enter your choice (1-4):
   ```

3. **Set Session Timeout**
   - Recommended: 60 seconds
   - Allows users time to navigate menus

## API Configuration

### Step 1: Get API Credentials

1. **Login to Nalo Dashboard**
   - Access your Nalo Solutions account
   - Navigate to "API Settings"

2. **Generate API Key**
   - Click "Generate New API Key"
   - Copy and securely store the key
   - Note: This key is sensitive and should be kept private

3. **Get Webhook Secret**
   - Navigate to "Webhook Settings"
   - Generate webhook secret
   - Store securely for signature verification

### Step 2: Configure API Endpoints

Set these endpoints in your Nalo dashboard:

#### USSD Endpoint
```
URL: https://yourdomain.com/api/payments/nalo/ussd
Method: POST
Content-Type: application/json
```

#### Payment Webhook
```
URL: https://yourdomain.com/api/payments/webhook/nalo
Method: POST
Content-Type: application/json
```

## Webhook Setup

### Step 1: Configure Webhook in Nalo Dashboard

1. **Navigate to Webhook Settings**
   - Login to Nalo dashboard
   - Go to "Webhook Configuration"

2. **Add Webhook Endpoint**
   ```
   Webhook URL: https://yourdomain.com/api/payments/webhook/nalo
   Events: payment.success, payment.failed, payment.pending
   Secret: [Your webhook secret]
   ```

3. **Test Webhook**
   - Use Nalo's webhook testing tool
   - Verify endpoint is reachable
   - Check response format

### Step 2: Implement Webhook Verification

The webhook handler includes signature verification:

```typescript
async function verifyWebhookSignature(
  request: NextRequest, 
  payload: NaloWebhookPayload
): Promise<boolean> {
  const signature = request.headers.get('x-nalo-signature')
  const secret = process.env.NALO_WEBHOOK_SECRET
  
  if (!signature || !secret) {
    return false
  }

  // Implement HMAC verification
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return signature === expectedSignature
}
```

## Environment Variables

### Step 1: Add to .env.local

```bash
# Nalo USSD Configuration
NALO_API_KEY=your_nalo_api_key_here
NALO_USSD_CODE=*920*123#
NALO_WEBHOOK_SECRET=your_webhook_secret_here

# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### Step 2: Update Netlify Environment Variables

1. **Login to Netlify Dashboard**
   - Go to your site settings
   - Navigate to "Environment Variables"

2. **Add Nalo Variables**
   ```
   NALO_API_KEY = your_nalo_api_key
   NALO_USSD_CODE = *920*123#
   NALO_WEBHOOK_SECRET = your_webhook_secret
   ```

3. **Redeploy Site**
   - Trigger a new deployment
   - Verify variables are loaded

## Testing

### Step 1: Local Testing

1. **Test USSD Endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/payments/nalo/ussd \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "test123",
       "msisdn": "233241234567",
       "userInput": "",
       "network": "MTN",
       "serviceCode": "*920*123#"
     }'
   ```

2. **Test Payment Initiation**
   ```bash
   curl -X POST http://localhost:3000/api/payments/nalo/init \
     -H "Content-Type: application/json" \
     -d '{
       "campaignId": "your-campaign-id",
       "nomineeId": "your-nominee-id",
       "amount": 100,
       "method": "NALO_USSD"
     }'
   ```

3. **Test Webhook**
   ```bash
   curl -X POST http://localhost:3000/api/payments/webhook/nalo \
     -H "Content-Type: application/json" \
     -d '{
       "transactionId": "TXN123",
       "reference": "NALO-1234567890-abc123",
       "amount": 10000,
       "status": "SUCCESS",
       "msisdn": "233241234567",
       "network": "MTN",
       "timestamp": "2025-01-01T12:00:00Z"
     }'
   ```

### Step 2: Live Testing

1. **Create Test Campaign**
   - Login to your Towaba dashboard
   - Create a test campaign with nominees
   - Set amount per vote (e.g., 1 GHS)

2. **Test USSD Flow**
   - Dial your USSD code: *920*123#
   - Follow the menu prompts
   - Complete a test payment
   - Verify vote is recorded

3. **Verify Payment Processing**
   - Check payment status in dashboard
   - Verify vote count updates
   - Confirm webhook processing

## Deployment

### Step 1: Deploy to Production

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Nalo USSD integration"
   git push origin main
   ```

2. **Netlify Auto-Deploy**
   - Netlify will automatically deploy
   - Monitor build logs for errors
   - Verify deployment success

3. **Update Nalo Configuration**
   - Update webhook URLs to production
   - Test production endpoints
   - Verify SSL certificates

### Step 2: Go Live Checklist

- [ ] Nalo account approved and active
- [ ] USSD code configured and tested
- [ ] Webhook endpoints working
- [ ] Environment variables set
- [ ] Test payments successful
- [ ] Vote counting verified
- [ ] Error handling tested
- [ ] Monitoring configured

## Monitoring

### Step 1: Set Up Monitoring

1. **Nalo Dashboard**
   - Monitor USSD session statistics
   - Track payment success rates
   - View error logs

2. **Application Logs**
   - Monitor webhook processing
   - Track payment failures
   - Alert on system errors

3. **Database Monitoring**
   - Track vote counts
   - Monitor payment records
   - Verify data integrity

### Step 2: Key Metrics to Track

- **USSD Sessions**: Total sessions initiated
- **Completion Rate**: Percentage of completed votes
- **Payment Success Rate**: Successful vs failed payments
- **Average Session Time**: Time to complete voting
- **Error Rate**: Failed requests percentage

## Troubleshooting

### Common Issues and Solutions

#### 1. USSD Not Responding
**Problem**: Users dial code but get no response

**Solutions**:
- Check Nalo account status
- Verify USSD code configuration
- Test with different networks
- Contact Nalo support

#### 2. Payment Failures
**Problem**: Payments not processing

**Solutions**:
- Verify webhook endpoints
- Check API credentials
- Validate webhook signatures
- Monitor error logs

#### 3. Vote Count Not Updating
**Problem**: Payments successful but votes not counted

**Solutions**:
- Check database triggers
- Verify webhook processing
- Test vote count function
- Review error logs

#### 4. Session Timeouts
**Problem**: Users getting disconnected

**Solutions**:
- Increase session timeout
- Optimize menu navigation
- Simplify user flow
- Add progress indicators

### Debug Commands

1. **Check API Status**
   ```bash
   curl -X GET https://api.nalosolutions.com/health
   ```

2. **Test Webhook Endpoint**
   ```bash
   curl -X GET https://yourdomain.com/api/payments/webhook/nalo
   ```

3. **Verify Environment Variables**
   ```bash
   echo $NALO_API_KEY
   echo $NALO_USSD_CODE
   ```

### Support Contacts

- **Nalo Support**: support@nalosolutions.com
- **Technical Documentation**: [Nalo API Docs](https://documenter.getpostman.com/view/7705958/UyrEhaLQ)
- **Towaba Support**: support@towaba.com

## Best Practices

### 1. Security
- Keep API keys secure
- Implement webhook signature verification
- Use HTTPS for all endpoints
- Monitor for suspicious activity

### 2. User Experience
- Keep menus simple and clear
- Provide clear instructions
- Handle errors gracefully
- Offer help options

### 3. Performance
- Optimize database queries
- Implement caching where appropriate
- Monitor response times
- Scale infrastructure as needed

### 4. Testing
- Test with real mobile money accounts
- Verify all payment scenarios
- Test error conditions
- Monitor production metrics

## Cost Considerations

### Nalo Pricing
- **Setup Fee**: Varies by USSD code type
- **Per Transaction**: Typically 1-2% of transaction value
- **Monthly Fee**: May apply for dedicated codes

### Optimization Tips
- Monitor transaction volumes
- Negotiate rates for high volume
- Consider shared codes for testing
- Plan for scaling costs

## Conclusion

The Nalo USSD integration significantly expands your voting platform's reach by enabling offline mobile payments. Follow this guide carefully to ensure a smooth implementation and successful launch.

For additional support or questions, refer to the troubleshooting section or contact the respective support teams.

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Production Ready
