# P4 Integration Contract

## Backend endpoints

GET `/api/budget`

GET `/api/payments`

GET `/api/audit`

GET `/api/providers`

POST `/api/agent/task`

## Current POST body

```json
{
  "task": "Buy translation service",
  "provider": "provider-a",
  "amount": 0.01
}
```

## Required P1 integration

The P4 blockchain adapter needs:

- contract address
- ABI
- network/RPC configuration
- `getRemainingBudget()` or equivalent
- `PaymentMade` event
- `DeliveryRecorded` event

## Required P2 integration

P4 needs the final agent result schema, especially:

- task status
- selected provider
- payment amount
- nonce
- transaction hash
- delivery status
- delivery hash

## Required P3 integration

P4 needs provider discovery/status information and the final 402 payment metadata.

## Security boundary

P4 should never implement:

```python
if amount <= remaining:
    approve_payment()
```

as the real payment authority.

P4 can show this information for UX. The on-chain contract must independently reject unauthorized/oversized spending.
