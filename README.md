# Rubros Platform

A high-performance, SEO-optimized monorepo platform for building scalable business listing applications across multiple categories and geographic zones.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://www.encontramecanico.com.ar)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange)](https://pnpm.io/)

## Overview

This project serves as a proof of concept demonstrating how AI-assisted development can accelerate the creation of production-ready web applications. The platform focuses on SEO optimization and performance, utilizing publicly scraped data to populate comprehensive business listings.

The monorepo architecture was specifically chosen to enable rapid deployment of multiple vertical business directories. While the initial application focuses on mechanics (`mechanic-finder`), the shared package ecosystem allows new verticals (plumbers, electricians, restaurants, etc.) to be launched quickly by reusing the same UI components, database layer, type definitions, and development configurations. Each new application can be customized with its own branding and domain-specific features while maintaining consistency and reducing development overhead.

**Key Objectives:**
- **SEO-First Architecture**: Server-side rendering (SSR) and static site generation (SSG) for maximum discoverability
- **Performance**: Optimized for Core Web Vitals and fast load times
- **AI-Assisted Development**: Leveraging AI agents to reduce development time while maintaining code quality
- **Multi-Vertical Scalability**: Designed to support multiple business categories and geographic zones through shared packages
- **Code Reusability**: Centralized components, types, and configurations enable rapid deployment of new verticals

## Live Demo

