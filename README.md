# QA Pulse - SaaS QA Intelligence Platform

![QA Pulse](https://img.shields.io/badge/QA%20Pulse-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-v24%2B-brightgreen)
![Docker](https://img.shields.io/badge/docker-v27%2B-blue)

## 📊 Project Overview

QA Pulse is a modern SaaS platform that intelligently analyzes test results, detects flaky tests, calculates release risk scores, and provides actionable insights to QA teams. It integrates with GitHub to correlate code changes with test failures and sends real-time Slack notifications, enabling teams to ship quality software faster and with confidence.

**Key Benefits:**
- 🎯 Identify risky tests before they reach production
- 🔍 Detect flaky tests automatically
- 📊 Visualize test trends and patterns
- 🔗 Correlate commits with test failures
- 🚀 Make data-driven release decisions
- 💬 Get real-time Slack alerts

**Target Users:** QA teams, DevOps engineers, test automation specialists, and release managers building high-quality software.

---

## ✨ Features

### 🔐 User Authentication
- User signup with email validation
- Secure login with JWT tokens
- Profile management
- Password hashing with bcryptjs

### 🏢 Multi-Tenant Organizations
- Create and manage organizations
- Invite team members
- Role-based access control (owner, member, viewer)
- Organization-scoped projects and data

### 📤 Test Result Ingestion
- JUnit XML format support
- Postman JSON format support
- Batch test result processing
- Automatic test statistics calculation

### ⚠️ Risk Analysis & Flaky Test Detection
- Automatic flaky test detection (tests that pass & fail)
- Risk scoring system (0-100)
- Risk levels: LOW, MEDIUM, HIGH
- Module-level risk analysis
- Stability percentage tracking

### 🔗 GitHub Integration
- Sync commits from GitHub repository
- Correlate commits with test runs
- Track code changes and files affected
- PR tracking and analysis
- Risk correlation: identify which commits cause failures

### 💬 Slack Notifications
- Configure Slack webhook URLs
- Automatic alerts on test failures
- Risk level notifications
- Real-time team communication

### 📊 Responsive Dashboard
- Test statistics and pass rate trends
- Line charts for pass rate over time
- Bar charts for test count distribution
- Pie charts for failure distribution
- Module risk analysis table
- Recent test runs display
- Release health status indicator

### 🎨 Modern UI
- Glassmorphism design system
- Mobile-first responsive layout
- Smooth animations and transitions
- Dark theme optimized for long viewing
- Touch-friendly interface
- Professional SaaS styling

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Hooks
- **Build Tool:** Vite
- **Language:** TypeScript
- **Charting:** Recharts
- **Styling:** Tailwind CSS + Custom CSS
- **HTTP:** Fetch API

### Backend
- **Runtime:** Node.js v24+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **XML Parsing:** xml2js

### DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Database:** PostgreSQL (containerized)

### External Integrations
- **GitHub API:** Commit syncing and analysis
- **Slack API:** Webhook notifications

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v24 or higher ([download](https://nodejs.org/))
- **Docker** v27 or higher ([download](https://www.docker.com/))
- **Docker Compose** (included with Docker Desktop)
- **Git**
- **GitHub account** (for integration features)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/RoshiniGunasekaran/QA-Pulse.git
cd qa-pulse
```

#### 2. Setup Database

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait 10 seconds for PostgreSQL to initialize
# Database will be created automatically
```

#### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "NODE_ENV=development
PORT=5000
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=RoshiniGunasekaran/QA-Pulse
JWT_SECRET=your_super_secret_jwt_key_here" > .env

# Start backend server
npm run dev

# Backend will run on http://localhost:5000
```

#### 4. Setup Frontend (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start frontend
npm run dev

# Frontend will run on http://localhost:3000
```

#### 5. Access the Application

Open your browser and navigate to:

http://localhost:3000


### Verify Installation

- ✅ Frontend loads (http://localhost:3000)
- ✅ Backend responds (http://localhost:5000/health)
- ✅ Can create account
- ✅ Can login successfully
- ✅ Dashboard displays

---

## 🔑 Environment Variables

### Backend Configuration

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Docker handles this automatically)
DATABASE_USER=dev
DATABASE_PASSWORD=devpass
DATABASE_NAME=qa_pulse
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# GitHub Integration
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_REPO=RoshiniGunasekaran/QA-Pulse

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Optional: Analytics
VITE_ENABLE_ANALYTICS=false
```

### Getting GitHub Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name: `qa-pulse-dev`
4. Select scopes: `repo` (read-only)
5. Generate and copy the token
6. Paste into `.env` as `GITHUB_TOKEN`

---

## 📡 API Endpoints

### Authentication Endpoints

POST /api/auth/signup
Body: { email, name, password }
Response: { token, userId, name }

POST /api/auth/login
Body: { email, password }
Response: { token, userId, name }

GET /api/auth/profile
Headers: Authorization: Bearer <token>
Response: { id, email, name }


### Organization Endpoints

GET /api/orgs
Headers: Authorization: Bearer <token>
Response: [{ id, name, owner_id }, ...]

POST /api/orgs
Headers: Authorization: Bearer <token>
Body: { name }
Response: { id, name }

GET /api/orgs/:orgId
Headers: Authorization: Bearer <token>
Response: { id, name, owner_id }

GET /api/orgs/:orgId/members
Headers: Authorization: Bearer <token>
Response: [{ userId, name, email, role }, ...]

POST /api/orgs/:orgId/members
Headers: Authorization: Bearer <token>
Body: { email, role }
Response: { success: true }


### Test Results Endpoints

POST /api/test-runs
Headers: Authorization: Bearer <token>
Body: { projectId, runNumber, totalTests, passedTests, ... }
Response: { id, projectId, runNumber }

POST /api/test-results
Headers: Authorization: Bearer <token>
Body: [{ testName, status, duration, module, ... }, ...]
Response: { success: true, inserted: 20 }


### Dashboard Endpoints

GET /api/dashboard/summary?projectId=3
Headers: Authorization: Bearer <token>
Response: { total_tests, passed_tests, release_health, ... }

GET /api/dashboard/trends?projectId=3&limit=10
Headers: Authorization: Bearer <token>
Response: [{ run_number, pass_rate, created_at }, ...]

GET /api/dashboard/modules?projectId=3
Headers: Authorization: Bearer <token>
Response: [{ module, total_tests, risk_level, ... }, ...]

GET /api/dashboard/recent-runs?projectId=3&limit=5
Headers: Authorization: Bearer <token>
Response: [{ id, run_number, pass_rate, ... }, ...]

GET /api/dashboard/charts?projectId=3
Headers: Authorization: Bearer <token>
Response: { pass_rate_trend, test_count_trend, failure_distribution }


### Risk Analysis Endpoints

GET /api/risk/flaky-tests?projectId=3
Headers: Authorization: Bearer <token>
Response: [{ test_name, pass_count, fail_count, ... }, ...]

GET /api/risk/test-scores?projectId=3
Headers: Authorization: Bearer <token>
Response: [{ test_name, risk_score, risk_level, is_flaky }, ...]

GET /api/risk/summary?projectId=3
Headers: Authorization: Bearer <token>
Response: { total_tests, low_risk_tests, high_risk_tests, ... }


### GitHub Endpoints

GET /api/github/commits?projectId=3
Headers: Authorization: Bearer <token>
Response: [{ commit_hash, message, author, risk_score }, ...]

GET /api/github/commit-risk?projectId=3
Headers: Authorization: Bearer <token>
Response: [{ commit_hash, message, linked_test_failures }, ...]

POST /api/github/sync?projectId=3
Headers: Authorization: Bearer <token>
Response: { success: true, commits_synced: 20 }


### Slack Endpoints

POST /api/slack/config
Headers: Authorization: Bearer <token>
Body: { webhookUrl, orgId }
Response: { success: true }

POST /api/slack/send-alert
Headers: Authorization: Bearer <token>
Body: { type: 'test_failure|risk_alert', data: {...} }
Response: { success: true, message: 'Alert sent' }


---

## 👤 User Guide

### Getting Started

#### Step 1: Create Account

1. Open http://localhost:3000
2. Click "Sign up"
3. Enter your email, name, and password
4. Click "Sign Up"
5. Automatically redirected to Dashboard

#### Step 2: Create Organization

1. In the navbar, click the "New Organization" dropdown
2. Enter your organization name (e.g., "QA Team")
3. Click "Create"
4. You're automatically the owner

#### Step 3: Upload Test Results

You can upload test results via API:

**Using cURL (JUnit format):**

```bash
curl -X POST http://localhost:5000/api/test-runs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 3,
    "runNumber": 1,
    "totalTests": 20,
    "passedTests": 15,
    "failedTests": 3,
    "skippedTests": 2,
    "duration": 125000
  }'
```

**Using cURL (Test Results):**

```bash
curl -X POST http://localhost:5000/api/test-results \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "testRunId": 1,
      "testName": "LoginTest",
      "status": "PASSED",
      "duration": 2500,
      "module": "AuthenticationService",
      "framework": "Jest"
    }
  ]'
```

### Using the Dashboard

#### View Test Statistics

1. Click "📊 Dashboard" tab
2. See at the top:
   - Total Tests (blue)
   - Passed Tests (green)
   - Failed Tests (red)
   - Skipped Tests (orange)

#### View Trends

Scroll down to see three charts:

1. **Pass Rate Trend** - Line chart showing pass rate over time
2. **Test Count Trend** - Stacked bar chart (passed/failed/skipped)
3. **Failure Distribution** - Pie chart by framework

#### Module Risk Analysis

Below charts, view module-level risk:

- Click column headers to sort
- See test counts and pass rates
- Risk levels color-coded (green/orange/red)

#### Recent Runs

Bottom section shows last 5 test runs:

- Run number
- Pass rate percentage
- Number of passed tests

### Risk Analysis Dashboard

#### Step 1: Open Risk Analysis

1. Click "⚠️ Risk Analysis" tab

#### Step 2: View Risk Overview

See 4 cards at top:

- 📋 Total Tests
- 🟢 LOW Risk Tests
- 🟡 MEDIUM Risk Tests
- 🔴 HIGH Risk Tests

#### Step 3: Identify Problem Tests

Two highlight cards show:

- **Highest Risk Test** - Most dangerous test (red)
- **Most Flaky Test** - Most unstable test (orange)

#### Step 4: Detailed Analysis

**Flaky Tests Table:**
- Tests that pass AND fail
- Stability percentage (green/orange/red)
- Sorted by fail count

**Risky Tests Table:**
- All tests ranked by risk score
- Risk level color-coded
- Flaky indicator (YES/NO)
- Clickable for details

**Risk Distribution Chart:**
- Pie chart showing split
- LOW (green), MEDIUM (orange), HIGH (red)

### GitHub Integration

#### Step 1: Setup GitHub Token

1. Create GitHub personal access token (see Environment Variables section)
2. Add to `backend/.env` as `GITHUB_TOKEN`
3. Set `GITHUB_REPO=owner/repo`
4. Restart backend

#### Step 2: Sync Commits

```bash
curl -X POST http://localhost:5000/api/github/sync?projectId=3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Step 3: View in Dashboard

1. Go to Dashboard
2. New "GitHub Commits" section shows:
   - Last 20 commits
   - Risk scores
   - Correlation with test failures

### Slack Notifications

#### Step 1: Create Slack Webhook

1. Go to your Slack workspace
2. Navigate to "Apps"
3. Search "Incoming Webhooks"
4. Click "Create New"
5. Copy the webhook URL

#### Step 2: Configure in QA Pulse

```bash
curl -X POST http://localhost:5000/api/slack/config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "orgId": 2
  }'
```

#### Step 3: Receive Alerts

When tests fail or risk is HIGH:

- Slack message sent automatically
- Shows test name, failure reason
- Includes link to dashboard
- Team gets real-time notification

---

## 🗄️ Database Schema

### Users Table
```sql
users (
  id: integer PRIMARY KEY,
  email: string UNIQUE,
  password_hash: string,
  name: string,
  created_at: timestamp
)
```

### Organizations Table
```sql
organizations (
  id: integer PRIMARY KEY,
  name: string,
  owner_id: integer FOREIGN KEY → users.id,
  created_at: timestamp
)
```

### Organization Members Table
```sql
org_members (
  id: integer PRIMARY KEY,
  org_id: integer FOREIGN KEY → organizations.id,
  user_id: integer FOREIGN KEY → users.id,
  role: string (owner|member|viewer),
  created_at: timestamp
)
```

### Projects Table
```sql
projects (
  id: integer PRIMARY KEY,
  org_id: integer FOREIGN KEY → organizations.id,
  name: string,
  description: string,
  created_at: timestamp
)
```

### Test Runs Table
```sql
test_runs (
  id: integer PRIMARY KEY,
  project_id: integer FOREIGN KEY → projects.id,
  run_number: integer,
  total_tests: integer,
  passed_tests: integer,
  failed_tests: integer,
  skipped_tests: integer,
  duration: integer,
  created_at: timestamp
)
```

### Test Results Table
```sql
test_results (
  id: integer PRIMARY KEY,
  test_run_id: integer FOREIGN KEY → test_runs.id,
  test_name: string,
  status: string (PASSED|FAILED|SKIPPED),
  duration: integer,
  module: string,
  framework: string,
  created_at: timestamp
)
```

### Commits Table
```sql
commits (
  id: integer PRIMARY KEY,
  project_id: integer FOREIGN KEY → projects.id,
  commit_hash: string UNIQUE,
  message: string,
  author: string,
  timestamp: timestamp,
  files_changed: JSON,
  risk_score: integer (0-100),
  risk_level: string (LOW|MEDIUM|HIGH),
  pr_id: string,
  created_at: timestamp
)
```

### Commit Test Run Link Table
```sql
commit_test_run_link (
  id: integer PRIMARY KEY,
  commit_id: integer FOREIGN KEY → commits.id,
  test_run_id: integer FOREIGN KEY → test_runs.id,
  match_confidence: integer (0-100),
  created_at: timestamp
)
```

### Slack Config Table
```sql
slack_configs (
  id: integer PRIMARY KEY,
  org_id: integer FOREIGN KEY → organizations.id,
  webhook_url: string,
  enabled: boolean,
  created_at: timestamp
)
```

---

## 🏗️ Architecture

### System Overview

┌─────────────────────────────────────────────────────┐
│ User Browser │
└────────────────────┬────────────────────────────────┘
│
┌───────────▼────────────┐
│ Frontend (React) │
│ http://localhost:3000 │
└───────────┬────────────┘
│
┌────────────────▼─────────────────┐
│ Backend (Express.js) │
│ http://localhost:5000 │
│ │
│ ├─ AuthService │
│ ├─ OrgService │
│ ├─ DashboardService │
│ ├─ RiskEngineService │
│ ├─ FlakyTestService │
│ ├─ GitHubService │
│ └─ SlackService │
└────────────────┬─────────────────┘
│
┌────────────────▼──────────────┐
│ PostgreSQL Database │
│ localhost:5432 │
│ │
│ ├─ users │
│ ├─ organizations │
│ ├─ projects │
│ ├─ test_runs │
│ ├─ test_results │
│ ├─ commits │
│ └─ slack_configs │
└───────────────────────────────┘

External Integrations:

┌─────────────────────┐
│ GitHub API │
│ Sync commits │
└──────────┬──────────┘
│
┌──────▼──────┐
│ Backend │
└──────┬──────┘
│
┌──────────▼─────────┐
│ Slack API │
│ Send alerts │
└────────────────────┘


### Key Services

**AuthService**
- User registration and login
- Password hashing and verification
- JWT token generation and validation

**OrgService**
- Organization CRUD operations
- Member management
- Role-based access control

**DashboardService**
- Aggregate test statistics
- Calculate pass rates and trends
- Module-level risk analysis
- Chart data generation

**RiskEngineService**
- Calculate risk scores (0-100)
- Determine risk levels (LOW/MEDIUM/HIGH)
- Analyze test failures
- Score calculation formula:

risk = (failure_rate × 0.5) +
(recent_failures × 0.3) +
(flakiness_penalty × 0.2)


**FlakyTestService**
- Detect tests that pass and fail
- Calculate stability percentage
- Identify most unstable tests

**GitHubService**
- Fetch commits from GitHub API
- Parse commit metadata
- Identify changed files
- Calculate commit risk based on files touched

**SlackService**
- Configure webhook URLs
- Format and send notifications
- Handle test failure alerts
- Risk level alerts

---

## 🚢 Deployment

### Local Development with Docker

**Start all services:**

```bash
# Terminal 1: Start Docker containers
docker-compose up

# Terminal 2: Start backend
cd backend && npm run dev

# Terminal 3: Start frontend
cd frontend && npm run dev

# Terminal 4: Optional - run tests
npm test
```

**Stop services:**

```bash
docker-compose down
```

### Production Deployment

#### Environment Setup

1. **Create production .env files:**

```bash
# backend/.env.production
NODE_ENV=production
PORT=5000
DATABASE_HOST=your-rds-endpoint.com
DATABASE_USER=prod_user
DATABASE_PASSWORD=strong_password_here
JWT_SECRET=generate_with_openssl_rand_hex
GITHUB_TOKEN=ghp_your_production_token
GITHUB_REPO=owner/repo
CORS_ORIGIN=https://yourdomain.com
```

2. **Build Docker images:**

```bash
docker build -t qa-pulse-backend:1.0.0 ./backend
docker build -t qa-pulse-frontend:1.0.0 ./frontend
```

3. **Push to registry:**

```bash
docker tag qa-pulse-backend:1.0.0 your-registry/qa-pulse-backend:1.0.0
docker push your-registry/qa-pulse-backend:1.0.0
```

#### Deployment Platforms

**AWS EC2:**
- Launch EC2 instance
- Install Docker and Docker Compose
- Deploy using docker-compose.yml
- Use RDS for PostgreSQL
- Set up security groups

**Heroku:**
```bash
heroku create qa-pulse
git push heroku main
heroku addons:create heroku-postgresql
```

**DigitalOcean:**
- Create App Platform project
- Connect GitHub repo
- Deploy from docker-compose.yml
- Managed PostgreSQL database

**Kubernetes:**
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/postgres-deployment.yaml
```

---

## 🔧 Troubleshooting

### PostgreSQL Connection Issues

**Problem:** "Cannot connect to database"

**Solutions:**

```bash
# Check if docker-compose is running
docker ps

# Check PostgreSQL logs
docker logs qa_pulse_db

# Verify credentials in .env
cat backend/.env

# Restart containers
docker-compose restart
```

### Frontend Can't Reach Backend

**Problem:** API calls fail with "Failed to fetch"

**Solutions:**

```bash
# Verify backend is running
curl http://localhost:5000/health

# Check CORS in backend/src/server.ts
# Should have: app.use(cors())

# Verify VITE_API_URL in frontend/.env
cat frontend/.env

# Clear browser cache
# Press Ctrl+Shift+Delete in Chrome
```

### GitHub Integration Not Working

**Problem:** "GitHub API error: Not Found"

**Solutions:**

```bash
# Verify token format
# Should start with: ghp_ or github_pat_

# Test token directly
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/user

# Verify repo name format
# Should be: owner/repo (e.g., RoshiniGunasekaran/QA-Pulse)

# Check repo is accessible
# Token must have 'repo' permission
```

### TypeScript Errors

**Problem:** "Cannot find module" errors

**Solutions:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check tsconfig.json
cat tsconfig.json

# Rebuild TypeScript
npm run build
```

### Performance Issues

**Problem:** Dashboard loads slowly

**Solutions:**

```bash
# Check database indexes
SELECT * FROM pg_indexes;

# Verify API response time
curl -w "@curl-format.txt" \
  http://localhost:5000/api/dashboard/summary?projectId=3

# Optimize queries (check backend logs)
# Look for slow queries

# Consider pagination for large datasets
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Development Workflow

1. **Fork the repository**

```bash
git clone https://github.com/YOUR_USERNAME/QA-Pulse.git
cd qa-pulse
```

2. **Create feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

- Follow existing code style
- Add comments for complex logic
- Test thoroughly

4. **Commit changes**

```bash
git add .
git commit -m "Add amazing feature"
```

5. **Push to fork**

```bash
git push origin feature/amazing-feature
```

6. **Open Pull Request**

- Describe what changed
- Explain why it's needed
- Link related issues

### Code Standards

- Use TypeScript with strict mode
- Follow ESLint rules
- Write descriptive commit messages
- Add comments for non-obvious code
- Test before pushing

### Testing

```bash
# Run tests
npm test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

**MIT License Summary:**
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 📞 Contact & Support

**Questions or Issues?**

- **Email:** support@qapulse.com
- **GitHub Issues:** [Report a bug](https://github.com/RoshiniGunasekaran/QA-Pulse/issues)
- **GitHub Discussions:** [Ask a question](https://github.com/RoshiniGunasekaran/QA-Pulse/discussions)

**Follow the Project**

- ⭐ Star on GitHub
- 🐦 Follow on Twitter
- 💼 Connect on LinkedIn

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub API Reference](https://docs.github.com/en/rest)
- [Slack API Documentation](https://api.slack.com/)

---

## 🎯 Roadmap

### Q1 2026
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Custom risk formulas
- [ ] Webhook support for incoming commits

### Q2 2026
- [ ] CLI tool for local testing
- [ ] Mobile app (React Native)
- [ ] SSO/SAML integration
- [ ] API rate limiting

### Q3 2026
- [ ] AI-powered risk prediction
- [ ] Historical trend analysis
- [ ] Custom reports and exports
- [ ] Team collaboration features

### Q4 2026
- [ ] Enterprise features
- [ ] Premium support
- [ ] White-label option
- [ ] Advanced security features

---

## 🙏 Acknowledgments

Built with ❤️ by [Roshini Gunasekaran](https://github.com/RoshiniGunasekaran)

**Technologies & Tools:**
- React & Vite team
- Express.js community
- PostgreSQL developers
- Docker & containerization
- Open source community

---

**Made with 💚 for QA teams everywhere**

Last Updated: September 2026