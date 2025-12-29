# 📝 Smart ToDo API

A RESTful backend API for task management with user authentication.

---

## 🚀 Features

- User Authentication using JWT
- Secure APIs with middleware
- CRUD operations for tasks
- Each user can manage their own tasks
- MongoDB for data storage

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Postman (API Testing)

---

## 📁 API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|------|---------|------------|
| POST | /api/v1/users/register | Register user |
| POST | /api/v1/users/login | Login user |
| POST | /api/v1/users/logout | Logout user |

### Task Routes (Protected)
| Method | Endpoint | Description |
|------|---------|------------|
| POST | /api/v1/users/tasks | Create task |
| GET | /api/v1/users/tasks | Get all tasks |
| GET | /api/v1/users/tasks/:id | Get single task |
| PUT | /api/v1/users/tasks/:id | Update task |
| DELETE | /api/v1/users/tasks/:id | Delete task |

## ⭐ Additional Features

The following additional features were implemented to enhance security and user experience:

| Feature | Description |
|-------|-------------|
| Change Password | /change-password | Allows an authenticated user to securely change their password by providing the current and new password. |
| Update Account Details | /update-account | Enables users to update profile information such as full name and email while maintaining data integrity. |
| Refresh Token | /refresh-token | Implements refresh token mechanism to generate a new access token without requiring the user to log in again. |


---

## 🔐 Authentication

- Access Token is used to access protected routes
- Token can be sent via:
  - HTTP-only cookies (browser)
  - Authorization header (Postman)

Example:

Authorization: Bearer <access_token>
---

## 🧪 Postman Collection

Postman collection is available in the repository:

postman/SmartToDo.postman_collection.json

Import this file into Postman to test APIs.

---

## ⚙️ Environment Variables

Create a `.env` file using this template:

```env
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017
CORS_ORIGIN =*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY = 1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY = 10d

▶️ Run Locally

npm install
npm run dev

👨‍💻 Author

Sougata Purkait
