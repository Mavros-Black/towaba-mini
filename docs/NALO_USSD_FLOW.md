.e# Nalo USSD Voting Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    NALO USSD VOTING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. USER DIALS USSD CODE
   ┌─────────────────┐
   │   *920*123#     │
   └─────────┬───────┘
             │
             ▼
2. WELCOME MENU
   ┌─────────────────────────────────────┐
   │ Welcome to Towaba Voting Platform   │
   │                                     │
   │ 1. Vote for Campaign                │
   │ 2. Check Campaign Status            │
   │ 3. View Results                     │
   │ 4. Help                             │
   │                                     │
   │ Enter your choice (1-4):            │
   └─────────────────┬───────────────────┘
                     │
                     ▼
3. CAMPAIGN SELECTION
   ┌─────────────────────────────────────┐
   │ Active Campaigns:                   │
   │                                     │
   │ 1. Kumerica (100 GHS per vote)      │
   │ 2. Ghana Music Awards (50 GHS)      │
   │ 3. Best Actor (75 GHS)              │
   │                                     │
   │ Enter campaign number (1-3):        │
   └─────────────────┬───────────────────┘
                     │
                     ▼
4. NOMINEE SELECTION
   ┌─────────────────────────────────────┐
   │ Nominees:                           │
   │                                     │
   │ 1. John Doe                         │
   │ 2. Jane Smith                       │
   │ 3. Mike Johnson                     │
   │                                     │
   │ Enter nominee number to vote:       │
   └─────────────────┬───────────────────┘
                     │
                     ▼
5. PAYMENT CONFIRMATION
   ┌─────────────────────────────────────┐
   │ Payment Details:                    │
   │                                     │
   │ Nominee: John Doe                   │
   │ Amount: 100 GHS                     │
   │ Campaign: Kumerica                  │
   │                                     │
   │ Confirm payment? (Y/N):             │
   └─────────────────┬───────────────────┘
                     │
                     ▼
6. MOBILE MONEY PROMPT
   ┌─────────────────────────────────────┐
   │ Mobile Money Payment                │
   │                                     │
   │ Amount: 100.00 GHS                  │
   │ Recipient: Towaba Voting            │
   │ Reference: NALO-1234567890-abc123   │
   │                                     │
   │ Enter your mobile money PIN:        │
   └─────────────────┬───────────────────┘
                     │
                     ▼
7. PAYMENT PROCESSING
   ┌─────────────────────────────────────┐
   │ Processing payment...               │
   │                                     │
   │ Please wait...                      │
   └─────────────────┬───────────────────┘
                     │
                     ▼
8. SUCCESS CONFIRMATION
   ┌─────────────────────────────────────┐
   │ ✅ Payment Successful!              │
   │                                     │
   │ Your vote for John Doe has been     │
   │ recorded successfully.              │
   │                                     │
   │ Reference: NALO-1234567890-abc123   │
   │ Amount: 100 GHS                     │
   │                                     │
   │ Thank you for voting with Towaba!   │
   └─────────────────────────────────────┘
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNICAL PROCESSING                         │
└─────────────────────────────────────────────────────────────────┘

USER INPUT → USSD API → MENU LOGIC → DATABASE → WEBHOOK → VOTE COUNT
     │           │          │           │          │          │
     ▼           ▼          ▼           ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Dial   │ │  POST   │ │ Process │ │ Create  │ │ Payment │ │ Update  │
│ *920*   │ │ /ussd   │ │ Input   │ │Payment  │ │Confirm  │ │Vote     │
│ 123#    │ │         │ │         │ │Record   │ │         │ │Count    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## API Request/Response Flow

### 1. Initial USSD Request
```json
POST /api/payments/nalo/ussd
{
  "sessionId": "sess_123456",
  "msisdn": "233241234567",
  "userInput": "",
  "network": "MTN",
  "serviceCode": "*920*123#"
}
```

**Response:**
```json
{
  "sessionId": "sess_123456",
  "message": "Welcome to Towaba Voting Platform\n\n1. Vote for Campaign\n2. Check Campaign Status\n3. View Results\n4. Help\n\nEnter your choice (1-4):",
  "continueSession": true
}
```

