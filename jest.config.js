module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['js', 'ts'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    }
  };