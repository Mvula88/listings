# PropLinka - Direct Property Connections Platform

> Linking buyers and sellers directly in Namibia and South Africa. Zero agent commissions, direct connections, massive savings.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

## 🎯 What is PropLinka?

PropLinka is a revolutionary property marketplace that eliminates traditional real estate agent commissions by linking buyers, sellers, and conveyancers (lawyers) directly. Users save 50-90% compared to traditional agent fees.

### Key Features

- **🏠 Free Property Listings** - Sellers list properties at no cost
- **💰 Massive Savings** - Platform fees 85-90% cheaper than agent commissions
- **👥 Direct Connections** - Buyers and sellers communicate directly
- **⚖️ Verified Lawyers** - Network of trusted conveyancers
- **📊 Property Analytics** - Track views, inquiries, and engagement
- **⭐ Lawyer Reviews** - Rate and review conveyancers
- **🔔 Smart Alerts** - Get notified of properties matching your criteria
- **🔒 Secure Transactions** - End-to-end transaction management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- (Optional) Resend account for emails
- (Optional) Upstash Redis for rate limiting

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proplinka.git
   cd proplinka
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your values:
   - Supabase URL and keys
   - Resend API key (for emails)
   - Upstash Redis (for rate limiting)
   - Sentry DSN (for error monitoring)

4. **Run database migrations**
   ```bash
   # Using Supabase CLI
   npx supabase db push

   # Or manually run migrations in Supabase dashboard
   # Files in: supabase/migrations/*.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
proplinka/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── browse/              # Property browsing
│   ├── properties/          # Property pages
│   └── lawyers/             # Lawyer directory
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   ├── properties/         # Property-specific components
│   ├── lawyers/            # Lawyer components
│   ├── messages/           # Messaging components
│   └── transactions/       # Transaction components
├── lib/                    # Core utilities and logic
│   ├── types/             # TypeScript type definitions
│   ├── hooks/             # Custom React hooks
│   ├── supabase/          # Supabase client & utilities
│   ├── validations/       # Zod validation schemas
│   ├── email/             # Email client & templates
│   ├── security/          # Rate limiting & security
│   └── utils/             # Utility functions
├── supabase/
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── types/                 # Legacy type definitions

```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User accounts (extends Supabase auth)
- **properties** - Property listings
- **property_images** - Property photos
- **inquiries** - Buyer inquiries on properties
- **conversations** - Message threads
- **messages** - Individual messages
- **transactions** - Property deals
- **lawyers** - Conveyancer profiles
- **lawyer_reviews** - Lawyer ratings & reviews

### Feature Tables
- **property_views** - Analytics tracking
- **saved_searches** - Search alerts
- **favorite_properties** - User favorites
- **property_comparisons** - Comparison tool
- **referrals** - Referral program
- **property_verifications** - Verification system
- **email_queue** - Email delivery queue

See `PLATFORM_ENHANCEMENTS.md` for complete schema documentation.

## 💰 Pricing Structure

Our tiered platform fee structure (collected by lawyers at closing):

| Property Value | Platform Fee | Traditional Agent* | Savings |
|---------------|--------------|-------------------|----------|
| ≤ R500K       | R4,500       | R25,000          | R20,500 (82%) |
| ≤ R1M         | R7,500       | R50,000          | R42,500 (85%) |
| ≤ R1.5M       | R9,500       | R75,000          | R65,500 (87%) |
| ≤ R2.5M       | R12,500      | R125,000         | R112,500 (90%) |
| ≤ R5M         | R18,000      | R250,000         | R232,000 (93%) |
| ≤ R10M        | R30,000      | R500,000         | R470,000 (94%) |
| > R10M        | R45,000      | R600,000+        | R555,000+ (93%) |

*Based on 5% agent commission in Namibia, 6% in South Africa

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **React Hook Form + Zod** - Form validation
- **TanStack Query** - Server state management

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row-level security
  - Real-time subscriptions
  - File storage
- **Resend** - Transactional emails
- **Upstash Redis** - Rate limiting
- **Sentry** - Error monitoring

### DevOps
- **Vercel** - Hosting (recommended)
- **GitHub Actions** - CI/CD (optional)
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📧 Email Notifications

The platform sends automated emails for:

- ✅ New inquiry notifications (sellers)
- ✅ Inquiry responses (buyers)
- ✅ Transaction initiated (both parties)
- ✅ Lawyer selection updates
- ✅ Deal completion
- ✅ Welcome emails
- ✅ Saved search matches
- ✅ Weekly digest
- ✅ Fee remittance reminders (lawyers)

Configure email templates in `lib/email/templates.ts`

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
  - API: 100 req/min per IP
  - Auth: 5 attempts/15min
  - Uploads: 20/hour per user
  - Emails: 50/day per user
- **Row-Level Security** - Database-level access control
- **Input Validation** - Zod schemas for all forms
- **Image Optimization** - Automatic compression & validation
- **HTTPS Only** - Secure connections
- **CSRF Protection** - Cross-site request forgery prevention

## 📈 Analytics & Monitoring

### Property Analytics
- View count tracking
- Inquiry conversion rates
- Popular properties
- Geographic insights
- Days on market

### Platform Metrics
- User acquisition
- Transaction pipeline
- Revenue tracking
- Lawyer performance
- Email engagement

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel dashboard
3. Configure environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for guidelines.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Write tests
4. Update documentation
5. Submit pull request

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## 🆘 Support

- **Email:** support@proplinka.com
- **Documentation:** See `PLATFORM_ENHANCEMENTS.md`
- **Issues:** Use GitHub issues for bug reports

## 🗺️ Roadmap

### Phase 1: Production Ready ✅
- [x] Updated pricing structure
- [x] Image optimization
- [x] Email notifications
- [x] Database migrations
- [ ] Type safety completion
- [ ] Security hardening
- [ ] Legal pages

### Phase 2: Feature Enhancements 🔄
- [ ] Property analytics dashboard
- [ ] Lawyer rating system
- [ ] Saved searches & alerts
- [ ] Property comparison tool
- [ ] Verification system
- [ ] Real-time messaging
- [ ] Mortgage calculator

### Phase 3: Growth Features 📅
- [ ] Referral program
- [ ] Premium listings
- [ ] Social proof features
- [ ] Advanced analytics
- [ ] Mobile app (PWA)
- [ ] Multi-language support

## 📊 Status

- **Type Safety:** 52% complete
- **Test Coverage:** 0% (in progress)
- **Production Ready:** 70%
- **Feature Complete:** 60%

## 👥 Team

- **Product Owner:** Ismael
- **Development:** Claude AI Assistant
- **Support:** support@proplinka.com

---

**Made with ❤️ for the people of Namibia and South Africa**

*Saving families thousands, one property at a time.*
