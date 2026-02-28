# 📚 Library Management System

A modern, full-stack web application for managing a library's book collection. Built with **React** (frontend), **Django REST Framework** (backend), and **SQLite** (database).

## ✨ Features

- **User Authentication**: Secure login/registration with JWT tokens
- **Role-Based Access Control**: Different permissions for staff and students
- **Book Management**: Staff can add, edit, and delete books
- **Book Viewing**: Students can browse and view all available books
- **User Profiles**: Users can manage their profile information
- **Responsive Design**: Works on desktop and mobile devices
- **Automatic Token Refresh**: Seamless user experience with token management

## 🎯 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 16+** (for frontend)
- **Git** (for version control)

### Backend Setup

```bash
# Navigate to project root
cd library-management-system

# Create and activate virtual environment
python -m venv backend\venv
backend\venv\Scripts\Activate.ps1   # Windows PowerShell
# or
source backend/venv/bin/activate   # macOS/Linux

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
python -m pip install "setuptools<70"   # Fix for Python 3.13

# Run migrations
python backend/manage.py migrate

# Start development server
python backend/manage.py runserver
# Server runs on http://127.0.0.1:8000
```

### Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin Panel**: http://localhost:8000/admin

## 🏗️ Project Architecture

### Overall System Flow

```
Browser (Frontend)
        ↓
  React + TypeScript
  (Port 5173)
        ↓
  HTTP/REST API Calls
  (JSON Data Exchange)
        ↓
  Django REST Server
  (Port 8000)
        ↓
  SQLite Database
  (db.sqlite3)
```

### Directory Structure

```
library-management-system/
├── backend/                       # Django backend
│   ├── config/                    # Project settings
│   │   ├── settings.py           # Database, apps, security
│   │   ├── urls.py               # Main URL routing
│   │   └── wsgi.py               # Server entry point
│   ├── library/                  # Main application
│   │   ├── models.py             # Database models
│   │   ├── views.py              # API endpoints
│   │   ├── serializers.py        # JSON converters
│   │   ├── permissions.py        # Access control
│   │   ├── urls.py               # Route definitions
│   │   ├── admin.py              # Admin panel config
│   │   ├── migrations/           # Database migrations
│   │   ├── tests/                # Unit tests
│   │   └── utils/                # Helper functions
│   ├── db.sqlite3                # SQLite database
│   ├── manage.py                 # Django CLI tool
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Virtual environment
│
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Root component
│   │   ├── pages/                # Full-page components
│   │   │   ├── Home.tsx
│   │   │   ├── Books.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Login.tsx
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── BookList.tsx
│   │   │   └── BookForm.tsx
│   │   ├── auth/                 # Authentication logic
│   │   │   ├── AuthContext.ts
│   │   │   ├── AuthProvider.tsx
│   │   │   └── index.ts
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBooks.ts
│   │   │   └── index.ts
│   │   ├── services/             # API communication
│   │   │   ├── apiClient.ts      # Organized API client
│   │   │   └── api.ts            # Legacy API
│   │   ├── utils/                # Helper utilities
│   │   │   ├── tokenManager.ts   # JWT token handling
│   │   │   ├── errorHandler.ts   # Error utilities
│   │   │   └── index.ts
│   │   ├── constants/            # Config constants
│   │   │   └── index.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── styles/               # CSS stylesheets
│   ├── index.html
│   ├── vite.config.ts            # Vite development server config
│   ├── tsconfig.json             # TypeScript configuration
│   ├── package.json              # npm dependencies
│   └── node_modules/
│
├── ARCHITECTURE.md               # Detailed architecture documentation
├── README.md                     # This file
└── .gitignore
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/token/`         | Login (returns JWT token) |
| POST   | `/api/register/`      | Register new account      |
| POST   | `/api/token/refresh/` | Refresh expired token     |
| GET    | `/api/me/`            | Get current user info     |

### Books Management

| Method | Endpoint           | Description     | Who Can Access |
| ------ | ------------------ | --------------- | -------------- |
| GET    | `/api/books/`      | Get all books   | Everyone       |
| POST   | `/api/books/`      | Add new book    | Staff only     |
| GET    | `/api/books/{id}/` | Get single book | Everyone       |
| PUT    | `/api/books/{id}/` | Update book     | Staff only     |
| DELETE | `/api/books/{id}/` | Delete book     | Staff only     |

### User Profile

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| GET    | `/api/profile/` | Get user profile    |
| PUT    | `/api/profile/` | Update user profile |

## 🔐 Authentication & Authorization

### How Authentication Works

1. **Registration**: User creates account with username and password
2. **Login**: User submits credentials to `/api/token/`
3. **Token Generation**: Django validates credentials and returns JWT tokens
4. **Token Storage**: Frontend saves tokens in `localStorage`
5. **API Requests**: All subsequent requests include token in header:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhb...
   ```
6. **Token Verification**: Django validates token and grants access
7. **Token Expiry**: When token expires, frontend uses refresh token to get new one

### Role-Based Permissions

```
Student (is_staff = False):
├─ Can: View all books
├─ Can: View profiles
├─ Cannot: Add books
├─ Cannot: Edit books
└─ Cannot: Delete books

