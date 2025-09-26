# Villa Rental Management System

A comprehensive backend API for managing villa rentals with features like user authentication, booking management, payment processing, and notifications.

## Features

- **User Authentication**: JWT-based authentication with role-based access (Guest/Owner/Admin)
- **Villa Management**: Create, update, publish villas with images and amenities
- **Booking System**: Advanced booking management with availability checking
- **Payment Integration**: Support for Stripe and Razorpay payment gateways
- **Notification System**: Email and WhatsApp notifications for booking updates
- **PDF Generation**: Automatic invoice generation for confirmed bookings
- **Automated Tasks**: Scheduled cleanup of unpaid bookings

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Payments**: Stripe & Razorpay
- **Notifications**: Nodemailer (email) & Twilio (WhatsApp)
- **PDF Generation**: PDFKit
- **Testing**: Jest

## Project Structure

```
src/
├── auth/           # Authentication module
├── booking/        # Booking management
├── notification/   # Email & WhatsApp notifications
├── payment/        # Payment processing
├── prisma/         # Database service
├── user/           # User management
├── villa/          # Villa management
└── main.ts         # Application entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd villa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables in `.env`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/villa_rental"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Email Configuration (Optional)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   EMAIL_FROM="your-email@gmail.com"

   # Twilio Configuration (Optional)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

   # Stripe Configuration (Optional)
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

   # Razorpay Configuration (Optional)
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

   # Application Configuration
   PORT="3000"
   DOMAIN="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## Frontend

This repository includes a React frontend application located in the `frontend` directory for browsing published villas.

```bash
cd frontend
npm install
npm start
```

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run build
npm run build
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### User Management
- `GET /user/me` - Get current user profile

### Villa Management
- `GET /villa` - List all published villas
- `GET /villa/:id` - Get villa details
- `POST /villa` - Create villa (Owner only)
- `GET /villa/mine` - Get own villas (Owner only)
- `PATCH /villa/:id` - Update villa (Owner only)
- `DELETE /villa/:id` - Delete villa (Owner only)
- `GET /villa/:id/availability` - Get villa availability
- `POST /villa/:id/availability` - Block dates (Owner only)

### Booking Management
- `POST /booking` - Create booking
- `GET /booking/mine` - Get user's bookings
- `POST /booking/:id/confirm` - Confirm booking (Owner only)
- `POST /booking/:id/reject` - Reject booking (Owner only)
- `GET /booking/villa/:id` - Get bookings for villa (Owner only)

### Payment Processing
- `POST /payment/initiate` - Initiate payment
- `POST /payment/webhook/stripe` - Stripe webhook
- `POST /payment/webhook/razorpay` - Razorpay webhook

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `EMAIL_HOST` | ❌ | SMTP host for email notifications |
| `EMAIL_PORT` | ❌ | SMTP port (default: 587) |
| `EMAIL_USER` | ❌ | SMTP username |
| `EMAIL_PASS` | ❌ | SMTP password |
| `EMAIL_FROM` | ❌ | From email address |
| `TWILIO_ACCOUNT_SID` | ❌ | Twilio account SID for WhatsApp |
| `TWILIO_AUTH_TOKEN` | ❌ | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | ❌ | Twilio WhatsApp number |
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ❌ | Stripe webhook secret |
| `RAZORPAY_KEY_ID` | ❌ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ❌ | Razorpay secret |
| `PORT` | ❌ | Application port (default: 3000) |
| `DOMAIN` | ❌ | Application domain for redirects |

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **User**: Authentication and profile management
- **Villa**: Property details and management
- **Booking**: Reservation management
- **Payment**: Payment transaction tracking
- **Notification**: Notification history
- **VillaAvailability**: Availability management
- **Review**: User reviews and ratings

## Security Features

- JWT-based authentication
- Environment variable configuration
- Input validation and sanitization
- CORS enabled for frontend integration
- Error handling without sensitive data exposure

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## License

This project is licensed under the UNLICENSED license.
