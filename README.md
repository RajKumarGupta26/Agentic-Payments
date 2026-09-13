# AgentPay — P4 Backend + Dashboard

This is the **P4 portion** of the One Hack AgentPay project.

According to the supplied project plan, P4 owns:
- FastAPI backend
- dashboard
- budget/payment/audit/provider API endpoints
- frontend integration
- mock data while P1/P2/P3 are developing

The backend is intentionally written with a mock blockchain adapter first. This lets P4 work in parallel without waiting for P1's deployed BudgetVault.

## 1. Start backend

Open a terminal in `backend/`:

### Windows

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test:
- http://127.0.0.1:8000/
- http://127.0.0.1:8000/docs

## 2. Start frontend

Open a second terminal in `frontend/`:

```powershell
npm install
npm run dev
```

Open the URL Vite prints, normally:
http://localhost:5173

## 3. What works now

- Owner dashboard
- Budget/spend card
- Remaining budget
- Payment table
- Delivery verification count
- Security/audit events
- Provider cards
- Refresh button
- Overspend demo button
- FastAPI Swagger docs

## 4. What P4 needs from teammates

### From P1
Ask for:
1. BudgetVault deployed address
2. ABI JSON
3. exact event names and parameters
4. exact read/write function signatures

Replace `backend/services/blockchain.py` with the real web3 implementation.

### From P2
Ask for the final agent endpoint/response format.

The current P4 endpoint is:
`POST /api/agent/task`

### From P3
Ask for the final provider API and x402/MPP response format.

The dashboard currently expects provider objects like:
```json
{
  "id": "provider-a",
  "name": "Provider A",
  "service": "Translation",
  "price": 0.01,
  "currency": "ETH",
  "quality": 92,
  "status": "online"
}
```

## 5. Important architecture rule

The dashboard/backend may DISPLAY the budget, but it must not become the authority that approves payment.

Final authorization must remain in the BudgetVault / protocol layer, as required by the project specification.

## 6. Recommended Git branch

Use:
`feature/dashboard`

Commit this P4 work first, then integrate P1/P2/P3 through pull requests.
