# Ring Builder — Diamond Jewellery E-Commerce Configurator

A step-by-step ring configurator where users select a **setting**, **center stone (diamond)**, **metal**, **ring size**, and **engraving**, then the app **validates compatibility**, **calculates price**, and **saves** the configuration.

**Live Demo:** (add link)  
**GitHub Repo:** https://github.com/Jenilpaladiya/ring-builder  
**Demo Video:** https://drive.google.com/file/d/1RdMGm-IK_nPaWltYr-q4Y-TqXZTE37_H/view?usp=sharing

---

## 1) Features

- Step-by-step configuration flow (Setting → Diamond → Complete Ring)
- Setting ↔ Diamond **compatibility validation** (shape rules)
- Diamond catalog with **grid view + filters + sorting** (from API)
- Price calculation with clear **price breakdown**
- Save final configuration to **Firebase Firestore**
- Clean REST API contract with standard error format

---

## 2) Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express (REST API)
- **Database:** Firebase Cloud Firestore (ringSettings, metals, ringConfigurations)
- **Diamonds Data:** JSON API endpoint (`/api/diamonds`) served by the backend

---

## 3) Project Structure

```text
ring-builder/
  client/                # React + Vite app
  server/                # Node + Express API
  README.md
```

---

## 4) Prerequisites

- Node.js **18+** recommended
- npm (or yarn)
- Firebase project with **Firestore enabled**

---

## 5) Install & Run (Start to Finish)

### Install dependencies

```bash
# from the root folder
cd server
npm install

cd ../client
npm install
```

### Configure Environment Variables

**Client (Firebase)** — create `client/.env`:

```bash
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

**Server (optional)** — create `server/.env`:

```bash
PORT=3001
```

### Start backend API

```bash
cd server
npm run dev
```

Expected:
- API runs on: `http://localhost:3001`
- Diamonds endpoint: `http://localhost:3001/api/diamonds`

### Start frontend (Vite)

```bash
cd client
npm run dev
```

Expected:
- Web app runs on: `http://localhost:5173`

### Confirm API connection

Open in browser:

```text
http://localhost:3001/api/diamonds
```

If you see JSON, the diamonds API is working.

---

## 6) Firebase / Firestore Setup

### Collections used

- `ringSettings`
- `metals`
- `ringConfigurations`

### Firestore Rules (Fix “permission-denied / expired test mode”)

Firebase Console → Firestore → Rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> IMPORTANT: This is only for development/testing. For production, restrict access (auth/admin).

Publish the rules, then reload the app.

---

## 7) API Documentation (Backend)

Base URL (local):

```text
http://localhost:3001
```

### Endpoints

#### 1) Get Diamonds

```http
GET /api/diamonds
```

Purpose: Returns diamond catalogue list for Step 2.

Sample response:

```json
{
  "count": 86,
  "results": [
    {
      "id": "338/35-01-1.02-134.64-0",
      "shape": "oval brilliant",
      "carat": 1.02,
      "color": "G",
      "clarity": "SI1",
      "price": 134.64,
      "lab": "IGI",
      "imageUrl": "/images/diamonds/oval.jpg"
    }
  ]
}
```

#### 2) Health check (optional)

```http
GET /health
```

Sample response:

```json
{ "status": "ok" }
```

### Error Format (API)

All API errors follow this schema:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": []
  }
}
```

Common HTTP codes:
- `400` Bad Request
- `404` Not Found
- `500` Server Error

---

## 8) Screenshots (Add to GitHub)

Create folder:

```text
client/public/screenshots/
```

Recommended files:

```text
client/public/screenshots/step1-settings.png
client/public/screenshots/step2-diamonds-grid.png
client/public/screenshots/step2-filters.png
client/public/screenshots/step3-summary.png
client/public/screenshots/firestore-collections.png
```

Add to README like this:

```md
## Screenshots

### Step 1 — Select Setting
![Step 1](client/public/screenshots/step1-settings.png)
```

---

## 9) Testing Evidence

### Test types

- Unit tests: pricing + validation logic
- Integration tests: API endpoints (diamonds endpoint + save flow)
- Manual test cases: UI flow + Firestore save

### Manual test cases

**TC01: Load settings from Firestore**  
Steps: Open app → Step 1 loads settings list  
Expected: Settings cards visible; no console errors

**TC02: Load diamonds from /api/diamonds**  
Steps: Go to Step 2  
Expected: Diamonds grid visible; shapes filter auto-populates

**TC03: Shape filter works**  
Steps: Click “Round Brilliant”  
Expected: Only round brilliant diamonds displayed

**TC04: Price filter works**  
Steps: Set min=100 max=150  
Expected: Only diamonds within range displayed

**TC05: Select diamond enables Continue**  
Steps: Click any diamond card  
Expected: Card active; Continue enabled

**TC06: Compatibility warning shown for invalid combo**  
Steps: Choose setting Round/Oval → select Pear  
Expected: Warning shown, user asked to change stone

**TC07: Step 3 shows selected diamond in summary**  
Steps: Choose setting + diamond + metal → go Step 3  
Expected: Summary includes diamond details

**TC08: Calculate total price**  
Steps: Fill ring size + engraving → click Calculate  
Expected: Total price + breakdown displayed

**TC09: Save configuration to Firestore**  
Steps: Click Save Configuration  
Expected: Document created in `ringConfigurations`

**TC10: Refresh behavior**  
Steps: Refresh browser on Step 2/3  
Expected: Selections restore (if localStorage) OR reset safely without crash

### Store evidence in repo

Create:

```text
docs/test-evidence/
```

Add:

```text
docs/test-evidence/unit-tests.png
docs/test-evidence/integration-tests.png
docs/test-evidence/manual-tc-results.md
```

---

## 10) Common Issues & Fixes

### Firestore “Missing or insufficient permissions”
Cause: Firestore test mode expired (30 days).  
Fix: Update Firestore Rules (see section 6), then reload.

### “Encountered two children with the same key”
Cause: React list keys not unique.  
Fix: Ensure each diamond has a unique id (e.g., sku + carat + price + index).

### Vite “command not found”
Fix (run in `client/`):

```bash
npm install
npm run dev
```

---

## 11) How the App Works (User Flow)

1) Step 1: Select ring setting + metal  
2) Step 2: Select diamond from API list (filter + sort)  
3) Step 3: Ring size + engraving → calculate price → save configuration

Saved configurations are stored in Firestore with:
- `settingId`
- `metalId`
- `diamondId`
- price breakdown

---

## 12) Phase 3 Improvements (Based on Feedback)

- Improve UX: show compatibility/validation rules clearly
- Add formal references/citations in report
- Strengthen deployment + CI/CD readiness (build scripts, documentation)

---