Staff (is_staff = True):
├─ Can: View all books
├─ Can: Add new books
├─ Can: Edit any book
└─ Can: Delete any book
```

## 💾 Database Schema

### User Table (auth_user)

| Column     | Type         | Description             |
| ---------- | ------------ | ----------------------- |
| id         | INTEGER      | Primary key             |
| username   | VARCHAR(150) | Unique username         |
| password   | VARCHAR(128) | Hashed password         |
| email      | VARCHAR(254) | Email address           |
| is_staff   | BOOLEAN      | Staff flag (True/False) |
| is_active  | BOOLEAN      | Account status          |
| first_name | VARCHAR(150) | First name              |
| last_name  | VARCHAR(150) | Last name               |

### Book Table (library_book)

| Column         | Type         | Description                   |
| -------------- | ------------ | ----------------------------- |
| id             | INTEGER      | Primary key                   |
| title          | VARCHAR(255) | Book title                    |
| author         | VARCHAR(255) | Author name                   |
| isbn           | VARCHAR(13)  | ISBN (unique)                 |
| published_date | DATE         | Publication date              |
| user_id        | INTEGER      | Staff member ID (foreign key) |

### User Profile Table (library_userprofile)

| Column  | Type    | Description                       |
| ------- | ------- | --------------------------------- |
| id      | INTEGER | Primary key                       |
| user_id | INTEGER | User ID (foreign key, one-to-one) |
| bio     | TEXT    | User biography                    |

## 🚀 Technology Stack

### Frontend Stack

- **React 18**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Lightning-fast build tool
- **Axios**: HTTP client library
- **React Router v6**: Client-side routing
- **Context API**: Global state management
- **CSS3**: Styling

### Backend Stack

- **Django 4.2**: Python web framework
- **Django REST Framework**: API development toolkit
- **SimpleJWT**: JWT authentication
- **Django CORS Headers**: Cross-origin resource sharing
- **SQLite**: Lightweight database

## 🎓 Common Use Cases

### First-Time Student User

1. Opens application at http://localhost:5173
2. Clicks "Register" button
3. Creates account with username and password
4. Automatically logged in after registration
5. Redirected to books page
6. Browses all available books (read-only view)
7. Cannot add, edit, or delete books
8. Can view and edit their profile
9. Clicks logout to end session

### Staff Member

1. Logs in with staff credentials
2. Navigated to books management page
3. Sees "Add Book" form (only visible to staff)
4. Adds book with title, author, ISBN, and date
5. Can edit existing books
6. Can delete books from library
7. Manages library database
8. Logs out when finished

## 🔧 Development Workflow

### Making Backend Changes

```bash
# Activate virtual environment
backend\venv\Scripts\Activate.ps1

# Edit models in library/models.py
# Then create and apply migrations:
python backend/manage.py makemigrations
python backend/manage.py migrate

# Restart server
python backend/manage.py runserver
```

### Making Frontend Changes

```bash
# Frontend auto-reloads with Vite
# Just save files and changes appear instantly in browser
```

## 🧪 Testing

### Run Backend Tests

```bash
# Run all tests
python backend/manage.py test

# Run tests for specific app
python backend/manage.py test library
```

### Run Frontend Tests

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test
```

## 📦 Dependencies

### Backend Requirements

```
Django==4.2
djangorestframework==3.14.0
django-cors-headers==3.14.0
djangorestframework-simplejwt==5.2.2
python-dotenv==1.0.0
setuptools<70
```

### Frontend Dependencies

```
react@^18.x
react-router-dom@^6.x
axios@^1.x
typescript@^5.x
vite@^5.x
```

See `backend/requirements.txt` and `frontend/package.json` for full details.

## 🚨 Troubleshooting

### Backend Issues

**Port 8000 already in use:**

```bash
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
python backend/manage.py runserver 8001
```

**Database errors after changes:**

```bash
# Reset database
rm backend/db.sqlite3
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

**Login not working:**

```bash
# Ensure user exists in database
python backend/manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.all()
```

### Frontend Issues

**NPM dependencies broken:**

```bash
rm -r frontend/node_modules
rm frontend/package-lock.json
npm install
npm run dev
```

**localhost refuses connection:**

- Ensure backend is running on port 8000
- Check that frontend is on port 5173
- Verify CORS is enabled in Django

**Tokens not working:**

```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Then refresh and log in again
```

## 📖 Documentation

For detailed architectural information and design decisions, see [ARCHITECTURE.md](ARCHITECTURE.md).

Includes:

- Complete system flow diagrams
- User authentication flow
- Request-response examples
- Database relationship diagrams
- Design decisions and rationale

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. **Make** your changes
4. **Commit** with clear messages:
   ```bash
   git commit -m "Add YourFeature description"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/YourFeature
   ```
6. **Create** a Pull Request with description of changes

## 🔐 Security Considerations

### Current Development Setup

- ✓ JWT authentication
- ✓ Role-based access control
- ✓ Password hashing
- ✓ CORS configured
- ✓ Input validation

### For Production Deployment

- [ ] Enable HTTPS/SSL
- [ ] Set `DEBUG = False`
- [ ] Use environment variables for secrets
- [ ] Change `SECRET_KEY` in Django
- [ ] Use PostgreSQL instead of SQLite
- [ ] Add rate limiting on API
- [ ] Enable additional CSRF protection
- [ ] Implement two-factor authentication
- [ ] Add API throttling
- [ ] Set up logging and monitoring

## 📝 License

This project is open source and available under the **MIT License**.

## 👤 Author

**Afzal Hussain**

- GitHub: [@afzalhussain031](https://github.com/afzalhussain031)

## 🙏 Acknowledgments

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 📞 Support

Need help?

1. **Check Docs**: Read [ARCHITECTURE.md](ARCHITECTURE.md) for detailed information
2. **Review Code**: Check existing components for examples
3. **Search Issues**: Look for similar problems in GitHub Issues
4. **Create Issue**: Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Error messages/screenshots
   - Your environment info

---

**Last Updated**: February 28, 2026

Happy coding! 🎉
