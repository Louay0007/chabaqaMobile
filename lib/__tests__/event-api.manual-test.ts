/**
 * Manual Test Script for Event API
 * 
 * This file contains manual test functions for all event-api.ts functions.
 * Run these tests in the React Native app to verify API functionality.
 * 
 * Usage:
 * 1. Import this file in a test screen
 * 2. Call runAllEventAPITests() to run all tests
 * 3. Check console logs for results
 */

import * as EventAPI from '../event-api';

// Test configuration
const TEST_CONFIG = {
  communitySlug: 'test-community', // Replace with actual community slug
  eventId: 'test-event-id', // Replace with actual event ID
  ticketType: 'regular',
  promoCode: 'TEST10',
  creatorId: 'test-creator-id', // Replace with actual creator ID
  amount: 50,
};

// Test results tracker
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

const testResults: TestResult[] = [];

// Helper function to run a test
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Running test: ${name}`);
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({
      name,
      status: 'PASS',
      message: 'Test passed successfully',
      duration,
    });
    console.log(`✅ PASS: ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    testResults.push({
      name,
      status: 'FAIL',
      message: error.message || 'Unknown error',
      duration,
    });
    console.error(`❌ FAIL: ${name} (${duration}ms)`, error.message);
  }
}

// ============================================================================
// API Function Tests
// ============================================================================

/**
 * Test 1: getEvents() - Fetch events with no filters
 */
async function testGetEvents() {
  await runTest('getEvents() - No filters', async () => {
    const result = await EventAPI.getEvents();
    
    if (!result) throw new Error('Result is null or undefined');
    if (!Array.isArray(result.events)) throw new Error('events is not an array');
    if (typeof result.total !== 'number') throw new Error('total is not a number');
    if (typeof result.page !== 'number') throw new Error('page is not a number');
    if (typeof result.limit !== 'number') throw new Error('limit is not a number');
    
    console.log(`   Found ${result.events.length} events (total: ${result.total})`);
  });
}

/**
 * Test 2: getEvents() - Fetch events with filters
 */
async function testGetEventsWithFilters() {
  await runTest('getEvents() - With filters', async () => {
    const filters: EventAPI.EventFilters = {
      page: 1,
      limit: 5,
      isActive: true,
      type: 'Online',
    };
    
    const result = await EventAPI.getEvents(filters);
    
    if (!result) throw new Error('Result is null or undefined');
    if (result.events.length > 5) throw new Error('Limit not respected');
    
    console.log(`   Found ${result.events.length} online events`);
  });
}

/**
 * Test 3: getEventsByCommunity() - Fetch events by community slug
 */
async function testGetEventsByCommunity() {
  await runTest('getEventsByCommunity()', async () => {
    const result = await EventAPI.getEventsByCommunity(TEST_CONFIG.communitySlug);
    
    if (!result) throw new Error('Result is null or undefined');
    if (!Array.isArray(result.events)) throw new Error('events is not an array');
    
    console.log(`   Found ${result.events.length} events for community ${TEST_CONFIG.communitySlug}`);
  });
}

/**
 * Test 4: getEventById() - Fetch single event details
 */
async function testGetEventById() {
  await runTest('getEventById()', async () => {
    const event = await EventAPI.getEventById(TEST_CONFIG.eventId);
    
    if (!event) throw new Error('Event is null or undefined');
    if (!event.id) throw new Error('Event ID is missing');
    if (!event.title) throw new Error('Event title is missing');
    if (!event.startDate) throw new Error('Event startDate is missing');
    
    console.log(`   Fetched event: ${event.title}`);
  });
}

/**
 * Test 5: registerForEvent() - Register for free event
 */
