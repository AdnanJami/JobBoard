# JobBoard

JobBoard is a full-stack web app for organizing job postings and tracking applications. Paste the text of a job ad to extract its details with the Groq API, review the prefilled form, and publish the listing to the board.

## Features

- Extract structured fields from pasted job ads, including title, company, location, skills, requirements, and deadline. Add the original posting URL if available.
- Review and edit the extracted details before publishing, or fill out the form manually. Update or delete your own listings.
- Browse listings, save jobs for later, and mark jobs as applied. Application tracking records your status inside JobBoard. Use the original posting link to apply externally.
- Use **My Jobs** to revisit listings you posted, saved, or marked as applied.
- Register and sign in with JWT-based authentication.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Bootstrap, Axios |
| Backend | Python, Django, Django REST Framework, Simple JWT |
| Database | SQLite for local development, configurable through `DATABASE_URL` |
| Job ad extraction | Groq API |

## Run locally

You’ll need Git, Python 3.12 or 3.13, and Node.js 22.12 or newer with npm. A Groq API key is needed to extract job details from pasted ads.

### 1. Set up the backend

From a terminal, clone the repository and create a virtual environment.

```bash
git clone https://github.com/AdnanJami/JobBoard.git
cd JobBoard
python -m venv .venv
```

Activate the virtual environment.

**macOS / Linux (Bash)**

```bash
source .venv/bin/activate
```

**Windows (PowerShell)**

```powershell
.\.venv\Scripts\Activate.ps1
```

Create a `.env` file in the repository root, next to `manage.py`. Generate a Django secret with `python -c "import secrets; print(secrets.token_urlsafe(50))"` and copy the output into `SECRET_KEY`. The database URL uses a fresh local SQLite file. Add `GROQ_API_KEY` when you want to enable job ad extraction.

```dotenv
SECRET_KEY=your_generated_django_secret
DATABASE_URL=sqlite:///jobboard.local.sqlite3
GROQ_API_KEY=your_groq_api_key
```

Install the backend dependencies, apply migrations, and start Django.

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000`.

### 2. Set up the frontend

In a second terminal, go to `JobBoard/frontend` and create a `.env.local` file there.

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`, register an account, and sign in. Open the job posting page to paste a job ad and review the extracted details, or choose **Fill Manually** to enter them yourself.

## API overview

Send an `Authorization: Bearer <access_token>` header with authenticated requests. Registration and token endpoints are available without an access token.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register/` | Create an account |
| `POST` | `/api/v1/auth/token/` | Sign in and obtain tokens |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh an access token |
| `GET` | `/api/v1/current-user/` | Get the signed-in username |
| `GET`, `POST` | `/api/v1/jobs/` | List or create job postings |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/v1/jobs/{id}/` | View, update, or delete a posting |
| `POST` | `/api/v1/extract-job/` | Extract fields from `post_text`, with an optional `job_url` |
| `GET`, `POST`, `DELETE` | `/api/v1/saved-jobs/` | List, save, or unsave tracked jobs |
| `GET`, `POST`, `DELETE` | `/api/v1/applied-jobs/` | List, mark, or unmark jobs as applied |

## Repository structure

| Path | Contents |
| --- | --- |
| [`frontend/`](frontend/) | React pages, components, and API client |
| [`api/`](api/) | REST API routes, serializers, and views |
| [`backends/`](backends/) | Job models, migrations, and Groq extraction logic |
| [`job_project/`](job_project/) | Django settings and URL configuration |
