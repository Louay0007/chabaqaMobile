# Quick Start Guide - Event API Tests

## 🚀 Run Tests in 3 Steps

### Step 1: Update Configuration

Open `ChabaqaFinale-Mobile/lib/__tests__/event-api.manual-test.ts` and update:

```typescript
const TEST_CONFIG = {
  communitySlug: 'your-community-slug',  // ← Replace with real community slug
  eventId: 'your-event-id',              // ← Replace with real event ID
  ticketType: 'regular',
  promoCode: 'TEST10',
  creatorId: 'your-creator-id',          // ← Replace with real creator ID
  amount: 50,
};
```

### Step 2: Navigate to Test Screen

In your mobile app, navigate to:
```
/(testing)/event-api-test
```

### Step 3: Run Tests

Tap one of these buttons:

- **Run All Tests** → Runs all 22 tests (API + Helpers)
- **Run Helper Tests Only** → Runs 12 helper tests (no backend needed)
- **Run API Tests Only** → Runs 10 API tests (requires backend)

## 📊 What Gets Tested

### API Functions (Requires Backend)
1. Fetch events (with/without filters)
2. Fetch events by community
3. Get event details
4. Register for events (free/paid)
5. Unregister from events
6. Get user registrations
7. Purchase with wallet
8. Check registration status

### Helper Functions (No Backend Needed)
1. Event status calculation
2. Date/time formatting
3. Price calculations
4. Registration checks
5. Availability checks
6. UI helpers (icons, colors)

## ✅ Expected Results

All tests should pass with output like:

```
✅ PASS: getEvents() - No filters (234ms)
✅ PASS: getEventById() (156ms)
✅ PASS: registerForEvent() (189ms)
...

Final Summary:
✅ Passed: 22/22
❌ Failed: 0/22
📊 Success Rate: 100.0%
```

## ⚠️ Prerequisites

### For Helper Tests
- None! Run anytime

### For API Tests
- ✅ Backend server running
- ✅ User logged in
- ✅ Valid event data in database
- ✅ TEST_CONFIG updated with real IDs

## 🐛 Troubleshooting

**"Authentication required"**
→ Log in to the app first

**"Event not found"**
→ Update TEST_CONFIG with valid event IDs

**"Network error"**
→ Check backend is running and accessible

## 📝 Need More Info?

See `README.md` for detailed documentation.
