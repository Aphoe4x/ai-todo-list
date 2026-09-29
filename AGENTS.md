# AGENTS.md

## Project Overview

A simple todo list application with a PHP/MySQL backend and vanilla JavaScript frontend.

## Tech Stack

- **Frontend:** Vanilla JavaScript, CSS3, Font Awesome 6.4
- **Backend:** PHP 8.2
- **Database:** PostgreSQL (Render) / MySQL (local XAMPP)
- **Server:** Apache 2.4 (XAMPP)

## File Structure

```
ai-todo-list/
├── index.php          # Main frontend (Tasks, Calendar, Board, Timer tabs)
├── css/
│   └── style.css      # All styles (light/dark theme, responsive)
├── js/
│   └── app.js         # All frontend logic
├── api/
│   ├── config.php     # PDO connection (PostgreSQL) + auto-migration + CORS headers
│   ├── addTodo.php    # POST - Create a new todo
│   ├── getTodos.php   # GET - Fetch all todos
│   ├── updateTodo.php # POST - Update a todo (text, completed, priority, etc.)
│   └── deleteTodo.php # POST - Delete a todo
└── AGENTS.md          # This file
```

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    "dueDate" DATE,
    status VARCHAR(20) DEFAULT 'backlog',
    "timerDate" DATE,
    completed SMALLINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### GET `api/getTodos.php`
Returns all todos ordered by `created_at DESC`.

**Response:**
```json
{
  "todos": [
    {
      "id": 1,
      "text": "Task name",
      "description": "",
      "priority": "medium",
      "completed": false,
      "dueDate": null,
      "status": "backlog",
      "timerDate": null,
      "createdAt": "2026-09-29 04:28:56"
    }
  ],
  "success": true
}
```

### POST `api/addTodo.php`
Creates a new todo.

**Body:**
```json
{
  "text": "Task name",
  "priority": "high",
  "dueDate": "2026-12-31",
  "status": "backlog",
  "timerDate": null,
  "description": ""
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "text": "Task name",
  "priority": "high",
  "dueDate": "2026-12-31",
  "status": "backlog",
  "timerDate": null
}
```

### POST `api/updateTodo.php`
Updates an existing todo.

**Body:**
```json
{
  "id": 1,
  "text": "Updated task",
  "priority": "low",
  "dueDate": null,
  "status": "done",
  "timerDate": null,
  "completed": 1
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "message": "Todo updated successfully"
}
```

### POST `api/deleteTodo.php`
Deletes a todo.

**Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "message": "Todo deleted successfully"
}
```

## Testing Rules

After creating or modifying any API endpoint, always run these tests:

### 1. Create a todo
```powershell
echo '{"text":"Test task","priority":"high"}' | curl.exe -s -X POST http://localhost/ai-todo-list/api/addTodo.php -H "Content-Type: application/json" -d "@-"
```
Expected: `{"success":true,"id":1,...}`

### 2. Get all todos
```powershell
curl.exe -s http://localhost/ai-todo-list/api/getTodos.php
```
Expected: `{"todos":[...],"success":true}`

### 3. Update a todo
```powershell
echo '{"id":1,"text":"Updated task","completed":1}' | curl.exe -s -X POST http://localhost/ai-todo-list/api/updateTodo.php -H "Content-Type: application/json" -d "@-"
```
Expected: `{"success":true,"id":1,"message":"Todo updated successfully"}`

### 4. Delete a todo
```powershell
echo '{"id":1}' | curl.exe -s -X POST http://localhost/ai-todo-list/api/deleteTodo.php -H "Content-Type: application/json" -d "@-"
```
Expected: `{"success":true,"id":1,"message":"Todo deleted successfully"}`

### 5. Validate
- Check HTTP status code is 200
- Check response has `"success": true`
- Verify data changed by calling `getTodos.php` again

## Common Issues

| Issue | Solution |
|-------|----------|
| JSON body truncated (Content-Length too small) | Use `echo` pipe in PowerShell, not `-d` directly |
| Database table missing columns | Run the schema SQL above |
| CORS errors | Check headers in `api/config.php` |
| `Undefined table: todos` | Auto-migration runs on first request — wait and retry |
| `Connection refused` | Database not linked in Render — check Blueprint envVars |
| `mysqli not found` | Use PDO/pgsql, not MySQLi (Render uses PostgreSQL) |
| `Unknown column` errors | Database schema out of sync with API — recreate table |

## Production Deployment

### Vercel (Frontend Only)
- Vercel does NOT support PHP — the API must be rewritten as serverless functions (Node.js)
- Use a hosted MySQL database: PlanetScale, Supabase, or Railway
- Set database credentials as environment variables in Vercel dashboard
- Build command: `none` (static site)
- Output directory: `root`

### Alternative Hosting (PHP + MySQL)
- **Railway** — supports PHP + MySQL natively
- **DigitalOcean** — $4/month droplet with LAMP stack
- **Shared hosting** — cPanel-based hosting supports PHP/MySQL

### Environment Variables
```env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
```

## Development Guidelines

- Keep frontend vanilla JavaScript — no frameworks
- Use prepared statements for all database queries
- Validate all inputs before database operations
- Return consistent JSON response format: `{"success": bool, ...}`
- Test all endpoints after any API change
- Never commit database credentials to Git
