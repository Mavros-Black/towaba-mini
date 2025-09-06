# Event Voting App 🗳️

A modern, production-ready platform for managing and voting in events and campaigns. Built with Next.js 14, TypeScript, TailwindCSS, and integrated with payment gateways for secure voting.

## ✨ Features

- **🎭 Campaign Management**: Create and manage events with categories and nominees
- **💳 Paid Voting Only**: Secure payment integration with Paystack and Nalo USSD
- **🌙 Dark/Light Themes**: Beautiful UI with theme switching
- **📱 Responsive Design**: Mobile-first approach with smooth animations
- **🔐 Authentication**: Supabase Auth with role-based access control
- **📊 Real-time Results**: Live vote counting and analytics
- **🔒 Secure Payments**: Webhook verification and transaction logging

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS with dark mode support
- **UI Components**: Shadcn/UI + Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Payments**: Paystack + Nalo Solutions USSD
- **Storage**: Supabase Storage for media files

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Supabase account
- Paystack account
- Nalo Solutions account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-voting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   
   # Payment Gateway Keys
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   
   # Nalo Solutions USSD Integration
   NALO_API_KEY=your_nalo_api_key
   NALO_SECRET=your_nalo_secret_key
   
   # App Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Set up Supabase database and storage**
   - Run the database setup script in your Supabase SQL Editor:
     ```sql
     -- Copy and paste the content of scripts/database-setup.sql
     ```
   - Update the database for Supabase Auth and anonymous voting:
     ```sql
     -- Copy and paste the content of scripts/update-database-supabase-auth.sql
     ```
   - Set up storage for image uploads:
     ```sql
     -- Copy and paste the content of scripts/setup-storage.sql
     ```
   
   **📁 All SQL scripts are organized in the `scripts/` folder with detailed documentation.**

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The app uses the following main models:

- **User**: Authentication and role management
- **Campaign**: Event/campaign details
- **Category**: Campaign categories (e.g., Best Artist, Best Song)
- **Nominee**: Contestants in each category
- **Vote**: Individual votes with payment tracking
- **Payment**: Payment transaction records

## 💳 Payment Integration

### Paystack Setup
1. Create a Paystack account
2. Get your secret and public keys
3. Configure webhook URL: `https://yourdomain.com/api/payments/webhook/paystack`
4. Add webhook secret to environment variables

### Nalo USSD Setup
1. Contact Nalo Solutions for API access
2. Configure webhook URL: `https://yourdomain.com/api/payments/webhook/nalo`
3. Add API credentials to environment variables

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── campaigns/         # Campaign pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── navigation.tsx    # Navigation component
│   └── voting-modal.tsx  # Voting modal
├── lib/                  # Utility libraries
│   ├── paystack.ts       # Paystack integration
│   ├── nalo.ts          # Nalo USSD integration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma    # Prisma schema
│   └── seed.ts          # Database seeder
├── scripts/              # Database and storage setup scripts
│   ├── README.md         # Scripts documentation
│   ├── database-setup.sql # Initial database schema
│   ├── update-database-*.sql # Database update scripts
│   └── setup-storage.sql # Storage configuration
└── public/               # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the project: `npm run build`
2. Set environment variables
3. Deploy the `.next` folder and public assets

## 🔒 Security Considerations

- All payment endpoints are rate-limited
- Webhook signatures are verified
- Database queries are parameterized
- Environment variables are properly secured
- HTTPS is enforced in production

## 📱 Mobile Responsiveness

The app is built with a mobile-first approach:
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for various screen sizes
- Progressive Web App features

## 🎨 Customization

### Themes
- Modify `tailwind.config.js` for color schemes
- Update CSS variables in `globals.css`
- Customize component variants

### Components
- Extend Shadcn/UI components
- Add new UI patterns
- Modify animation behaviors

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The app includes:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📊 Monitoring & Analytics

- Payment success/failure tracking
- User engagement metrics
- Campaign performance analytics
- Error logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Mobile app (React Native)
- [ ] Blockchain voting verification

---

Built with ❤️ for the community
