
# Complete Tech Shop E-Commerce App Plan

## Current State Summary

**What's Built:**
- Home page with featured products
- Products catalog with search
- Product detail with variants, image gallery, add-to-cart
- Cart with quantity management and order summary
- Auth (login/signup) with Supabase
- Profile page (basic)
- Admin panel with dashboard, inventory management, product editor
- Database: `products`, `product_variants`, `cart_items`, `profiles`

**Critical Issues to Fix First:**
1. Missing `build:dev` script in package.json (YOU must add manually)
2. Security: Roles stored in `profiles` table (privilege escalation risk)

---

## Phase 1: Fix Critical Build Issue

**User Action Required:**
Open `package.json` and add this script:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview"
}
```

---

## Phase 2: Security - Secure Role Management

Create a separate `user_roles` table to prevent privilege escalation:

**New Database Objects:**

| Object | Type | Purpose |
|--------|------|---------|
| `app_role` | enum | admin, moderator, user |
| `user_roles` | table | Stores user-role mappings |
| `has_role()` | function | Security definer role check |

**Migration SQL:**
```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrate existing admins from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM profiles WHERE role = 'admin';
```

**Code Update:**
Update `AuthContext.tsx` to fetch role from `user_roles` table instead of `profiles`.

---

## Phase 3: New Pages to Create

### 3.1 Checkout Page (`/checkout`)
Complete the purchase flow:
- Shipping address form
- Payment method selection (Stripe integration ready)
- Order review before confirmation
- Place order button

### 3.2 Order Confirmation Page (`/order-confirmation/:id`)
Post-purchase success page:
- Order number display
- Items purchased summary
- Estimated delivery
- Continue shopping CTA

### 3.3 Orders History Page (`/orders`)
Customer order tracking:
- List of past orders
- Order status (pending, shipped, delivered)
- Click to view order details
- Reorder functionality

### 3.4 Wishlist Page (`/wishlist`)
Save products for later:
- Grid of wishlisted products
- Move to cart button
- Remove from wishlist
- Empty state

### 3.5 Categories Page (`/category/:slug`)
Filtered product browsing:
- Category-specific product grid
- Subcategory navigation
- Sort and filter options

### 3.6 Search Results Page (`/search`)
Dedicated search experience:
- Search query display
- Filtered results
- No results state
- Search suggestions

### 3.7 Contact/Support Page (`/contact`)
Customer support:
- Contact form
- FAQ section
- Business hours/location

### 3.8 About Page (`/about`)
Brand story:
- Company information
- Team section (optional)
- Values/mission

---

## Phase 4: New Database Tables

### 4.1 Orders System

```text
┌─────────────────────────────────────────────────────────┐
│  orders                                                 │
├─────────────────────────────────────────────────────────┤
│  id              │ uuid (primary key)                   │
│  user_id         │ uuid → auth.users                    │
│  status          │ text (pending, paid, shipped, etc)   │
│  total           │ numeric                              │
│  shipping_address│ jsonb                                │
│  payment_intent  │ text (for Stripe)                    │
│  created_at      │ timestamp                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  order_items                                            │
├─────────────────────────────────────────────────────────┤
│  id              │ uuid (primary key)                   │
│  order_id        │ uuid → orders                        │
│  product_id      │ uuid → products                      │
│  variant_id      │ uuid → product_variants (nullable)   │
│  quantity        │ integer                              │
│  price_at_time   │ numeric (snapshot price)             │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Wishlist Table

```text
┌─────────────────────────────────────────────────────────┐
│  wishlists                                              │
├─────────────────────────────────────────────────────────┤
│  id              │ uuid (primary key)                   │
│  user_id         │ uuid → auth.users                    │
│  product_id      │ uuid → products                      │
│  created_at      │ timestamp                            │
│  UNIQUE          │ (user_id, product_id)                │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Reviews Table (for product reviews)

```text
┌─────────────────────────────────────────────────────────┐
│  reviews                                                │
├─────────────────────────────────────────────────────────┤
│  id              │ uuid (primary key)                   │
│  user_id         │ uuid → auth.users                    │
│  product_id      │ uuid → products                      │
│  rating          │ integer (1-5)                        │
│  comment         │ text                                 │
│  created_at      │ timestamp                            │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Categories Table (dynamic categories)

