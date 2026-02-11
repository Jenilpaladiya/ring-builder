# Ring Builder — Diamond Jewellery E-Commerce Configurator

A step-by-step ring configurator where users select a **setting**, **center stone (diamond)**, **metal**, **ring size**, and **engraving**. The app **validates compatibility**, **calculates total price + breakdown**, and **saves** the configuration.

**Live Demo:** (add link)  
**GitHub Repo:** https://github.com/Jenilpaladiya/ring-builder  
**Demo Video:** (add link)

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
- **Database:** Firebase Cloud Firestore
- **Diamonds Data:** JSON served from backend endpoint `GET /api/diamonds`

---

## 3) Project Structure

```text
ring-builder/
  client/                # React + Vite app
  server/                # Node + Express API
  README.md
  docs/
    test-evidence/        # Screenshots + manual results
