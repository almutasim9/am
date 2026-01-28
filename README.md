# AM-CRM 🏪

> Customer Relationship Management System

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## 📱 Features

### Core
- 🏪 **Store Management** - Add/Edit/Delete with CSV Import/Export
- ✅ **Task Board** - Kanban Board with Drag & Drop
- 📅 **Visit Scheduling** - With effectiveness tracking
- 📊 **Dashboard** - Statistics and charts
- 🌙 **Dark Mode** - Full support
- 📱 **Responsive** - Mobile & Desktop optimized

### Technical
- ⚡ **React Query** - Caching & Auto-refresh
- 🔒 **Security** - Environment-based auth + Rate Limiting + Session Expiry
- 📦 **PWA** - Installable on mobile
- 🚀 **Code Splitting** - Faster loading

## 🛠️ Installation

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/am-crm.git
cd am-crm

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

## ⚙️ Supabase Setup (Optional)

1. Create a project on [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in SQL Editor
3. Add connection details to `.env`

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Note:** Without Supabase, the app uses localStorage.

## 📦 Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Login
│   ├── common/        # Reusable components
│   ├── layout/        # Sidebar, MainLayout
│   └── modules/       # Dashboard, Tasks, Visits, Stores
├── contexts/          # React Query + Auth + Theme
├── hooks/             # Custom hooks
├── services/          # Supabase + localStorage
└── utils/             # Helpers, Validation
```

## 🔐 Security

- ✅ Environment-based credentials
- ✅ Rate Limiting (5 attempts / 30 seconds)
- ✅ Session Expiry (24 hours)
- ✅ Zod Validation for forms

## 📄 License

MIT License

---

**Made with ❤️**

*Last Sync: 2026-01-28*
