# Kasam Commercial V1 PRD

## Product Position
Kasam is a personal-first money tracking PWA that shows how personal income, expenses, and shared budgets affect the user's own cash position.

Primary promise:
Paranın ve ortak harcamaların sana gerçek etkisini tek ekranda gör.

## Audience
- Primary: people tracking personal cash flow and shared household costs.
- Secondary: couples, families, housemates, trip groups, and goal-based savings groups.

## Business Model
Freemium.

Free tier:
- Personal vault.
- Limited shared vaults.
- Manual income and expense.
- Basic reports.
- PWA install.

Premium tier:
- Unlimited shared vaults.
- Advanced reports and receipts.
- Guess game.
- Goals and savings plans.
- Installments and FX.
- Statement analysis.
- Advanced notifications.

## Core Product Loop
1. User adds a movement.
2. Kasam calculates personal effect and shared-vault effect separately.
3. Related users receive notifications.
4. Hidden surprise movements stay private until the game ends.
5. Daily, weekly, and monthly outputs explain where money went.

## MVP+ Scope
- Personal vault dashboard.
- Shared vault ledger and personal impact.
- Movement add flow without duplicate submit.
- Notification and optional 3-step guess game.
- Daily, weekly, monthly reports.
- Shareable Kasam receipt.
- PWA-ready shell.

## Design Direction
UltraHuman-strong but financially readable.

Principles:
- Clear hierarchy.
- Dark and light themes.
- No yellow-heavy accent system.
- No repeated form fields.
- No technical labels in primary UI.
- No fake sample content as product default.

## Evidence Requirements
Every implementation block must report:
- Local simulation.
- Visual validation.
- Cloud test status.

Shared budget and notifications cannot be marked complete without a real cloud test or an explicit `NEEDS_INPUT` state.
