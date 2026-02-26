# Library Management System

This project is a Library Management System built using React for the frontend, Django for the backend, and PostgreSQL as the database. It allows users to manage books, view their profiles, and perform various library-related actions.

## Project Structure

```
library-management-system
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── BookList.tsx
│   │   │   ├── BookForm.tsx
│   │   │   └── UserDashboard.tsx
│   │   ├── pages
│   │   │   ├── Home.tsx
│   │   │   ├── Books.tsx
│   │   │   └── Profile.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend
│   ├── library
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js and npm installed for the frontend
- Python and pip installed for the backend
- PostgreSQL installed and running

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

4. Configure the PostgreSQL database in `config/settings.py`:
   - Update the `DATABASES` setting with your PostgreSQL credentials.

5. Run database migrations:
   ```
   python manage.py migrate
   ```

6. Start the Django development server:
   ```
   python manage.py runserver
   ```

## Usage

- Access the frontend application at `http://localhost:3000`.
- The backend API will be available at `http://localhost:8000/api/`.

## Features

- View a list of books
- Add or edit book details
- User profile management
- Responsive design for various devices

## Contributing

Feel free to fork the repository and submit pull requests for any improvements or features you would like to add.