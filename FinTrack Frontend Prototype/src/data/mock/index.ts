/**
 * Single entry point for the mock data layer.
 *
 * Swap this barrel for an API client module (same exported shapes) once the
 * Spring Boot backend is available — nothing else in the app imports the mocks.
 */
export { mockUser } from "./user.mock";
export { mockAccounts } from "./accounts.mock";
export { mockTransactions } from "./transactions.mock";
export { mockBudgets } from "./budgets.mock";
export { mockCards } from "./cards.mock";
export { mockGoals } from "./goals.mock";
export { mockNotifications } from "./notifications.mock";
