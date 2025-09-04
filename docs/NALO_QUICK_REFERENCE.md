# Nalo USSD Quick Reference Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Add to .env.local
NALO_API_KEY=your_nalo_api_key
NALO_USSD_CODE=*920*123#
NALO_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Test USSD Flow
```bash
# Test initial menu
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

## 📱 USSD Menu Flow

```
*920*123# → Welcome Menu → Campaign Selection → Nominee Selection → Payment → Confirmation
```

### Menu Structure
```
Welcome to Towaba Voting Platform

1. Vote for Campaign
2. Check Campaign Status
3. View Results
4. Help

Enter your choice (1-4):
```

## 🔧 API Endpoints

### USSD Handler
- **URL**: `/api/payments/nalo/ussd`
- **Method**: `POST`
- **Purpose**: Handle USSD interactions

### Payment Init
- **URL**: `/api/payments/nalo/init`
- **Method**: `POST`
- **Purpose**: Create payment records

### Webhook
- **URL**: `/api/payments/webhook/nalo`
- **Method**: `POST`
- **Purpose**: Process payment confirmations

## 📊 Database Tables

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  reference VARCHAR UNIQUE,
  amount INTEGER, -- in pesewas
  method VARCHAR, -- 'NALO_USSD'
  status VARCHAR, -- 'PENDING', 'COMPLETED', 'FAILED'
  voter_name VARCHAR,
  metadata JSONB
);
```

### Votes Table
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  nominee_id UUID,
  amount INTEGER, -- in pesewas
  payment_id UUID,
  status VARCHAR, -- 'PENDING', 'COMPLETED', 'FAILED'
  voter_name VARCHAR,
  reference VARCHAR
);
```

## 🔐 Security Checklist

- [ ] API keys stored securely
- [ ] Webhook signature verification
- [ ] HTTPS endpoints only
- [ ] Input validation implemented
- [ ] Error handling in place

## 🧪 Testing Checklist

- [ ] USSD menu navigation
- [ ] Payment creation
- [ ] Webhook processing
- [ ] Vote count updates
- [ ] Error scenarios
- [ ] Mobile money integration

## 📞 Support Contacts

- **Nalo Support**: support@nalosolutions.com
- **API Docs**: [Nalo Documentation](https://documenter.getpostman.com/view/7705958/UyrEhaLQ)
- **Towaba Support**: support@towaba.com

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| USSD not responding | Check Nalo account status |
| Payment failures | Verify webhook endpoints |
| Vote count not updating | Check database triggers |
| Session timeouts | Increase timeout settings |

## 📈 Monitoring Metrics

- USSD session completion rate
- Payment success rate
- Average transaction time
- Error rate percentage

## 💡 Best Practices

1. **Keep menus simple** - Maximum 4-5 options
2. **Clear instructions** - Use simple language
3. **Handle errors gracefully** - Provide helpful messages
4. **Monitor performance** - Track key metrics
5. **Test thoroughly** - Use real mobile money accounts

---

**Quick Links**:
- [Full Setup Guide](./NALO_SETUP_GUIDE.md)
- [Integration Documentation](./NALO_INTEGRATION.md)
- [Nalo Solutions Website](https://www.nalosolutions.com)
