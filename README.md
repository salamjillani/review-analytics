# Review Analytics Platform

## Overview
The **Review Analytics Platform** is a web-based system designed to process and analyze customer reviews for fast delivery agents. The platform provides automated and manual tagging of reviews, a React-based dashboard for analytics visualization, and role-based access control (RBAC) to manage user permissions.

## Features

### 1. **Data Processing & Tagging**
- Load a dataset of **Fast Delivery Agent Reviews** (minimum 500 records) into MongoDB.
- Implement an API to allow **manual tagging** of reviews.
- Develop an automated tagging system to classify reviews based on:
  - **Sentiment**: Positive, Neutral, Negative.
  - **Performance**: Fast, Average, Slow Delivery.
  - **Accuracy**: Order Accurate, Order Mistake.

### 2. **Dashboard & Analytics**
- A **React-based dashboard** displaying key metrics:
  - **Average Agent Ratings** per location.
  - **Top & Bottom Performing Agents**.
  - **Most Common Customer Complaints**.
  - **Orders by Price Range & Discount Applied**.
- Filtering options based on **location, order type, and customer service rating**.

### 3. **Role-Based Access Control (RBAC)**
- Authentication implemented using **JWT & bcrypt**.
- Two user roles:
  - **Admin**: Manage users, view all analytics, edit review tags.
  - **User**: View analytics but cannot edit data.
- Secure API routes based on user roles.

### 4. **API Development**
- **Express.js API** to:
  - Fetch review data from MongoDB.
  - Retrieve analytics data for dashboard visualization.
  - Manage user authentication & authorization.
  - Implement a tagging system for review classification.

---

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose.
- **Authentication**: JWT, bcrypt.
- **Data Processing**: Natural Language Processing (NLP) with `natural`.

---

## Installation & Setup

### **Prerequisites**
- Install **Node.js** & **MongoDB**.

### **Clone the Repository**
```sh
 git clone https://github.com/salamjillani/review-analytics.git
 cd review-analytics
```

### **Backend Setup**
```sh
 cd backend
 npm install
 cp .env.example .env  # Configure environment variables
 npm run dev   # Start backend server (nodemon)
```

### **Frontend Setup**
```sh
 cd frontend
 npm install
 npm run dev  # Start frontend development server
```

---

## API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login and receive a JWT token.

### **Review Management**
- `GET /api/reviews` - Fetch all reviews.
- `POST /api/reviews/tag` - Manually tag a review.

### **Analytics**
- `GET /api/analytics` - Retrieve analytics data for the dashboard.

---

## User Roles & Permissions
| Role  | View Analytics | Manage Users | Edit Review Tags |
|-------|--------------|--------------|----------------|
| Admin | ✅           | ✅           | ✅              |
| User  | ✅           | ❌           | ❌              |

---

## Contributing
1. **Fork** the repository.
2. **Create a new branch** (`feature-branch`).
3. **Commit changes** and push.
4. **Submit a pull request**.