### 2. Campaign Selection
```json
POST /api/payments/nalo/ussd
{
  "sessionId": "sess_123456",
  "msisdn": "233241234567",
  "userInput": "1",
  "network": "MTN",
  "serviceCode": "*920*123#"
}
```

**Response:**
```json
{
  "sessionId": "sess_123456",
  "message": "Active Campaigns:\n\n1. Kumerica (100 GHS per vote)\n2. Ghana Music Awards (50 GHS)\n3. Best Actor (75 GHS)\n\nEnter campaign number (1-3):",
  "continueSession": true
}
```

### 3. Payment Webhook
```json
POST /api/payments/webhook/nalo
{
  "transactionId": "TXN_789012",
  "reference": "NALO-1234567890-abc123",
  "amount": 10000,
  "status": "SUCCESS",
  "msisdn": "233241234567",
  "network": "MTN",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ERROR SCENARIOS                          │
└─────────────────────────────────────────────────────────────────┘

1. INVALID INPUT
   ┌─────────────────────────────────────┐
   │ Invalid choice. Please enter 1-4:   │
   └─────────────────┬───────────────────┘
                     │
                     ▼
2. CAMPAIGN NOT FOUND
   ┌─────────────────────────────────────┐
   │ No active campaigns found.          │
   │ Thank you for using Towaba.         │
   └─────────────────────────────────────┘

3. PAYMENT FAILED
   ┌─────────────────────────────────────┐
   │ ❌ Payment Failed                   │
   │                                     │
   │ Your payment could not be           │
   │ processed. Please try again.        │
   │                                     │
   │ Reference: NALO-1234567890-abc123   │
   └─────────────────────────────────────┘

4. SESSION TIMEOUT
   ┌─────────────────────────────────────┐
   │ Session expired. Please dial        │
   │ *920*123# to start again.           │
   └─────────────────────────────────────┘
```

## Database State Changes

### Payment Record Creation
```sql
INSERT INTO payments (
  reference,
  amount,
  method,
  status,
  voter_name,
  metadata
) VALUES (
  'NALO-1234567890-abc123',
  10000, -- 100 GHS in pesewas
  'NALO_USSD',
  'PENDING',
  'USSD-233241234567',
  '{"sessionId": "sess_123456", "network": "MTN"}'
);
```

### Vote Record Creation
```sql
INSERT INTO votes (
  nominee_id,
  amount,
  payment_id,
  status,
  voter_name,
  reference
) VALUES (
  'nominee_123',
  10000,
  'payment_456',
  'PENDING',
  'USSD-233241234567',
  'NALO-1234567890-abc123'
);
```

### Payment Success Update
```sql
UPDATE payments 
SET status = 'COMPLETED',
    updated_at = NOW(),
    metadata = metadata || '{"naloTransactionId": "TXN_789012"}'
WHERE reference = 'NALO-1234567890-abc123';

UPDATE votes 
SET status = 'COMPLETED',
    updated_at = NOW()
WHERE payment_id = 'payment_456';
```

## Mobile Network Support

| Network | Mobile Money | USSD Code | Status |
|---------|--------------|-----------|---------|
| MTN | MTN Mobile Money | *170# | ✅ Supported |
| Vodafone | Vodafone Cash | *110# | ✅ Supported |
| AirtelTigo | AirtelTigo Money | *110# | ✅ Supported |

## Session Management

### Session States
- **ACTIVE**: User is navigating menus
- **PAYMENT_PENDING**: Payment initiated, waiting for confirmation
- **COMPLETED**: Vote successfully recorded
- **FAILED**: Payment failed or session expired
- **TIMEOUT**: Session expired due to inactivity

### Session Timeout
- **Default**: 60 seconds
- **Payment**: 300 seconds (5 minutes)
- **Help**: 120 seconds (2 minutes)

## Performance Metrics

### Expected Response Times
- **Menu Display**: < 2 seconds
- **Payment Processing**: < 10 seconds
- **Webhook Processing**: < 5 seconds
- **Vote Count Update**: < 3 seconds

### Success Rates
- **Menu Navigation**: > 95%
- **Payment Success**: > 90%
- **Vote Recording**: > 99%
- **Overall Completion**: > 85%

---

**Note**: This flow diagram represents the complete user journey from dialing the USSD code to successful vote recording. Each step is designed to be simple and intuitive for users with basic mobile phones.
