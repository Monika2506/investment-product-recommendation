# INVESTIQ: Investment Product Recommendation System
### *An AI-Powered Financial Decision Engine with Active Cybersecurity Telemetry*
**Theme: Midnight Finance Intelligence**  
*Suitable for B.Tech AI & Data Science Final-Year Capstone Project / Hackathon Demonstration*

---

## 1. Project Overview

**InvestIQ** is a full-stack, enterprise-grade web platform that bridges **Explainable Machine Learning** and **Cybersecurity Operations (SecOps)**. The platform analyzes an investor's financial profile—including age, monthly income, savings, horizon, risk tolerance, and goals—to generate mathematically grounded, personalized recommendations across 7 regulated asset categories.

Concurrently, the system integrates a **Cybersecurity Monitoring Engine** designed to safeguard investor profiles, thwart automated brute-force attempts, intercept cross-tenant privilege escalation, detect malformed payloads, and dispatch real-time in-app and SMTP security alerts to both users and system administrators.

> [!IMPORTANT]
> **Zero Banking Credential Guarantee**: The application operates strictly on high-level financial parameters. It **never** requests or stores bank account numbers, debit/credit cards, CVV codes, UPI PINs, OTPs, or banking passwords. Recommendations are educational demonstrations and not certified financial advice.

---

## 2. "Midnight Finance Intelligence" Theme & Visual Design

