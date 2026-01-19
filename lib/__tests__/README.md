# Event API Test Suite

This directory contains manual test scripts for the event-api.ts module.

## Overview

The test suite provides comprehensive testing for all event API functions and helper utilities. Since the mobile app doesn't have automated testing configured, these are manual tests that can be run through a test screen in the app.

## Files

- **event-api.manual-test.ts** - Test functions for all API endpoints and helpers
- **README.md** - This file

## Test Coverage

### API Functions (10 tests)
1. `getEvents()` - Fetch events with no filters
2. `getEvents()` - Fetch events with filters
3. `getEventsByCommunity()` - Fetch events by community slug
4. `getEventById()` - Fetch single event details
5. `registerForEvent()` - Register for free event
6. `registerForEvent()` - Register with promo code
7. `unregisterFromEvent()` - Unregister from event
8. `getMyEventRegistrations()` - Get user's registered events
9. `purchaseEventWithWallet()` - Purchase event with wallet
10. `isRegisteredForEvent()` - Check registration status

### Helper Functions (12 tests)
1. `getEventStatus()` - Get event status (upcoming/active/completed)
2. `getDaysUntilEvent()` - Calculate days until event
3. `formatEventDateRange()` - Format date range for display
4. `getEventPrice()` - Get minimum event price
5. `isEventFree()` - Check if event is free
6. `isUserRegistered()` - Check if user is registered
7. `formatEventTime()` - Format time range
8. `getEventDuration()` - Calculate event duration
9. `getAvailableSpots()` - Get available spots
10. `isEventSoldOut()` - Check if event is sold out
11. `getEventTypeIcon()` - Get icon for event type
12. `getEventStatusColor()` - Get color for event status

## Running Tests

### Method 1: Using Test Screen (Recommended)

1. Navigate to the test screen in the app:
   ```
   /(testing)/event-api-test
   ```

2. Update the test configuration in `event-api.manual-test.ts`:
   ```typescript
   const TEST_CONFIG = {
     communitySlug: 'your-community-slug',
     eventId: 'your-event-id',
     ticketType: 'regular',
     promoCode: 'TEST10',
     creatorId: 'your-creator-id',
     amount: 50,
   };
   ```

3. Tap one of the test buttons:
   - **Run All Tests** - Runs all 22 tests
   - **Run Helper Tests Only** - Runs 12 helper function tests (no backend required)
   - **Run API Tests Only** - Runs 10 API function tests (requires backend)

4. View test results in the output section

### Method 2: Programmatic Testing

Import and run tests in any component:

```typescript
import { runAllEventAPITests, runAllHelperTests, tests } from '@/lib/__tests__/event-api.manual-test';

// Run all tests
await runAllEventAPITests();

// Run only helper tests (no backend required)
await runAllHelperTests();

// Run individual test
await tests.testGetEventStatus();
```

## Prerequisites

### For Helper Function Tests
- No prerequisites - these tests run locally with mock data

### For API Function Tests
- Active backend connection
- Valid authentication token (user must be logged in)
- Real event data in the database
- Updated TEST_CONFIG with valid IDs

## Test Output

Tests output detailed logs to the console:

```
🧪 Running test: getEvents() - No filters
   Found 5 events (total: 15)
✅ PASS: getEvents() - No filters (234ms)

🧪 Running test: getEventById()
   Fetched event: Summer Music Festival
✅ PASS: getEventById() (156ms)
```

Final summary includes:
- Total tests run
- Pass/fail counts
- Total duration
- Success rate
- List of failed tests with error messages

## Updating Tests

To add new tests:

1. Create a new test function following the pattern:
   ```typescript
   async function testNewFunction() {
     await runTest('testNewFunction()', async () => {
       const result = await EventAPI.newFunction();
       if (!result) throw new Error('Test failed');
       console.log('   Test passed');
     });
   }
   ```

2. Add the test to the appropriate runner:
   ```typescript
   export async function runAllAPITests() {
     // ... existing tests
     await testNewFunction();
   }
   ```

3. Export the test in the tests object:
   ```typescript
   export const tests = {
     // ... existing tests
     testNewFunction,
   };
   ```

## Troubleshooting

### Tests Fail with "Authentication required"
- Ensure user is logged in before running API tests
- Check that auth token is valid

### Tests Fail with "Failed to fetch events"
- Verify backend is running and accessible
- Check network connection
- Verify API endpoints are correct

### Tests Fail with "Event not found"
- Update TEST_CONFIG with valid event IDs from your database
- Ensure events are published and active

## Notes

- Helper function tests can run offline with mock data
- API function tests require a live backend connection
- Some tests may modify data (register/unregister) - use test data
- Test results are logged to console for debugging
- Tests run sequentially to avoid race conditions
