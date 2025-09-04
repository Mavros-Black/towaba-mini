# Nalo USSD Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. USSD Not Responding

**Problem**: User dials the USSD code but gets no response or "Service not available" message.

**Possible Causes**:
- Nalo account not activated
- USSD code not configured
- Network issues
- Service temporarily down

**Solutions**:
```bash
# Check Nalo account status
curl -X GET https://api.nalosolutions.com/account/status \
  -H "Authorization: Bearer YOUR_API_KEY"

# Test USSD endpoint
curl -X POST https://yourdomain.com/api/payments/nalo/ussd \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "msisdn": "233241234567", "userInput": "", "network": "MTN", "serviceCode": "*920*123#"}'
```

**Prevention**:
- Monitor Nalo dashboard for service status
- Set up alerts for endpoint failures
- Test with different networks

### 2. Payment Failures

**Problem**: Users can navigate menus but payments fail to process.

**Possible Causes**:
- Webhook endpoint not reachable
- Invalid API credentials
- Database connection issues
- Mobile money account issues

**Solutions**:
```bash
# Check webhook endpoint
curl -X GET https://yourdomain.com/api/payments/webhook/nalo

# Test payment creation
curl -X POST https://yourdomain.com/api/payments/nalo/init \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "test", "nomineeId": "test", "amount": 100, "method": "NALO_USSD"}'

# Check database connection
curl -X GET https://yourdomain.com/api/test-db
```

**Debug Steps**:
1. Check webhook logs in Nalo dashboard
2. Verify environment variables
3. Test database connectivity
4. Check mobile money account balance

### 3. Vote Count Not Updating

**Problem**: Payment successful but vote count doesn't increase.

**Possible Causes**:
- Webhook not processing
- Database trigger issues
- Vote count function errors
- Race conditions

**Solutions**:
```sql
-- Check vote count function
SELECT update_vote_count('nominee_id_here');

-- Manual vote count update
UPDATE nominees 
SET vote_count = (
  SELECT COUNT(*) 
  FROM votes 
  WHERE nominee_id = 'nominee_id_here' 
  AND status = 'COMPLETED'
)
WHERE id = 'nominee_id_here';

-- Check vote records
SELECT * FROM votes 
WHERE nominee_id = 'nominee_id_here' 
AND status = 'COMPLETED';
```

**Prevention**:
- Monitor webhook processing
- Set up database triggers
- Implement retry mechanisms
- Add logging for vote updates

### 4. Session Timeouts

**Problem**: Users get disconnected during navigation.

**Possible Causes**:
- Session timeout too short
- Network latency
- Complex menu navigation
- Server response delays

**Solutions**:
```typescript
// Increase session timeout
const sessionTimeout = 120; // seconds

// Optimize menu responses
const menuResponse = {
  sessionId,
  message: "Simple menu text",
  continueSession: true
};
```

**Prevention**:
- Keep menus simple (max 4 options)
- Optimize response times
- Use clear, concise text
- Test with slow networks

### 5. Invalid Input Handling

**Problem**: Users enter invalid responses and get stuck.

**Possible Causes**:
- Poor input validation
- Unclear instructions
- Complex input requirements
- No error recovery

**Solutions**:
```typescript
// Robust input validation
function validateInput(input: string, expectedType: 'number' | 'text'): boolean {
  if (expectedType === 'number') {
    const num = parseInt(input);
    return !isNaN(num) && num > 0;
  }
  return input.trim().length > 0;
}

// Clear error messages
const errorMessage = "Invalid input. Please enter a number between 1 and 4:";
```

**Prevention**:
- Provide clear examples
- Use simple validation rules
- Offer help options
- Implement input hints

## 🔍 Debugging Tools

### 1. Log Analysis

**Check Application Logs**:
```bash
# View recent logs
tail -f /var/log/towaba/app.log

# Search for errors
grep "ERROR" /var/log/towaba/app.log

# Filter by session ID
grep "sess_123456" /var/log/towaba/app.log
```

**Check Database Logs**:
```sql
-- Check recent payments
SELECT * FROM payments 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check failed payments
SELECT * FROM payments 
WHERE status = 'FAILED'
AND created_at > NOW() - INTERVAL '1 day';
```

