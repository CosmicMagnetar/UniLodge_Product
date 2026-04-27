# UniLodge Frontend UI & Data Task Plan
*(Handoff Document for Claude Haiku 4.5)*

This document outlines the next immediate steps required to polish the UniLodge v2 frontend and populate the newly integrated MongoDB Atlas database with dummy data. Please follow these phases sequentially.

## Context
- **Stack**: Next.js 14, React 19, Tailwind CSS, TypeScript.
- **Backend**: Express.js connected to MongoDB Atlas via Mongoose (running on `http://localhost:3001`).
- **Frontend**: Running on `http://localhost:3002`.
- **Current State**: The backend API has been migrated from in-memory mocks to a real MongoDB Atlas cluster. The frontend connects to it, but the database is currently empty (no rooms), and the Browse/Dashboard screens need aesthetic polishing to match modern glassmorphism standards.

---

## Phase 1: Database Seeding (Dummy Data)

Since the backend now uses a real MongoDB connection, the "Browse Rooms" screen is empty. We need a script to populate the `Room` collection.

**Tasks:**
1. **Create Seed Script**: Create a script in `apps/backend/src/scripts/seed.ts`.
2. **Import Models**: Import the `Room` and `User` models from `apps/backend/src/models/`.
3. **Generate Dummy Rooms**: 
   - Create 10-15 diverse dummy rooms (Single, Double, Suite, Studio).
   - Ensure they include varying prices, realistic amenities (`["WiFi", "AC", "Laundry"]`), university locations, and image URLs (use placeholders like `https://images.unsplash.com/photo-...`).
4. **Execute**: Add a `"seed"` script to `apps/backend/package.json` (`tsx src/scripts/seed.ts`) to easily populate the Atlas database.

---

## Phase 2: Browse Screen UI Update (`GuestDashboard.tsx`)

The main guest browse screen needs to be visually stunning, adopting the premium glassmorphism design language used elsewhere in the application.

**Tasks:**
1. **Hero Section Polish**: Ensure the top search bar and filter section in `apps/frontend/lib/pages/GuestDashboard.tsx` feels cohesive. Use `backdrop-blur-md` and `bg-white/70` for filter panels.
2. **Room Grid Layout**: Ensure the grid layout is fully responsive (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
3. **Empty State UI**: Create a beautiful "No Rooms Found" state with an illustration or Lucide icon in case the database is empty or filters are too strict.
4. **Loading Skeletons**: Implement or refine the `AnimatedLoadingSkeleton` when fetching rooms from the API.

---

## Phase 3: Room Card Enhancements (`RoomCard.tsx`)

The individual room cards need to be upgraded to look premium and dynamic.

**Tasks:**
1. **Image Carousel/Display**: Update `apps/frontend/lib/pages/RoomCard.tsx` to ensure images take up appropriate space with a subtle zoom on hover (`hover:scale-105 transition-transform`).
2. **Badges**: Add vibrant Tailwind badges for Room Type (e.g., Suite) and Availability (e.g., "Available Now" in green).
3. **Pricing Display**: Highlight the price prominently, utilizing the custom primary blue colors defined in the tailwind config (`text-blue-600 font-bold`).
4. **Action Buttons**: Ensure the "Book Now" or "View Details" buttons use the global `Button` component from `ui.tsx` with proper hover animations (`hover:-translate-y-0.5`).

---

## Phase 4: Room Details Screen (Modal/Page)

When a user clicks on a room from the browse screen, they need to see more comprehensive dummy data.

**Tasks:**
1. **Detailed View**: If a modal is used in `GuestDashboard.tsx`, ensure it displays the full room description, a list of all amenities with corresponding icons (e.g., using `lucide-react`), and the maximum capacity.
2. **Price Suggestion Integration**: Ensure the AI Price Suggestion Tool button is visible for Admins/Wardens viewing the room details.

---

## Phase 5: General Aesthetic Sweep

**Tasks:**
1. **Consistency Check**: Verify that `styles/index.css` global variables are being properly respected across the new UI components.
2. **Micro-animations**: Add subtle `framer-motion` or standard CSS transition effects to modals opening, filter dropdowns, and button clicks.

---
> **Instructions for Claude**: Start with **Phase 1** to get data flowing into the application, then proceed to the UI updates in **Phase 2 & 3**. Do not change the `core.api.ts` base URL configuration, as it is already correctly pointing to the MongoDB backend.
