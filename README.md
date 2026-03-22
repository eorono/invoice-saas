# Invoicing SaaS for Latin American Freelancers and SMEs

A full-stack web application for invoicing and payment tracking designed specifically for freelancers and small to medium enterprises in Latin America. Features multi-currency invoicing, payment status tracking, and integration with simulated payment gateways including NOWPayments (crypto), PayPal, SWIFT, and Zinli ACH Xpress.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Invoice Management**: Full CRUD operations for invoices
- **Payment Tracking**: Record and track payments with multiple methods
- **Multi-Currency Support**: Handle invoices and payments in various currencies (USD, EUR, GBP, VES, BRL, MXN, ARS, CLP, PEN, COP)
- **Payment Gateway Integration**: 
  - NOWPayments (cryptocurrency)
  - PayPal
  - SWIFT bank transfers
  - Zinli ACH Xpress (specifically for Latin American market)
- **Reporting**: Generate financial reports and export to PDF
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL database with Sequelize ORM
- JWT for authentication
- Winston for logging
- Swagger for API documentation

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Axios for HTTP requests
- Bootstrap-inspired custom CSS

### DevOps
- Docker containers for both frontend and backend
- Docker-compose for orchestration
- PostgreSQL database container

## Project Structure

```
invoicing-saas/
├── backend/                  # Node.js/Express backend
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── config/               # Configuration files
│   ├── .env.example          # Environment variables example
│   ├── Dockerfile            # Backend Dockerfile
│   ├── package.json          # Backend dependencies
│   └── server.js             # Entry point
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React context providers
│   │   ├── services/         # Service modules
│   │   ├── utils/            # Utility functions
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Global styles
│   ├── Dockerfile            # Frontend Dockerfile
│   └── package.json          # Frontend dependencies
├── docker-compose.yml        # Docker compose configuration
└── README.md                 # This file
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development without Docker)
- PostgreSQL (for local development without Docker)

### Running with Docker (Recommended)

1. Clone the repository
2. Copy the environment example file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   (Optional: Edit the .env file to customize settings)

3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Running Locally (Development)

#### Backend
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   (Edit .env as needed)
4. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Invoices
- `GET /api/invoices` - Get all invoices for user
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PUT /api/invoices/:id/send` - Mark invoice as sent
- `PUT /api/invoices/:id/pay` - Mark invoice as paid

### Payments
- `GET /api/payments` - Get all payments for user
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Record new payment
- `PUT /api/payments/:id` - Update payment
- `POST /api/payments/simulate/nowpayments` - Simulate NOWPayments
- `POST /api/payments/simulate/paypal` - Simulate PayPal
- `POST /api/payments/simulate/swift` - Simulate SWIFT
- `POST /api/payments/simulate/zinli-ach` - Simulate Zinli ACH Xpress
- `GET /api/payments/stats/summary` - Get payment statistics

### Reports
- `GET /api/reports/summary` - Get financial summary report
- `GET /api/reports/invoices/pdf` - Export invoices to PDF
- `GET /api/reports/payments/pdf` - Export payments to PDF

## Currency Support

The application supports the following currencies commonly used in Latin America and internationally:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- VES (Venezuelan Bolívar)
- BRL (Brazilian Real)
- MXN (Mexican Peso)
- ARS (Argentine Peso)
- CLP (Chilean Peso)
- PEN (Peruvian Sol)
- COP (Colombian Peso)

## Payment Methods

- Bank Transfer
- Credit Card
- PayPal
- Cryptocurrency (via NOWPayments simulation)
- SWIFT Bank Transfer
- Zinli ACH Xpress (specifically designed for Latin American markets)

## Environment Variables

Create a `.env` file in the backend directory based on `.env.example`:

```
NODE_ENV=development
PORT=5000
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=invoicing_saas
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_change_in_production
```

## Deployment

The application is containerized using Docker and can be deployed to any platform that supports Docker containers (AWS ECS, Google Cloud Run, Azure Container Instances, etc.) or to a traditional VPS with Docker installed.

For production, remember to:
1. Change the JWT_SECRET to a strong, unique value
2. Use proper PostgreSQL credentials
3. Configure real payment gateway API keys (not just simulations)
4. Set NODE_ENV=production
5. Consider using a reverse proxy (NGINX) for SSL termination

## License

MIT License - feel free to use this code for your own projects.

## Acknowledgments

- Built for Latin American freelancers and SMEs who need affordable invoicing solutions
- Special consideration for regions with limited access to traditional banking services
- Integrates with popular local payment methods like Zinli ACH Xpress