### 2. API Testing

**Test USSD Endpoint**:
```bash
#!/bin/bash
# Test script for USSD endpoint

ENDPOINT="https://yourdomain.com/api/payments/nalo/ussd"
SESSION_ID="test_$(date +%s)"

# Test initial menu
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"msisdn\": \"233241234567\",
    \"userInput\": \"\",
    \"network\": \"MTN\",
    \"serviceCode\": \"*920*123#\"
  }" | jq .
```

**Test Webhook**:
```bash
#!/bin/bash
# Test webhook processing

WEBHOOK_URL="https://yourdomain.com/api/payments/webhook/nalo"

curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"transactionId\": \"TXN_$(date +%s)\",
    \"reference\": \"NALO-$(date +%s)-test\",
    \"amount\": 10000,
    \"status\": \"SUCCESS\",
    \"msisdn\": \"233241234567\",
    \"network\": \"MTN\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }" | jq .
```

### 3. Database Queries

**Check System Health**:
```sql
-- Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM payments 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Vote completion rate
SELECT 
  v.status,
  COUNT(*) as count
FROM votes v
JOIN payments p ON v.payment_id = p.id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
GROUP BY v.status;

-- Session statistics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
FROM payments 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 📊 Monitoring Dashboard

### Key Metrics to Track

1. **USSD Session Metrics**
   - Total sessions initiated
   - Session completion rate
   - Average session duration
   - Drop-off points

2. **Payment Metrics**
   - Payment success rate
   - Average payment amount
   - Payment method distribution
   - Failed payment reasons

3. **System Metrics**
   - API response times
   - Webhook processing time
   - Database query performance
   - Error rates

### Alert Thresholds

```yaml
alerts:
  ussd_response_time:
    threshold: 5 seconds
    action: "Check server performance"
  
  payment_success_rate:
    threshold: 85%
    action: "Investigate payment issues"
  
  webhook_failure_rate:
    threshold: 5%
    action: "Check webhook endpoint"
  
  session_completion_rate:
    threshold: 70%
    action: "Review menu flow"
```

## 🛠️ Maintenance Tasks

### Daily Tasks
- [ ] Check payment success rates
- [ ] Monitor error logs
- [ ] Verify webhook processing
- [ ] Check database performance

### Weekly Tasks
- [ ] Review session analytics
- [ ] Update campaign data
- [ ] Test USSD flow
- [ ] Backup database

### Monthly Tasks
- [ ] Analyze user behavior
- [ ] Optimize menu flow
- [ ] Update documentation
- [ ] Security audit

## 🆘 Emergency Procedures

### Service Down
1. Check Nalo dashboard status
2. Verify server connectivity
3. Test API endpoints
4. Contact Nalo support
5. Notify users via alternative channels

### Payment Issues
1. Check webhook processing
2. Verify database connectivity
3. Review error logs
4. Test payment flow
5. Contact payment provider

### Data Corruption
1. Stop webhook processing
2. Backup current data
3. Restore from backup
4. Verify data integrity
5. Resume processing

## 📞 Support Contacts

### Nalo Support
- **Email**: support@nalosolutions.com
- **Phone**: +233 302 123 456
- **Hours**: 24/7
- **Response Time**: < 2 hours

### Technical Support
- **Email**: tech@towaba.com
- **Phone**: +233 302 789 012
- **Hours**: 8 AM - 6 PM GMT
- **Response Time**: < 4 hours

### Emergency Contacts
- **On-call Engineer**: +233 241 234 567
- **Database Admin**: +233 241 234 568
- **System Admin**: +233 241 234 569

## 📋 Troubleshooting Checklist

### Before Contacting Support
- [ ] Check service status pages
- [ ] Review error logs
- [ ] Test basic functionality
- [ ] Verify configuration
- [ ] Check network connectivity
- [ ] Test with different devices
- [ ] Review recent changes
- [ ] Check system resources

### Information to Provide
- [ ] Error messages
- [ ] Timestamp of issue
- [ ] User phone number (if applicable)
- [ ] Session ID
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] System logs
- [ ] Configuration details

---

**Remember**: Always test changes in a staging environment before deploying to production. Keep backups of your configuration and database before making any changes.
