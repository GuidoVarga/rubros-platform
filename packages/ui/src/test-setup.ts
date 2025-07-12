// Jest setup file for @rubros/ui package
// This file is run before each test file

// Mock console methods in tests if needed
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global test utilities if needed
// Add any global test setup here