**[encontramecanico.com.ar](https://www.encontramecanico.com.ar)** - Production deployment showcasing mechanic listings across Argentina.

## Tech Stack

### Core Technologies
- **[Turborepo](https://turbo.build/repo)** - High-performance monorepo management
- **[pnpm](https://pnpm.io)** - Fast, disk-efficient package manager
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with improved performance
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS v3](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** - High-quality component library
- **[Prisma](https://www.prisma.io)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database with PostGIS extension

### Rendering Strategy
- **SSG (Static Site Generation)**: Default for most listing pages
- **SSR (Server-Side Rendering)**: Used for dynamic, SEO-critical pages
- **ISR (Incremental Static Regeneration)**: For content that changes periodically

## Project Structure

```
rubros-platform/
├── apps/
│   └── mechanic-finder/          # Mechanic listing application
│       ├── app/                  # Next.js App Router pages
│       │   ├── [province]/      # Dynamic provincial routes
│       │   │   └── [city]/      # City-level routes
│       │   ├── acerca/          # About page
│       │   ├── contacto/        # Contact page
│       │   └── ...              # Other routes
│       ├── actions/             # Server actions
│       ├── components/          # App-specific components
│       ├── lib/                 # Utility functions
│       └── constants/           # Configuration constants
│
└── packages/
    ├── db/                      # Database layer
    ├── ui/                      # Shared UI components
    ├── tailwind-config/         # Shared Tailwind configuration
    ├── types/                   # Shared TypeScript types
    ├── typescript-config/       # Shared TS configurations
    └── eslint-config/           # Shared ESLint rules
```

## Packages

### `apps/mechanic-finder`
The flagship application providing a comprehensive directory of mechanics across Argentina. Features include:
- **Geographic Navigation**: Browse by province and city
- **Advanced Filtering**: Sort by rating, distance, and open hours
- **Interactive Maps**: Leaflet-powered location visualization
- **SEO Optimization**: Dynamic metadata, JSON-LD structured data, sitemaps
- **Analytics**: Google Analytics integration for tracking user behavior
- **AdSense**: Monetization through targeted advertising

**Technologies**: Next.js 15, React 19, TypeScript

---

### `@rubros/db`
Centralized database layer providing type-safe data access across all applications.

**Features:**
- Prisma ORM with PostgreSQL
- PostGIS extension for geospatial queries
- Migration management
- Database seeding scripts
- Type-safe query builders
- Shared entity definitions

**Key Exports:**
- `prisma` - Prisma Client instance
- `entities` - Entity helper functions
- `types` - Database type definitions
- `utils` - Query utilities and helpers

---

### `@rubros/ui`
Shared component library built on shadcn/ui, providing consistent UI elements across all applications.

**Components Include:**
- **Layout**: Header, Footer, Breadcrumb, Card
- **Forms**: Button, Select, Dialog, Popover
- **Business**: BusinessCard, ContactActions, Distance, OpenText
- **Data Display**: PaginatedList, PaginationBar, EmptyState
- **Maps**: Interactive Map component with Leaflet
- **Tracking**: ViewTracker, CookieBanner
- **Feedback**: Spinner, Skeleton loaders

**Features:**
- Fully typed TypeScript components
- Tailwind CSS styling
- Radix UI primitives for accessibility
- Responsive design
- Unit tested with Jest

---

### `@rubros/tailwind-config`
Shared Tailwind CSS configuration ensuring consistent styling across the monorepo.

**Includes:**
- Base Tailwind configuration
- Custom theme extensions
- Global CSS utilities
- PostCSS configuration
- Tailwind plugins (animate, etc.)

Applications can extend this base configuration with app-specific theme customizations (colors, fonts, etc.).

---

### `@rubros/types`
Centralized TypeScript type definitions shared across packages and applications.

**Includes:**
- Business entity types
- AdSense configuration types
- Shared interfaces and enums
- Utility types

Ensures type consistency and prevents duplication across the monorepo.

---

### `@rubros/typescript-config`
Shared TypeScript compiler configurations for consistent type checking.

**Configurations:**
- `base.json` - Base configuration for all packages
- `nextjs.json` - Next.js-specific settings
- `react-library.json` - React component library settings

Packages and apps extend these base configs, reducing configuration duplication.

---

### `@rubros/eslint-config`
Shared ESLint rules enforcing code quality standards.

**Configurations:**
- `base.js` - Base ESLint rules
- `next.js` - Next.js-specific linting
- `react-internal.js` - React component linting

Ensures consistent code style and catches common errors across the monorepo.

## Getting Started

### Prerequisites

- **Node.js**: ≥18.0.0
- **pnpm**: 9.0.0
- **PostgreSQL**: Latest with PostGIS extension
- **Docker** (optional): For local database setup

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rubros-platform.git
cd rubros-platform
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up the database**
```bash
# Option 1: Using Docker
cd packages/db
pnpm init-docker

# Option 2: Manual PostgreSQL setup
# Create a database and enable PostGIS extension
```

4. **Configure environment variables**
```bash
# In packages/db/.env
DATABASE_URL="postgresql://user:password@localhost:5432/rubros"

# In apps/mechanic-finder/.env.local
NEXT_PUBLIC_BASE_URL="http://localhost:3002"
NEXT_PUBLIC_GA_ID="your-ga-id"
ADSENSE_KEY="your-adsense-key"
```

5. **Run database migrations**
```bash
cd packages/db
pnpm migrate
```

6. **Seed the database** (optional)
```bash
pnpm seed-provinces
pnpm seed-categories
pnpm seed-businesses
```

### Development

Start the development server:

```bash
# From the root directory
pnpm dev

# Or run a specific app
pnpm --filter mechanic-finder dev
```

The mechanic-finder app will be available at `http://localhost:3002`

### Available Commands

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all packages
pnpm check-types  # Type-check all packages
pnpm format       # Format code with Prettier
pnpm clean        # Clean build artifacts
```

## Development Workflow

### Building

Turborepo manages the build pipeline, automatically handling dependencies between packages:

```bash
pnpm build
```

This builds packages in the correct order (`db` → `types` → `ui` → `apps`).

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

### Database Management

```bash
cd packages/db

# Generate Prisma Client
pnpm generate

# Create a new migration
pnpm migrate

# Open Prisma Studio
pnpm studio

# Seed data
pnpm seed
```

## Deployment

The platform is deployed on **Vercel** with automatic deployments from the main branch.

**Production Environment:**
- **Platform**: Vercel
- **Database**: Managed PostgreSQL with PostGIS
- **CDN**: Vercel Edge Network
- **URL**: [www.encontramecanico.com.ar](https://www.encontramecanico.com.ar)

### Manual Deployment

```bash
# Build for production
pnpm build

# Deploy (requires Vercel CLI)
vercel --prod
```

## Architecture Decisions

### No Internationalization (i18n)

This project currently does not implement i18n middleware. The decision was made because:
- The MVP targets a single market: Argentina
- All content is in Spanish
- Simplified the initial development to accelerate time-to-market
- Can be added later if expanding to other Spanish-speaking countries

For production applications targeting multiple locales, Next.js's `next-intl` would be recommended.

### Git Workflow

**Note on Git History**: This repository was originally developed as a private project and is now being opened to the public as part of a recruitment process. As such, the commit history may not reflect standard Git workflow best practices:
- Commit messages may not follow conventional commit formats
- No pre-commit hooks were configured
- Git flow branching strategy was not strictly followed

In a production team environment, the following would be implemented:
- Conventional Commits standard
- Husky pre-commit hooks for linting and type checking
- Git flow or trunk-based development
- Pull request templates and code review processes

### Data Scraping

Business data is populated through web scraping of publicly available information. The scraping logic:
- Respects robots.txt directives
- Implements rate limiting
- Stores data in PostgreSQL with PostGIS for geospatial queries

### SEO Optimization

The platform implements comprehensive SEO best practices:
- **Dynamic Metadata**: Per-page title, description, and OpenGraph tags
- **Structured Data**: JSON-LD for Organization, LocalBusiness, BreadcrumbList, and ItemList
- **Sitemaps**: Dynamically generated XML sitemaps with pagination
- **Canonical URLs**: Proper canonical tags for duplicate content management
- **Performance**: Optimized Core Web Vitals scores
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

## License

This project is currently unlicensed. License information will be added in future updates.

## Contact

For questions or collaboration opportunities, please reach out through the repository issues.

---

**Built with AI-assisted development to demonstrate rapid MVP creation while maintaining production-quality code standards.**
