# Nalo USSD Integration Guide

## Overview

This document explains how to integrate Nalo USSD payments into the Towaba voting platform, allowing users to vote via mobile money without requiring an internet connection.

## Features

- **USSD Menu System**: Interactive menus accessible via mobile phone
- **Mobile Money Integration**: Support for MTN, Vodafone, and AirtelTigo
- **No Internet Required**: Works on any mobile phone
- **Real-time Processing**: Instant payment confirmation
- **Secure Transactions**: Webhook-based payment verification

## Setup Instructions

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Nalo USSD Configuration
NALO_API_KEY=your_nalo_api_key
NALO_USSD_CODE=*920*123#
NALO_WEBHOOK_SECRET=your_nalo_webhook_secret
```

### 2. Nalo Account Setup

1. Register at [Nalo Solutions](https://www.nalosolutions.com)
2. Choose between:
   - **Dedicated USSD Code**: Exclusive to your business
   - **Shared Code**: Cost-effective option shared with other clients
3. Configure your USSD menu in the Nalo dashboard
4. Get your API credentials

### 3. Webhook Configuration

Set up webhook endpoints in your Nalo dashboard:

- **USSD Endpoint**: `https://yourdomain.com/api/payments/nalo/ussd`
- **Payment Webhook**: `https://yourdomain.com/api/payments/webhook/nalo`

## API Endpoints

### USSD Handler
**POST** `/api/payments/nalo/ussd`

Handles USSD interactions and creates the voting menu.

**Request Body:**
```json
{
  "sessionId": "string",
  "msisdn": "string",
  "userInput": "string",
  "network": "string",
  "serviceCode": "string"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "message": "string",
  "continueSession": boolean
}
```

### Payment Initialization
**POST** `/api/payments/nalo/init`

Creates payment and vote records for USSD transactions.

**Request Body:**
```json
{
  "campaignId": "string",
  "nomineeId": "string",
  "amount": number,
  "method": "NALO_USSD"
}
```

### Payment Webhook
**POST** `/api/payments/webhook/nalo`

Receives payment confirmations from Nalo.

**Request Body:**
```json
{
  "transactionId": "string",
  "reference": "string",
  "amount": number,
  "status": "SUCCESS" | "FAILED" | "PENDING",
  "msisdn": "string",
  "network": "string",
  "timestamp": "string"
}
```

## USSD Flow

### 1. User Journey
```
1. User dials *920*123#
2. Selects "Vote for Campaign"
3. Chooses campaign from list
4. Selects nominee to vote for
5. Confirms payment amount
6. Enters mobile money PIN
7. Receives confirmation
```

### 2. Menu Structure
```
Welcome to Towaba Voting Platform

1. Vote for Campaign
2. Check Campaign Status
3. View Results
4. Help

Enter your choice (1-4):
```

### 3. Campaign Selection
```
Active Campaigns:

1. Kumerica (100 GHS per vote)
2. Ghana Music Awards (50 GHS per vote)
3. Best Actor (75 GHS per vote)

Enter campaign number (1-3):
```

### 4. Nominee Selection
```
Nominees:

1. John Doe
2. Jane Smith
3. Mike Johnson

Enter nominee number to vote:
```

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR UNIQUE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  amount INTEGER NOT NULL, -- in pesewas
  method VARCHAR NOT NULL, -- 'NALO_USSD'
  status VARCHAR NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
  voter_name VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Votes Table
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_id UUID REFERENCES nominees(id),
  campaign_id UUID REFERENCES campaigns(id),
  amount INTEGER NOT NULL, -- in pesewas
  payment_id UUID REFERENCES payments(id),
  status VARCHAR NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
  voter_name VARCHAR,
  reference VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### 1. Webhook Verification
- Implement HMAC signature verification
- Validate webhook payload integrity
- Use secure webhook secrets

### 2. Rate Limiting
- Implement rate limiting for USSD endpoints
- Prevent abuse and spam requests
- Monitor for suspicious activity

### 3. Data Validation
- Validate all input parameters
- Sanitize user inputs
- Implement proper error handling

## Testing

### 1. Local Testing
```bash
# Test USSD endpoint
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

### 2. Webhook Testing
```bash
# Test webhook endpoint
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

## Monitoring and Analytics

### 1. Key Metrics
- USSD session completion rate
- Payment success rate
- Average transaction time
- User engagement metrics

### 2. Error Tracking
- Monitor failed payments
- Track USSD session errors
- Log webhook failures
- Alert on system issues

## Troubleshooting

### Common Issues

1. **USSD Not Responding**
   - Check Nalo API credentials
   - Verify webhook endpoints
   - Test network connectivity

2. **Payment Failures**
   - Validate webhook signatures
   - Check database connections
   - Monitor error logs

3. **Session Timeouts**
   - Implement session management
   - Handle timeout scenarios
   - Provide user feedback

## Support

For technical support:
- Email: support@towaba.com
- Documentation: [Nalo API Docs](https://documenter.getpostman.com/view/7705958/UyrEhaLQ)
- Nalo Support: [Nalo Solutions](https://www.nalosolutions.com)
