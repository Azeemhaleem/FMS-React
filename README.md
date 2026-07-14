# Traffic Fine Management System

A web-based traffic fine management system developed to digitize and simplify the process of issuing, managing, and reviewing traffic fines. The application uses separate React and Laravel projects connected through REST API requests.

## Key Features

- Role-based portals for drivers, police officers, higher officers, and system administrators
- Traffic fine creation and management
- Driver and offence record handling
- Fine status tracking
- Notifications and downloadable fine-related documents
- Form validation and API error handling
- Responsive user interfaces built with Bootstrap
- Seeded development data for testing

## Technologies Used

### Frontend
- React
- JavaScript
- Bootstrap
- Axios
- React Router

### Backend
- Laravel
- PHP
- REST API
- SQLite
- Laravel database migrations and seeders
- CORS configuration

### Development Tools
- Git and GitHub
- Postman
- Visual Studio Code

## System Architecture

The project is divided into two separate applications:

```text
Frontend (React)
        |
        | REST API requests
        v
Backend (Laravel)
        |
        v
SQLite Database
```

The React frontend communicates with the Laravel backend through API endpoints. CORS is configured in the backend to allow requests from the frontend development server.

## Project Setup

### 1. Clone the repositories

Clone the frontend and backend repositories separately.

```bash
git clone <frontend-repository-url>
git clone <backend-repository-url>
```

## Backend Setup

Navigate to the Laravel project:

```bash
cd backend-project
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Create the SQLite database file:

```bash
touch database/database.sqlite
```

On Windows PowerShell, use:

```powershell
New-Item database/database.sqlite -ItemType File
```

Update the database configuration in `.env`:

```env
DB_CONNECTION=sqlite
```

Run migrations and seeders:

```bash
php artisan migrate --seed
```

Start the Laravel development server:

```bash
php artisan serve
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

## Frontend Setup

Navigate to the React project:

```bash
cd frontend-project
```

Install dependencies:

```bash
npm install
```

Configure the backend API base URL in the frontend environment file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the frontend development server:

```bash
npm run dev
```

Open the URL displayed in the terminal, normally:

```text
http://localhost:5173
```

## API Testing

Postman can be used to test backend endpoints before integrating them with the React frontend.

Example API base URL:

```text
http://127.0.0.1:8000/api
```

For protected endpoints, include the required authentication token and request headers.

## CORS Configuration

The Laravel CORS configuration must allow requests from the frontend URL, such as:

```text
http://localhost:5173
```

After updating environment or configuration files, clear the Laravel cache:

```bash
php artisan optimize:clear
```

## Database Seeding

The project uses Laravel seeders to create sample records for development and testing.

To rebuild the database with seeded data:

```bash
php artisan migrate:fresh --seed
```

> This command deletes existing database records before recreating the tables.

## My Contribution

- Developed responsive React frontend interfaces using Bootstrap
- Integrated frontend components with Laravel REST API endpoints
- Implemented client-side form validation, loading states, and API error handling
- Tested API requests using Postman
- Contributed to the database ER diagram and system data design

## Project Status

The system is under active development. Additional improvements and features may be added as development continues.

## License

This project was developed for academic and educational purposes.