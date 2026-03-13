# NewMerch - Universal Print E-Commerce Store

A professional print services e-commerce platform built with Next.js, featuring product configuration, artwork upload, and an admin panel.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase) via Prisma ORM
- **Auth**: NextAuth.js (Credentials provider, JWT)
- **Storage**: Cloudinary (images + artwork files)
- **State**: Zustand (cart)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (run `openssl rand -base64 32`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - From Cloudinary dashboard

### 3. Push database schema

```bash
npm run db:push
```

### 4. Seed the database

```bash
npm run db:seed
```

This creates an admin user and all product categories.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Public storefront (layout with Navbar/Footer)
│   │   ├── home/         # Home page with hero, categories, featured products
│   │   ├── categories/   # Category listing and detail pages
│   │   ├── products/     # Product detail with configurator + artwork upload
│   │   ├── cart/         # Cart and checkout
│   │   └── account/      # User orders and profile
│   ├── admin/            # Admin panel
│   │   ├── products/     # Product CRUD with variant management
│   │   ├── categories/   # Category management
│   │   ├── orders/       # Order management with status updates
│   │   └── users/        # User management
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── api/              # API routes
├── components/
│   ├── layout/           # Navbar, Footer, CartDrawer
│   ├── product/          # ProductConfigurator, ArtworkUploader, ArtworkInstructions
│   └── providers/        # AuthProvider
├── lib/                  # Utilities (prisma, cloudinary, auth, utils)
├── store/                # Zustand cart store
└── types/                # TypeScript declarations
```

## Product Categories

- Banners (Indoor, Outdoor, Vinyl)
- Roller Banners (Economy, Standard, Premium, Wide)
- Business Cards (Standard, Folded, Spot UV, Rounded)
- Flyers & Leaflets (Flyers, Folded, Door Hangers)
- Posters (Indoor, Outdoor)
- Brochures (Saddle Stitched, Perfect Bound)
- Stationery (Letterheads, Compliment Slips, Notepads, Envelopes)
- Packaging (Boxes, Mailer Boxes, Product Boxes)
- Stickers & Labels (Sheet, Roll, Floor)
- T-Shirts & Apparel (T-Shirts, Hoodies, Polo Shirts)
- Drinkware (Mugs, Water Bottles, Travel Mugs)
- Calendars (Wall, Desk)

## Admin Access

Default admin credentials (from seed):
- Email: `admin@newmerch.com`
- Password: `admin123`

Access the admin panel at `/admin`.