async function testRegisterForEvent() {
  await runTest('registerForEvent() - Free event', async () => {
    const registration = await EventAPI.registerForEvent(
      TEST_CONFIG.eventId,
      TEST_CONFIG.ticketType
    );
    
    if (!registration) throw new Error('Registration is null or undefined');
    if (!registration.eventId) throw new Error('Registration eventId is missing');
    
    console.log(`   Registered for event: ${registration.eventId}`);
  });
}

/**
 * Test 6: registerForEvent() - Register with promo code
 */
async function testRegisterForEventWithPromo() {
  await runTest('registerForEvent() - With promo code', async () => {
    const registration = await EventAPI.registerForEvent(
      TEST_CONFIG.eventId,
      TEST_CONFIG.ticketType,
      TEST_CONFIG.promoCode
    );
    
    if (!registration) throw new Error('Registration is null or undefined');
    
    console.log(`   Registered with promo code: ${TEST_CONFIG.promoCode}`);
  });
}

/**
 * Test 7: unregisterFromEvent() - Unregister from event
 */
async function testUnregisterFromEvent() {
  await runTest('unregisterFromEvent()', async () => {
    const result = await EventAPI.unregisterFromEvent(TEST_CONFIG.eventId);
    
    if (!result) throw new Error('Result is null or undefined');
    if (!result.success) throw new Error('Unregister failed');
    
    console.log(`   Unregistered successfully: ${result.message}`);
  });
}

/**
 * Test 8: getMyEventRegistrations() - Get user's registered events
 */
async function testGetMyEventRegistrations() {
  await runTest('getMyEventRegistrations()', async () => {
    const events = await EventAPI.getMyEventRegistrations();
    
    if (!Array.isArray(events)) throw new Error('Result is not an array');
    
    console.log(`   Found ${events.length} registered events`);
  });
}

/**
 * Test 9: purchaseEventWithWallet() - Purchase event with wallet
 */
async function testPurchaseEventWithWallet() {
  await runTest('purchaseEventWithWallet()', async () => {
    const result = await EventAPI.purchaseEventWithWallet(
      TEST_CONFIG.eventId,
      TEST_CONFIG.amount,
      TEST_CONFIG.creatorId
    );
    
    if (!result) throw new Error('Result is null or undefined');
    if (!result.success) throw new Error('Purchase failed');
    if (typeof result.newBalance !== 'number') throw new Error('newBalance is not a number');
    
    console.log(`   Purchase successful. New balance: ${result.newBalance}`);
  });
}

/**
 * Test 10: isRegisteredForEvent() - Check registration status
 */
async function testIsRegisteredForEvent() {
  await runTest('isRegisteredForEvent()', async () => {
    const isRegistered = await EventAPI.isRegisteredForEvent(TEST_CONFIG.eventId);
    
    if (typeof isRegistered !== 'boolean') throw new Error('Result is not a boolean');
    
    console.log(`   Registration status: ${isRegistered}`);
  });
}

// ============================================================================
// Helper Function Tests
// ============================================================================

/**
 * Test 11: getEventStatus() - Get event status
 */
