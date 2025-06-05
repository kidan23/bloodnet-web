/**
 * State Management Structure - Separated by Concerns
 * 
 * This separation addresses the previous issue where the donations.ts file
 * was becoming too large (585+ lines) with mixed responsibilities.
 * 
 * NEW STRUCTURE:
 * 
 * 1. donations.ts - Core donation management
 *    - useDonations() - Fetch donations with filtering/pagination
 *    - useDonation() - Fetch single donation
 *    - useDonorStats() - Fetch donor statistics
 *    - useCreateDonation() - Create new donation
 *    - useUpdateDonation() - Update existing donation
 *    - useDeleteDonation() - Delete donation
 *    - Legacy functions for backward compatibility
 * 
 * 2. bloodInventory.ts - Blood inventory and unit management
 *    - useBloodInventory() - Fetch blood inventory with filtering
 *    - useBloodInventoryStats() - Calculate inventory statistics
 *    - useUpdateBloodUnitStatus() - Update blood unit status
 *    - useMarkAsDispatched() - Mark units as dispatched
 *    - useMarkAsUsed() - Mark units as used
 *    - useDiscardBloodUnit() - Discard single unit
 *    - useBulkDiscardBloodUnits() - Bulk discard operations
 * 
 * 3. expiryManagement.ts - Dedicated expiry handling
 *    - useExpiredBloodUnits() - Fetch expired units from backend
 *    - useBloodUnitsExpiringSoon() - Fetch units expiring soon from backend
 * 
 * BENEFITS:
 * - Single Responsibility Principle: Each file has a clear, focused purpose
 * - Better maintainability: Easier to locate and modify specific functionality
 * - Reduced cognitive load: Smaller files are easier to understand
 * - Better testing: Can test each concern independently
 * - No more duplicate hooks: Eliminated the duplicate useBloodInventory functions
 * - Backend alignment: Uses dedicated backend routes for expiry management
 * 
 * USAGE:
 * Import from specific modules based on what you need:
 * - import { useDonations } from '../../state/donations';
 * - import { useBloodInventory } from '../../state/bloodInventory';
 * - import { useExpiredBloodUnits } from '../../state/expiryManagement';
 * 
 * Or import everything from the index:
 * - import { useDonations, useBloodInventory, useExpiredBloodUnits } from '../../state';
 */

// Re-export everything for convenience
export * from './donations';
export * from './bloodInventory';
export * from './expiryManagement';