- **Palette**: Dark Navy (`#0b0f19`, `#0f172a`), Deep Charcoal (`#1e293b`), Electric Cyan (`#00f2fe`, `#06b6d4`), Violet (`#8b5cf6`), and Emerald (`#10b981`).
- **Glassmorphism**: Translucent panels with dynamic backdrop blur (`backdrop-blur-md bg-slate-900/70 border border-slate-800/80 shadow-2xl`).
- **Telemetry Visuals**: Animated radar pulse indicators, dynamic threat meters, and incident severity badges (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Responsive Layout**: Collapsible sidebar, sticky top navigation bar with notification counters and live protection status, and accessible contrast.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Recharts, React Router DOM v7, Axios |
| **Backend API** | Python 3.12, Flask 3.1 REST API, Flask-CORS, Flask-Limiter, PyJWT |
| **Machine Learning** | Scikit-Learn 1.6, Random Forest Classifier, Pandas, NumPy, Joblib |
| **Database** | SQLAlchemy 2.0 ORM, SQLite (Production-ready for PostgreSQL / MySQL) |
| **Cybersecurity** | Werkzeug PBKDF2/SHA256 password hashing, RBAC, Threat Detection, Event Logging |
| **Testing** | Pytest 9.0 test suite with in-memory database isolation |

---

## 4. Complete Project Directory Structure

```text
investment-product-recommendation/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Top navigation with live threat badge & notification bell
│   │   │   ├── Sidebar.jsx               # Collapsible navigation drawer
│   │   │   ├── Footer.jsx                # Academic attribution & disclaimers
│   │   │   ├── StatCard.jsx              # Reusable metric card with gradient glows
│   │   │   ├── SecurityShieldBadge.jsx   # Animated protection status indicator
│   │   │   ├── ThreatMeter.jsx           # Real-time security posture health gauge
│   │   │   ├── Modal.jsx                 # Accessible dialog for audits and notes
│   │   │   ├── SkeletonLoader.jsx        # Shimmer loading placeholders
│   │   │   └── ProtectedRoute.jsx        # Authentication and RBAC route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # JWT session management & user state
│   │   │   └── ToastContext.jsx          # Toast alert notifications
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx             # Persistent authenticated layout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Hero, feature pillars, quick demo access
│   │   │   ├── LoginPage.jsx             # Secure login with failed attempt warning
│   │   │   ├── RegisterPage.jsx          # Register with real-time password strength meter
│   │   │   ├── UserDashboard.jsx         # Metric tiles, active asset card, yield chart
│   │   │   ├── FinancialProfilePage.jsx  # Interactive financial profile form
│   │   │   ├── InvestmentRecommendationPage.jsx # AI prediction engine & alternatives
│   │   │   ├── RecommendationHistoryPage.jsx    # Audit trail of previous allocations
│   │   │   ├── SecurityCenter.jsx        # Telemetry logs, client fingerprint, simulation sandbox
│   │   │   ├── NotificationsPage.jsx     # Alert stream with triage tabs
│   │   │   ├── UserSettingsPage.jsx      # Alert thresholds & password updater
│   │   │   ├── AdminDashboard.jsx        # SecOps incident metrics, user management, charts
│   │   │   ├── SecurityEventDetailsPage.jsx # In-depth forensic event inspection
│   │   │   └── NotFoundPage.jsx          # Styled 404 security perimeter view
│   │   ├── services/
│   │   │   └── api.js                    # Axios client with interceptors
│   │   ├── App.jsx                       # Application router (all 13 routes)
│   │   ├── index.css                     # Midnight Finance design system & Tailwind
│   │   └── main.jsx                      # Entry mount point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py                   # User account schema with password hashing
│   │   │   ├── profile.py                # FinancialProfile model
│   │   │   ├── recommendation.py         # Recommendation history & profile snapshot
│   │   │   └── security.py               # SecurityEvent, SecurityAlert, NotificationPreference
│   │   ├── routes/
│   │   │   ├── auth_routes.py            # Register, login, demo-login, change-password
│   │   │   ├── profile_routes.py         # Profile CRUD with validation
│   │   │   ├── recommend_routes.py       # Recommendation generation & access verification
│   │   │   ├── security_routes.py        # Telemetry summary, alerts, simulation endpoint
│   │   │   └── admin_routes.py           # SecOps metrics, user controls, event stream
│   │   ├── security/
│   │   │   ├── auth.py                   # JWT encode/decode, @token_required, @admin_required
│   │   │   ├── detector.py               # Brute-force & injection attack detectors
│   │   │   ├── event_logger.py           # Security telemetry recorder & alert trigger
│   │   │   └── notification.py           # In-app and SMTP alert dispatchers
│   │   ├── ml/
│   │   │   ├── predictor.py              # Scikit-learn runtime pipeline wrapper
│   │   │   ├── investment_rf_model.joblib # Saved trained Random Forest model
│   │   │   └── model_metadata.json       # Model accuracy & classification metrics
│   │   ├── utils/
│   │   │   ├── helpers.py                # Client IP extraction & User-Agent inference
│   │   │   └── validators.py             # Form & password complexity validators
│   │   ├── config.py                     # Configuration profiles & test database
│   │   └── __init__.py                   # Flask app factory, CORS, and rate limiters
│   ├── tests/
│   │   ├── test_auth.py                  # Unit tests for registration, login, and passwords
│   │   ├── test_recommendation.py        # Tests for profile saving, prediction, access control
│   │   └── test_security.py              # Tests for alerts, admin protection, event logging
│   ├── investment_app.db                 # SQLite database file
│   ├── requirements.txt                  # Python dependencies
│   ├── run.py                            # Server execution script
│   └── seed_data.py                      # Database initialization with demo data
├── ml/
│   ├── data/
│   │   ├── generate_dataset.py           # Synthetic dataset generator with financial rules
│   │   └── synthetic_investment_data.csv # 3,200 sample dataset
│   ├── saved_models/
│   │   ├── investment_rf_model.joblib    # Serialized model
│   │   └── model_metadata.json           # Evaluation metrics
│   ├── train.py                          # Training pipeline script (Random Forest)
│   └── evaluate.py                       # Evaluation script (Confusion matrix & F1 report)
├── .env.example                          # Environment variable template
├── .gitignore
├── Dockerfile                            # Optional container configuration
├── docker-compose.yml                    # Multi-container orchestration
├── start_backend.bat                     # Windows one-click backend startup
├── start_frontend.bat                    # Windows one-click frontend startup
└── README.md
```

---

## 5. Machine Learning Recommendation Engine

### Asset Categories
1. **Fixed Deposit (FD)**: Guaranteed capital preservation, high liquidity for short horizons and emergency funds.
2. **Mutual Funds**: Diversified equity and debt growth, suited for 3-7 year compounding.
3. **Stocks**: High-volatility equity ownership for aggressive wealth creation over 5+ years.
4. **Gold**: Sovereign hedge against inflation and currency devaluation.
5. **Public Provident Fund (PPF)**: Triple Tax-Exempt (EEE) government scheme with 15-year disciplined lock-in.
6. **Bonds**: Predictable coupon income with moderate capital security.
7. **National Pension System (NPS)**: Long-term retirement annuity with exclusive tax deductions under Sec 80CCD.

### Model Architecture
- **Classifier**: `RandomForestClassifier(n_estimators=150, max_depth=14, random_state=42)`
- **Preprocessing Pipeline**:
  - Numerical attributes: `StandardScaler()` (`age`, `monthly_income`, `current_savings`, `planned_investment`, `investment_duration`)
  - Categorical attributes: `OneHotEncoder(handle_unknown='ignore')` (`risk_tolerance`, `financial_goal`, `employment_category`)
- **Evaluation Performance**:
  - Test Accuracy: **90.72%**
  - Weighted F1-Score: **0.9030**

To retrain or re-evaluate the model at any time:
```powershell
# Generate synthetic dataset and train model
python ml\train.py

# View confusion matrix and classification report
python ml\evaluate.py
```

---

## 6. Cybersecurity Operations & Telemetry

InvestIQ treats security as an integrated subsystem rather than an afterthought:
1. **Brute-Force & Credential Stuffing Defense**:
   - `ThreatDetector` tracks failed login attempts per `IP:Email` identifier within a rolling 5-minute window.
   - 3+ failed logins immediately escalates severity to `HIGH` and creates a high-priority security alert.
2. **Cross-Tenant Authorization & Privilege Boundary**:
   - Every financial profile and historical recommendation is verified on the backend (`db.session.get`).
   - Attempting to inspect another user's recommendation ID triggers a `CRITICAL` severity event (`UNAUTHORIZED_PROFILE_ACCESS`) and denies access with HTTP 403.
3. **Admin Route RBAC**:
   - Non-administrative access to `/api/admin/*` is rejected and logged as `UNAUTHORIZED_ROUTE_ACCESS`.
4. **Injection / Malformed Request Filter**:
   - Payloads containing SQL/script injection patterns (`<script>`, `UNION SELECT`, `' OR 1=1`) are caught and logged with action `DENIED`.
5. **Technical Transparency**:
   - Client browser and OS are parsed from HTTP `User-Agent` headers with explicit notices that client headers can be forged and do not definitively identify hardware.

---

## 7. Quick Start Guide (Windows / PowerShell)

### Prerequisites
- **Python 3.12+** installed and added to PATH.
- **Node.js v20+** installed.

### Step 1: Clone / Navigate to Directory
```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\investment-product-recommendation
```

### Step 2: Install Dependencies
```powershell
# 1. Install backend requirements
pip install -r backend\requirements.txt

# 2. Install frontend requirements
cd frontend
npm install
cd ..
```

### Step 3: Initialize Database & Train Model
```powershell
# 1. Train the ML model (saves to ml/saved_models and backend/app/ml)
python ml\train.py

# 2. Seed database with test users, profiles, and telemetry
python backend\seed_data.py
```

### Step 4: Run the Application
Open two PowerShell terminals:

**Terminal 1 (Backend Flask Server):**
```powershell
python backend\run.py
# Server runs on http://127.0.0.1:5000
```
*(Or double-click `start_backend.bat`)*

**Terminal 2 (Frontend React App):**
```powershell
cd frontend
npm run dev
# Vite dev server runs on http://localhost:5173
```
*(Or double-click `start_frontend.bat`)*

Open your browser at: **`http://localhost:5173`**

---

## 8. Default Pre-Configured Accounts

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@investiq.local` | `Admin@12345` | Access to Admin Portal, SecOps telemetry, User status management, Alert triage |
| **Demo Investor** | `user@investiq.local` | `User@12345` | Financial profile, AI recommendations, Security Center, Personal history |

> [!TIP]
> The login and landing pages feature **One-Click Demo Access buttons** to instantly log in as either Demo Investor or Demo Admin without typing!

---

## 9. Running Automated Tests

All tests run using Pytest with in-memory SQLite isolation:
```powershell
python -m pytest -o pythonpath=backend backend\tests
```
Expected output:
```text
backend\tests\test_auth.py ....                                          [ 44%]
backend\tests\test_recommendation.py ...                                 [ 77%]
backend\tests\test_security.py ..                                        [100%]
======================= 9 passed in 4.40s =======================
```

---

## 10. REST API Reference

### Authentication
- `POST /api/auth/register` — Create new investor account.
- `POST /api/auth/login` — Authenticate and obtain JWT token.
- `POST /api/auth/demo-login` — Fast demo access for evaluation.
- `GET /api/auth/me` — Fetch current user session.
- `POST /api/auth/change-password` — Update account credentials.

### Financial Profile
- `GET /api/profile` — Retrieve saved investor profile.
- `POST /api/profile` — Create or update financial profile.

### AI Recommendations
- `POST /api/recommend` — Execute Random Forest model, persist recommendation, return rationale and alternatives.
- `GET /api/recommendations/history` — List previous recommendations.
- `GET /api/recommendations/<id>` — Get specific recommendation audit snapshot.

### Security Center
- `GET /api/security/events` — Retrieve user's security event log.
- `GET /api/security/alerts` — Retrieve user's security alerts.
- `POST /api/security/alerts/<id>/acknowledge` — Mark alert as acknowledged.
- `GET /api/security/summary` — Fetch security health score and telemetry.
- `POST /api/security/simulate-event` — Trigger simulated security event for demonstration.

### SecOps Administration (Role: admin)
- `GET /api/admin/dashboard` — Aggregated metrics, incident trend, severity breakdown.
- `GET /api/admin/users` — List registered users.
- `POST /api/admin/users/<id>/toggle-status` — Suspend or activate user account.
- `GET /api/admin/events` — Full system security event stream with filters.
- `POST /api/admin/alerts/<id>/investigate` — Record audit notes and resolve alert.
- `GET /api/admin/model-metrics` — Inspect model accuracy, F1, and training parameters.

---

## 11. B.Tech Project & Viva Defense Q&A

**Q1: Why did you choose Random Forest over a deep neural network?**  
*Answer:* Investment suitability decisions require explainability and high data efficiency. Random Forest handles heterogeneous features (scaled income and one-hot encoded categories) naturally without vanishing gradient issues, achieves 90%+ accuracy on tabular financial parameters, and provides clear decision pathways that can be audited.

**Q2: How does the system handle security alerts in real time?**  
*Answer:* When a qualifying security event occurs (e.g., 3 consecutive failed logins or access to an unauthorized profile ID), `log_security_event` automatically creates a `SecurityAlert` record in the database, tags it with appropriate severity (`HIGH`/`CRITICAL`), pushes it to the user's live notification feed, and dispatches via SMTP if configured.

**Q3: How does the platform protect against data leakage?**  
*Answer:* By design, the architecture adheres to data minimization: no banking credentials or payment cards are ever accepted. Passwords are encrypted with PBKDF2/SHA256 hashes, JWT tokens expire after 24 hours, and database models enforce cross-tenant authorization checks on all ID lookups.

---

## 12. License & Acknowledgments
Developed for academic research and educational evaluation in Artificial Intelligence & Data Science.
