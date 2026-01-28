
# Admin Page Enhancement Plan

## Current State Assessment

The Admin page already has solid foundations:
- Product list view with cards showing category, brand, price
- Full product editor with image upload, variants, pricing, features
- Access control checking `isAdmin` from AuthContext

However, there are improvements needed for a production-ready admin dashboard.

---

## Phase 1: Fix Build Errors (Required First)

Clean up unused imports across all affected files to resolve TypeScript errors:

| File | Unused Imports to Remove |
|------|-------------------------|
| `Hero.tsx` | `React` |
| `Navbar.tsx` | `UserIcon` |
| `Admin.tsx` | `AnimatePresence`, `Eye`, `Tag`, `Layers`, `Type` |
| `Auth.tsx` | `AnimatePresence` |
| `Cart.tsx` | `React` |
| `Home.tsx` | `error` variable |
| `ProductDetail.tsx` | `MessageSquare`, `Menu` |
| `Products.tsx` | `navigate`, `error` variable |
| `Profile.tsx` | `React`, `ChevronRight` |

---

## Phase 2: Security Enhancement

**Issue**: Roles are currently stored in the `profiles` table, which creates privilege escalation risks.

**Solution**: Create a separate `user_roles` table following the security guidelines:

```text
┌─────────────────────────────────────────────────────────┐
│  NEW: user_roles table                                  │
├─────────────────────────────────────────────────────────┤
│  id          │ uuid (primary key)                       │
│  user_id     │ uuid → auth.users                        │
│  role        │ app_role enum (admin, moderator, user)   │
└─────────────────────────────────────────────────────────┘
```

- Create `has_role()` security definer function
- Update RLS policies to use the new function
- Migrate existing admin roles to new table
- Update AuthContext to fetch from `user_roles`

---

## Phase 3: Admin Dashboard Enhancements

### 3.1 Dashboard Overview Tab
Add a new dashboard view with:
- Quick stats cards (total products, orders pending, revenue)
- Recent activity feed
- Low stock alerts

### 3.2 Navigation Improvements
Add admin sidebar tabs:
- **Inventory** (current product management)
- **Orders** (future: order management)
- **Customers** (future: user management)
- **Analytics** (future: sales charts)

### 3.3 Product Management Enhancements
- Bulk actions (delete multiple, change category)
- Stock tracking field
- Product status toggle (draft/published)
- Search and filter within admin

### 3.4 UX Improvements
- Confirmation dialogs for destructive actions
- Toast notifications for save/delete operations
- Loading states during operations
- Image preview before upload

---

## Phase 4: Package.json Fix

**User Action Required**: Add `build:dev` script to `package.json`:

```json
{
  "scripts": {
    "build:dev": "vite build --mode development"
  }
}
```

This must be done manually as the system cannot edit package.json directly.

---

## Implementation Priority

1. **Critical**: Fix build errors (unused imports)
2. **Critical**: Add build:dev script (user action)
3. **High**: Security - migrate to user_roles table
4. **Medium**: Dashboard overview with stats
5. **Low**: Additional admin features (orders, analytics)

---

## Technical Considerations

- All admin operations already use Supabase RLS
- Image uploads go to `products` storage bucket
- Variants are managed in separate `product_variants` table
- The editor supports multiple images with primary selection