```text
┌─────────────────────────────────────────────────────────┐
│  categories                                             │
├─────────────────────────────────────────────────────────┤
│  id              │ uuid (primary key)                   │
│  name            │ text                                 │
│  slug            │ text (unique, URL-friendly)          │
│  parent_id       │ uuid → categories (for subcats)      │
│  image           │ text                                 │
│  sort_order      │ integer                              │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 5: New Contexts & Hooks

### 5.1 WishlistContext
- `items`: wishlist product IDs
- `addToWishlist(productId)`
- `removeFromWishlist(productId)`
- `isInWishlist(productId)`

### 5.2 OrderContext
- `createOrder(cartItems, shippingAddress)`
- `getOrders()`
- `getOrderById(id)`

---

## Phase 6: Component Enhancements

### 6.1 ProductCard Enhancements
- Add wishlist heart button
- Show discount badge
- Quick view modal

### 6.2 ProductDetail Enhancements
- Real reviews from database
- Add review form for purchased users
- Related products section
- Stock quantity display

### 6.3 Profile Page Enhancements
- Edit profile functionality
- Address book management
- Order history integration
- Payment methods (future Stripe)

### 6.4 Admin Panel Additions
- Orders management tab
- Customer management tab
- Reviews moderation
- Category management

---

## Phase 7: Toast Notification System

Add `sonner` or similar library for user feedback:
- Success: "Product added to cart"
- Error: "Failed to save"
- Info: "You need to sign in"

---

## Implementation Order

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Fix build:dev script | User action |
| 2 | Create user_roles table & update auth | Medium |
| 3 | Create orders/order_items tables | Medium |
| 4 | Build Checkout page | High |
| 5 | Build Order Confirmation page | Low |
| 6 | Create wishlists table | Low |
| 7 | Build Wishlist page | Medium |
| 8 | Build Orders History page | Medium |
| 9 | Create reviews table | Low |
| 10 | Add reviews to ProductDetail | Medium |
| 11 | Create categories table | Low |
| 12 | Build Category page | Medium |
| 13 | Add toast notifications | Low |
| 14 | Admin: Orders management | High |
| 15 | About & Contact pages | Low |

---

## File Structure After Implementation

```text
src/
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── ProductEditor.tsx
│   │   ├── ProductList.tsx
│   │   ├── OrdersManager.tsx (new)
│   │   └── CategoryManager.tsx (new)
│   ├── checkout/
│   │   ├── AddressForm.tsx (new)
│   │   ├── PaymentSection.tsx (new)
│   │   └── OrderSummary.tsx (new)
│   ├── products/
│   │   ├── ReviewList.tsx (new)
│   │   ├── ReviewForm.tsx (new)
│   │   └── RelatedProducts.tsx (new)
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   └── Sidebar.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx (new)
│   └── OrderContext.tsx (new)
├── pages/
│   ├── Admin.tsx
│   ├── Auth.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx (new)
│   ├── Category.tsx (new)
│   ├── Contact.tsx (new)
│   ├── About.tsx (new)
│   ├── Home.tsx
│   ├── OrderConfirmation.tsx (new)
│   ├── Orders.tsx (new)
│   ├── ProductDetail.tsx
│   ├── Products.tsx
│   ├── Profile.tsx
│   ├── Search.tsx (new)
│   └── Wishlist.tsx (new)
└── supabaseClient.ts
```

---

## RLS Policies Summary

All new tables will have RLS enabled with these policies:

| Table | Policy | Rule |
|-------|--------|------|
| orders | Users read own | `auth.uid() = user_id` |
| orders | Admins read all | `has_role(auth.uid(), 'admin')` |
| order_items | Users read own order items | via order join |
| wishlists | Users manage own | `auth.uid() = user_id` |
| reviews | Public read | `true` |
| reviews | Users create own | `auth.uid() = user_id` |
| categories | Public read | `true` |
| categories | Admins manage | `has_role(auth.uid(), 'admin')` |
| user_roles | No public access | Only via `has_role()` function |

---

## Ready to Start

Once you add the `build:dev` script to package.json, I can begin implementing Phase 2 (security) and then continue with the checkout flow and new pages.
