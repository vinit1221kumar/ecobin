# 🌱 EcoBin - Smart E-Waste Management System

A comprehensive web application for managing electronic waste collection, recycling, and rewarding users with green credits that can be redeemed for eco-friendly products.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [User Roles](#user-roles)
- [Key Features](#key-features)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### For Residents
- 📱 Schedule e-waste pickups with photo upload
- 💚 Earn green credits for recycling
- 🛍️ Redeem credits for eco-friendly products
- 📊 Track pickup history and credit transactions
- 🔔 Real-time pickup status updates

### For Collectors
- 📋 View assigned pickup requests
- ✅ Update pickup status with proof photos
- 💰 Earn credits for completed pickups
- 🛍️ Redeem credits for eco-friendly products
- 📍 Access resident location and contact details

### For Admins
- 👥 Manage users (residents, collectors, admins)
- 📦 Oversee all pickup operations
- 💰 Assign bonus credits (multiples of 5)
- 🏪 Manage eco-friendly product catalog
- 📊 View comprehensive analytics
- 🔧 System configuration and monitoring

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM v7
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP
- **HTTP Client**: Fetch API

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **CORS**: cors middleware

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + Vite + Tailwind CSS + React Router                 │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Landing  │  Login   │ Register │Dashboards│             │
│  └──────────┴──────────┴──────────┴──────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │ JWT Authentication
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                              │
│  Node.js + Express.js + Middleware                          │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │   Auth   │  Pickup  │  Credit  │  Admin   │             │
│  │Controller│Controller│Controller│Controller│             │
│  └──────────┴──────────┴──────────┴──────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────┐ ┌──▼──────┐
│   MongoDB    │ │  Redis  │ │  MinIO  │ │   JWT   │
│   Database   │ │  Cache  │ │ Storage │ │  Tokens │
└──────────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB v6 or higher
- Redis v7 or higher
- MinIO (or S3-compatible storage)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ecobin.git
cd ecobin
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

3. **Set up Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

For detailed setup instructions, see [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

## 📚 Documentation

- **[SYSTEM_MAPPING.md](SYSTEM_MAPPING.md)** - Complete system architecture and data flow
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Testing and verification guide
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Step-by-step setup instructions

---

## 👥 User Roles

### Resident
- Schedule e-waste pickups
- Upload photos of e-waste
- View pickup history
- Earn and redeem green credits
- View eco-friendly products

### Collector
- View assigned pickups
- Update pickup status
- Upload proof photos
- Earn and redeem green credits
- View eco-friendly products

### Admin
- Manage all users (cannot deactivate other admins)
- Assign credits to users (multiples of 5)
- Manage all pickups
- Assign collectors to pickups
- Manage eco-friendly product catalog
- View system analytics

---

## 🎯 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Protected routes

### Pickup Management
- Create pickup requests with photos
- Assign collectors to pickups
- Track pickup status (pending → assigned → accepted → reached → completed)
- Upload proof of collection

### Credit System
- Earn credits for completed pickups
- Admin can assign bonus credits (multiples of 5)
- Redeem credits for eco-friendly products
- Transaction history tracking

### Partner Management
- Admin can add/edit/delete partners
- Default eco-friendly products:
  - Reusable Water Bottle (50 credits)
  - Bamboo Cutlery Set (75 credits)
- All users can view and redeem products

### Analytics Dashboard
- Total pickups and completed pickups
- Total e-waste collected (kg)
- Total credits distributed
- Active users count

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register resident/collector
POST   /api/auth/login             - Login resident/collector
POST   /api/auth/admin/register    - Register admin
POST   /api/auth/admin/login       - Login admin
GET    /api/auth/me                - Get current user
```

### Pickups
```
POST   /api/pickups                - Create pickup (Resident)
GET    /api/pickups/my             - Get my pickups (Resident)
GET    /api/pickups/assigned       - Get assigned pickups (Collector)
PATCH  /api/pickups/:id/status     - Update pickup status (Collector)
```

### Credits
```
GET    /api/credits/my             - Get my credits & transactions
POST   /api/credits/redeem         - Redeem credits (Resident/Collector)
```

### Partners
```
GET    /api/partners               - Get all active partners
```

### Admin
```
GET    /api/admin/users            - Get all users
PATCH  /api/admin/users/:id        - Update user
POST   /api/admin/users/:id/credits - Assign credits
GET    /api/admin/pickups          - Get all pickups
PATCH  /api/admin/pickups/:id/assign - Assign collector
POST   /api/admin/pickups/schedule - Schedule pickup
GET    /api/admin/stats            - Get statistics
GET    /api/admin/partners         - Get all partners
POST   /api/admin/partners         - Create partner
PATCH  /api/admin/partners/:id     - Update partner
DELETE /api/admin/partners/:id     - Delete partner
```

For complete API documentation, see [SYSTEM_MAPPING.md](SYSTEM_MAPPING.md)

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecobin
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ecobin-uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
Follow the checklist in [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

---

## 📦 Project Structure

```
ecobin/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, MinIO config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions, seeders
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── SYSTEM_MAPPING.md        # System architecture
├── VERIFICATION_CHECKLIST.md # Testing guide
├── QUICK_START_GUIDE.md     # Setup instructions
└── README.md                # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by sustainable development goals
- Built with ❤️ for a greener future

---

## 📞 Support

For support, email support@ecobin.com or open an issue in the repository.

---

## 🔄 Version History

- **v1.0.0** (2025-11-09)
  - Initial release
  - User authentication and authorization
  - Pickup management system
  - Credit system with redemption
  - Admin dashboard with analytics
  - Default eco-friendly products
  - Complete documentation

---

**Made with 🌱 for a sustainable future**
