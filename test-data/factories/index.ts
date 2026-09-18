/**
 * Barrel export for test-data factories.
 *
 * Lets consumers import from `@data/factories` or `test-data/factories`
 * without knowing the internal file name. The real implementation and
 * portfolio rationale live in `customerFactory.ts`.
 */
export * from './customerFactory';
