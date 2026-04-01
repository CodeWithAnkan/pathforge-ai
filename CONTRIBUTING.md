# Contributing to PathForge AI

Thank you for your interest in contributing to **PathForge AI**. This project aims to build an AI-powered platform for intelligent career and skill development guidance.

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/CodeWithAnkan/pathforge-ai.git
cd pathforge-ai
```

### 2. Install dependencies

For frontend:

```bash
cd frontend
npm install
npm run dev
```

For backend:

```bash
cd backend
npm install
npm start
```

---

## Project Structure

```
pathforge-ai/
│
├── frontend/        # React frontend
├── backend/         # Node.js + Express backend
└── README.md
```

---

## Contribution Workflow

1. Fork the repository
2. Clone your fork
3. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes
5. Commit your work:

```bash
git commit -m "feat: add new feature"
```

6. Push to your fork:

```bash
git push origin feature/your-feature-name
```

7. Open a Pull Request

---

## Coding Guidelines

* Use consistent naming conventions
* Follow existing folder structure
* Keep components modular and reusable
* Write clean and readable code

---

## API Guidelines

* Use RESTful conventions

Examples:

* `GET /api/users`
* `POST /api/auth/login`

Always return structured JSON:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

---

## Testing

* Test your feature before pushing
* Ensure no existing functionality breaks

---

## Commit Message Format

Use clear and meaningful commit messages:

* `feat:` → New feature
* `fix:` → Bug fix
* `docs:` → Documentation changes
* `refactor:` → Code improvements

Examples:

```
feat: add AI recommendation engine
fix: resolve login authentication bug
```

---

## Important Rules

* Do not push directly to `main`
* Always create a pull request
* Keep commits small and meaningful

---

## Final Note

Consistency and clarity are key. Following these guidelines ensures smooth collaboration and maintainability of the project.
