# Koopay - Decentralized Freelancing Platform

> **Built for HackMeridian 2024** 🚀

A blockchain-powered freelancing platform integrating Stellar payments, milestone-based project management, and invisible Web3 onboarding for traditional users.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Stellar CLI (dev)

### Installation

```bash
git clone https://github.com/tomassalina/koopay.git
cd koopay
npm install
cp .env.local.example .env.local
```

### Environment Configuration

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stellar (Required)
NEXT_PUBLIC_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXQiOiJHRFQyNllEUjQ3TjNBQzJSSE1YUFc2NVRNNzU0WFRNSFRTRTdSS1NPUDZXNE5UT0FGREVSTVdUMyIsImlhdCI6MTc1Nzk1NjU4MX0.LEJ94sd-jsODnoQPfOMt6etHNlh0dvvaJ-MYWfktW5k"
NEXT_PUBLIC_ADMIN_PK=GDT26YDR47N3AC2RHMXPW65TM754XTMHTSE7RKSOP6W4NTOAFDERMWT3
NEXT_PUBLIC_PLATFORM_FEE=1.5
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Setup

1. Create Supabase project
2. Run SQL migrations from `/scripts` directory in Supabase SQL Editor
3. Configure RLS policies
4. Setup Supabase Storage

### Development

```bash
npm run dev
# App runs on http://localhost:3000
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Blockchain**: Stellar Network, Trust Wallet integration
- **Deployment**: Vercel

### Project Structure

```
koopay/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication flows
│   ├── onboarding/        # User onboarding
│   ├── projects/          # Project management
│   └── (dashboard)/       # Main dashboard
├── components/            # React components
│   ├── ui/               # Base components (Shadcn)
│   ├── milestone-icons/  # Custom SVGs
│   └── contract-pdf.tsx  # PDF generation
├── lib/                   # Utilities & hooks
│   ├── hooks/            # Custom hooks
│   ├── supabase/         # Supabase client
│   └── stellar/          # Stellar integration
├── scripts/               # SQL migrations
└── public/               # Static assets
```

## 🔧 Core Features

### ✅ Implemented

- **Authentication**: Email/password + Google OAuth
- **Onboarding**: Role-based flows (freelancer/contractor)
- **Project Management**: Milestone-based with visual timeline
- **Stellar Integration**: Auto wallet creation, basic transactions
- **Storage**: File uploads (avatars, logos, documents)
- **UI/UX**: Responsive design with dark theme

### 🔄 In Progress

- **Escrow System**: Trust Wallet integration for automatic payments
- **Milestone Validation**: Frontend/backend validation for percentages & dates
- **Real Data**: Replacing mocked data with live database connections

## ⚠️ Known Issues (Hackathon Constraints)

### Critical

- **RLS Security**: Row Level Security not implemented in Supabase
- **Milestone Validation**: No validation for 100% percentage sum
- **Escrow Integration**: Incomplete Trust Wallet integration

### Temporary (Mocked Data)

- Home dashboard analytics
- Profile search functionality
- Notification system
- Some milestone data
- Asset uploads (avatars, logos)

### Minor Bugs

- Onboarding flow edge cases
- Date input validation

## 🚀 Roadmap

### Phase 1: Stabilization

- Complete milestone validations
- Full Trust Wallet/Escrow integration
- Replace all mocked data
- Implement RLS security
- Fix onboarding bugs

### Phase 2: Mobile (High Priority)

- React Native/Flutter mobile app
- Mobile wallet integration
- Optimized mobile UX

### Phase 3: Advanced Features

- Decentralized reputation system
- Multi-wallet support (MetaMask, WalletConnect)
- Dispute resolution with community voting
- Real-time chat
- Advanced analytics
- AI-powered project matching

### Phase 4: Scale

- Performance optimization
- Multi-blockchain support
- Public API
- Plugin system
- External integrations

## 💡 Technical Highlights

### Invisible Web3 Onboarding

- Automatic Stellar wallet creation
- Traditional UX for non-crypto users
- Seamless blockchain integration

### Editable Contracts

- Post-creation contract modification
- Freelancer-contractor negotiation
- Flexible project management

### Visual Timeline

- Custom SVG milestone icons
- Interactive progress tracking
- Real-time project status

### Robust Backend

- PostgreSQL with proper schema
- Supabase Auth integration
- File storage with RLS
- SQL triggers and functions

## 🎯 Competitive Advantages

- **vs Upwork/Fiverr**: Decentralized payments, lower fees
- **vs Freelancer.com**: Modern UX, seamless onboarding
- **vs Toptal**: Accessible to all skill levels
- **vs Web3 Platforms**: Traditional UX, not crypto-native only

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript validation

# Stellar CLI
stellar keys list    # List wallets
stellar config --network testnet
```

## 📊 MVP Status

**Functional Components:**

- ✅ Complete authentication system
- ✅ Project creation and management
- ✅ Stellar wallet integration
- ✅ Responsive UI/UX
- ✅ File upload system

**Ready for Production:**

- Backend architecture
- Database schema
- Component system
- Error handling

**Requires Completion:**

- Security implementation (RLS)
- Escrow integration
- Data validation
- Real-time features

## 🎯 Conclusion

Koopay demonstrates technical viability of decentralized freelancing. Current limitations are hackathon time constraints, not technical barriers. The foundation is solid with clear implementation paths for all identified features.

---

_Built for HackMeridian 2024 - December 2024_
