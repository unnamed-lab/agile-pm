export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@apms/database/generated/client$': '<rootDir>/test/mocks/prisma-client.mock.ts',
    '^@apms/database/(.*)$': '<rootDir>/../../packages/database/$1',
  },
};
