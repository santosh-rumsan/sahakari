Create two separate modal forms for loan management:

APPROVAL FORM (shows when status = SUBMITTED):

- Read-only: Reference, User Name, Requested Amount, Purpose
- Decision: [✓ Approve] [○ Reject]
- If Approve, show editable fields:
  - Approved Amount (number, default: requested)
  - Annual Interest Rate (number, default: 15)
  - Payment Frequency (dropdown: MONTHLY/QUARTERLY/ANNUAL, default: MONTHLY)
  - Number of Installments (number, default: 12)
  - Grace Period Days (number, default: 7)
  - Late Fee % (number, default: 2)
  - Approval Notes (optional textarea)
- If Reject, show: Rejection Reason (required textarea)
- Buttons: [APPROVE] [REJECT] [CANCEL]

DISBURSEMENT FORM (shows when status = APPROVED & !disbursed):

- Read-only Summary: Reference, User Name, Phone, Passbook Number
- Read-only Terms: Approved Amount, Interest Rate, Frequency, Installments, Grace Period, Late Fee
- Disbursement Date: today (read-only)
- Schedule Preview: Show first 3 installments with due dates
- Confirmation: checkbox "I confirm disbursing NPR [amount] to [user]"
- DISBURSE button disabled until checkbox checked
- Buttons: [DISBURSE] [CANCEL]

Both forms should be modals on the loan detail page.