async function testGetEventStatus() {
  await runTest('getEventStatus()', async () => {
    const mockEvent: EventAPI.Event = {
      id: '1',
      title: 'Test Event',
      description: 'Test',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [],
      speakers: [],
      attendees: [],
      totalRevenue: 0,
      totalAttendees: 0,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const status = EventAPI.getEventStatus(mockEvent);
    
    if (!['upcoming', 'active', 'completed'].includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    console.log(`   Event status: ${status}`);
  });
}

/**
 * Test 12: getDaysUntilEvent() - Calculate days until event
 */
async function testGetDaysUntilEvent() {
  await runTest('getDaysUntilEvent()', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const days = EventAPI.getDaysUntilEvent(tomorrow);
    
    if (typeof days !== 'number') throw new Error('Result is not a number');
    if (days < 0) throw new Error('Days cannot be negative');
    
    console.log(`   Days until event: ${days}`);
  });
}

/**
 * Test 13: formatEventDateRange() - Format date range
 */
async function testFormatEventDateRange() {
  await runTest('formatEventDateRange()', async () => {
    const startDate = '2024-01-15T10:00:00Z';
    const endDate = '2024-01-17T12:00:00Z';
    
    const formatted = EventAPI.formatEventDateRange(startDate, endDate);
    
    if (typeof formatted !== 'string') throw new Error('Result is not a string');
    if (formatted.length === 0) throw new Error('Result is empty');
    
    console.log(`   Formatted date range: ${formatted}`);
  });
}

/**
 * Test 14: getEventPrice() - Get minimum event price
 */
async function testGetEventPrice() {
  await runTest('getEventPrice()', async () => {
    const mockEvent: EventAPI.Event = {
      id: '1',
      title: 'Test Event',
      description: 'Test',
      startDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [
        { id: '1', type: 'regular', name: 'Regular', price: 50, description: 'Test', sold: 0 },
        { id: '2', type: 'vip', name: 'VIP', price: 100, description: 'Test', sold: 0 },
      ],
      speakers: [],
      attendees: [],
      totalRevenue: 0,
      totalAttendees: 0,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const price = EventAPI.getEventPrice(mockEvent);
    
    if (typeof price !== 'number') throw new Error('Result is not a number');
    if (price !== 50) throw new Error(`Expected 50, got ${price}`);
    
    console.log(`   Event price: ${price}`);
  });
}

/**
 * Test 15: isEventFree() - Check if event is free
 */
async function testIsEventFree() {
  await runTest('isEventFree()', async () => {
    const freeEvent: EventAPI.Event = {
      id: '1',
      title: 'Free Event',
      description: 'Test',
      startDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [
        { id: '1', type: 'free', name: 'Free', price: 0, description: 'Test', sold: 0 },
      ],
      speakers: [],
      attendees: [],
      totalRevenue: 0,
      totalAttendees: 0,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const isFree = EventAPI.isEventFree(freeEvent);
    
    if (typeof isFree !== 'boolean') throw new Error('Result is not a boolean');
    if (!isFree) throw new Error('Expected true for free event');
    
    console.log(`   Event is free: ${isFree}`);
  });
}

/**
 * Test 16: isUserRegistered() - Check if user is registered
 */
async function testIsUserRegistered() {
  await runTest('isUserRegistered()', async () => {
    const mockEvent: EventAPI.Event = {
      id: '1',
      title: 'Test Event',
      description: 'Test',
      startDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [],
      speakers: [],
      attendees: [
        {
          id: '1',
          user: { id: 'user123', name: 'Test User', email: 'test@test.com' },
          ticketType: 'regular',
          registeredAt: new Date().toISOString(),
          checkedIn: false,
        },
      ],
      totalRevenue: 0,
      totalAttendees: 1,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const isRegistered = EventAPI.isUserRegistered(mockEvent, 'user123');
    
    if (typeof isRegistered !== 'boolean') throw new Error('Result is not a boolean');
    if (!isRegistered) throw new Error('Expected true for registered user');
    
    console.log(`   User is registered: ${isRegistered}`);
  });
}

/**
 * Test 17: formatEventTime() - Format time range
 */
async function testFormatEventTime() {
  await runTest('formatEventTime()', async () => {
    const formatted = EventAPI.formatEventTime('14:00', '16:30');
    
    if (typeof formatted !== 'string') throw new Error('Result is not a string');
    if (!formatted.includes('PM')) throw new Error('Expected PM in formatted time');
    
    console.log(`   Formatted time: ${formatted}`);
  });
}

/**
 * Test 18: getEventDuration() - Calculate event duration
 */
async function testGetEventDuration() {
  await runTest('getEventDuration()', async () => {
    const duration = EventAPI.getEventDuration('14:00', '16:30');
    
    if (typeof duration !== 'number') throw new Error('Result is not a number');
    if (duration !== 2.5) throw new Error(`Expected 2.5 hours, got ${duration}`);
    
    console.log(`   Event duration: ${duration} hours`);
  });
}

/**
 * Test 19: getAvailableSpots() - Get available spots
 */
async function testGetAvailableSpots() {
  await runTest('getAvailableSpots()', async () => {
    const mockEvent: EventAPI.Event = {
      id: '1',
      title: 'Test Event',
      description: 'Test',
      startDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [
        { id: '1', type: 'regular', name: 'Regular', price: 50, description: 'Test', quantity: 100, sold: 30 },
      ],
      speakers: [],
      attendees: [],
      totalRevenue: 0,
      totalAttendees: 0,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const spots = EventAPI.getAvailableSpots(mockEvent);
    
    if (spots !== 70) throw new Error(`Expected 70 spots, got ${spots}`);
    
    console.log(`   Available spots: ${spots}`);
  });
}

/**
 * Test 20: isEventSoldOut() - Check if event is sold out
 */
async function testIsEventSoldOut() {
  await runTest('isEventSoldOut()', async () => {
    const soldOutEvent: EventAPI.Event = {
      id: '1',
      title: 'Sold Out Event',
      description: 'Test',
      startDate: new Date().toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'UTC',
      location: 'Test Location',
      category: 'Test',
      type: 'Online',
      isActive: true,
      isPublished: true,
      communityId: '1',
      creatorId: '1',
      community: { id: '1', name: 'Test', slug: 'test' },
      creator: { id: '1', name: 'Test', email: 'test@test.com' },
      sessions: [],
      tickets: [
        { id: '1', type: 'regular', name: 'Regular', price: 50, description: 'Test', quantity: 100, sold: 100 },
      ],
      speakers: [],
      attendees: [],
      totalRevenue: 0,
      totalAttendees: 0,
      averageAttendance: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const isSoldOut = EventAPI.isEventSoldOut(soldOutEvent);
    
    if (typeof isSoldOut !== 'boolean') throw new Error('Result is not a boolean');
    if (!isSoldOut) throw new Error('Expected true for sold out event');
    
    console.log(`   Event is sold out: ${isSoldOut}`);
  });
}

/**
 * Test 21: getEventTypeIcon() - Get icon for event type
 */
async function testGetEventTypeIcon() {
  await runTest('getEventTypeIcon()', async () => {
    const onlineIcon = EventAPI.getEventTypeIcon('Online');
    const inPersonIcon = EventAPI.getEventTypeIcon('In-person');
    const hybridIcon = EventAPI.getEventTypeIcon('Hybrid');
    
    if (typeof onlineIcon !== 'string') throw new Error('Online icon is not a string');
    if (typeof inPersonIcon !== 'string') throw new Error('In-person icon is not a string');
    if (typeof hybridIcon !== 'string') throw new Error('Hybrid icon is not a string');
    
    console.log(`   Icons - Online: ${onlineIcon}, In-person: ${inPersonIcon}, Hybrid: ${hybridIcon}`);
  });
}

/**
 * Test 22: getEventStatusColor() - Get color for event status
 */
async function testGetEventStatusColor() {
  await runTest('getEventStatusColor()', async () => {
    const upcomingColor = EventAPI.getEventStatusColor('upcoming');
    const activeColor = EventAPI.getEventStatusColor('active');
    const completedColor = EventAPI.getEventStatusColor('completed');
    
    if (typeof upcomingColor !== 'string') throw new Error('Upcoming color is not a string');
    if (typeof activeColor !== 'string') throw new Error('Active color is not a string');
    if (typeof completedColor !== 'string') throw new Error('Completed color is not a string');
    
    console.log(`   Colors - Upcoming: ${upcomingColor}, Active: ${activeColor}, Completed: ${completedColor}`);
  });
}

// ============================================================================
// Test Runner
// ============================================================================

/**
 * Run all API function tests (requires authentication and real backend)
 */
export async function runAllAPITests() {
  console.log('\n========================================');
  console.log('🚀 Starting Event API Tests (API Functions)');
  console.log('========================================\n');
  console.log('⚠️  NOTE: These tests require:');
  console.log('   - Active backend connection');
  console.log('   - Valid authentication token');
  console.log('   - Real event data in database');
  console.log('   - Update TEST_CONFIG with real IDs\n');
  
  // API function tests (require backend)
  await testGetEvents();
  await testGetEventsWithFilters();
  await testGetEventsByCommunity();
  await testGetEventById();
  await testRegisterForEvent();
  await testRegisterForEventWithPromo();
  await testUnregisterFromEvent();
  await testGetMyEventRegistrations();
  await testPurchaseEventWithWallet();
  await testIsRegisteredForEvent();
  
  printTestSummary('API Functions');
}

/**
 * Run all helper function tests (no backend required)
 */
export async function runAllHelperTests() {
  console.log('\n========================================');
  console.log('🧪 Starting Event API Tests (Helper Functions)');
  console.log('========================================\n');
  console.log('✅ These tests run locally without backend\n');
  
  // Helper function tests (no backend required)
  await testGetEventStatus();
  await testGetDaysUntilEvent();
  await testFormatEventDateRange();
  await testGetEventPrice();
  await testIsEventFree();
  await testIsUserRegistered();
  await testFormatEventTime();
  await testGetEventDuration();
  await testGetAvailableSpots();
  await testIsEventSoldOut();
  await testGetEventTypeIcon();
  await testGetEventStatusColor();
  
  printTestSummary('Helper Functions');
}

/**
 * Run all tests (API + Helper functions)
 */
export async function runAllEventAPITests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   EVENT API COMPREHENSIVE TEST SUITE   ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  // Clear previous results
  testResults.length = 0;
  
  // Run helper tests first (no backend required)
  await runAllHelperTests();
  
  // Run API tests (require backend)
  await runAllAPITests();
  
  // Print final summary
  printFinalSummary();
}

/**
 * Print test summary for a category
 */
function printTestSummary(category: string) {
  const categoryResults = testResults.filter(r => 
    testResults.indexOf(r) >= testResults.length - 12 || category === 'API Functions'
  );
  
  const passed = categoryResults.filter(r => r.status === 'PASS').length;
  const failed = categoryResults.filter(r => r.status === 'FAIL').length;
  const total = categoryResults.length;
  
  console.log('\n----------------------------------------');
  console.log(`${category} Test Summary:`);
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log('----------------------------------------\n');
}

/**
 * Print final test summary
 */
function printFinalSummary() {
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║         FINAL TEST SUMMARY             ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('Failed Tests:');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  ❌ ${r.name}`);
        console.log(`     Error: ${r.message}`);
      });
    console.log('');
  }
  
  console.log('╔════════════════════════════════════════╗');
  console.log('║           TEST RUN COMPLETE            ║');
  console.log('╚════════════════════════════════════════╝\n');
}

/**
 * Export individual test functions for selective testing
 */
export const tests = {
  // API Functions
  testGetEvents,
  testGetEventsWithFilters,
  testGetEventsByCommunity,
  testGetEventById,
  testRegisterForEvent,
  testRegisterForEventWithPromo,
  testUnregisterFromEvent,
  testGetMyEventRegistrations,
  testPurchaseEventWithWallet,
  testIsRegisteredForEvent,
  
  // Helper Functions
  testGetEventStatus,
  testGetDaysUntilEvent,
  testFormatEventDateRange,
  testGetEventPrice,
  testIsEventFree,
  testIsUserRegistered,
  testFormatEventTime,
  testGetEventDuration,
  testGetAvailableSpots,
  testIsEventSoldOut,
  testGetEventTypeIcon,
  testGetEventStatusColor,
};

// Export test configuration for easy updates
export { TEST_CONFIG };
