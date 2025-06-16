import { useSession } from "next-auth/react";
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Create an atom to store user preferences (simplified)
export const userPreferencesAtom = atomWithStorage<{ selectedRegion?: string }>('userPreferences', {});

/**
 * Simplified hook for user permission management - Zanzibar version
 * 
 * Provides basic authentication and simplified permission structure
 * for Zanzibar/Pemba fishing data application.
 */
export const useUserPermissions = () => {
  const { data: session } = useSession();
  const [userPreferences, setUserPreferences] = useAtom(userPreferencesAtom);
  
  // Simplified admin check - only check if user has admin role
  const isAdmin = !!(session?.user?.email && 
    (session.user.email.includes('admin') || 
     session?.user?.groups?.some((group: { name: string }) => group.name.toLowerCase() === 'admin')));
  
  // For Zanzibar, we'll use a simplified structure
  const isLoggedIn = !!session?.user;
  
  // Get basic user information
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;
  
  /**
   * For Zanzibar - all authenticated users can access all data
   * This removes the complex BMU-based restrictions from Kenya version
   */
  const getAccessibleRegions = (allRegions: string[]): string[] => {
    // All authenticated users can see all regions
    return allRegions;
  };
  
  /**
   * Simplified data access - no restrictions for Zanzibar version
   */
  const canAccessData = () => {
    return isLoggedIn;
  };

  return {
    // User information
    userEmail,
    userName,
    isLoggedIn,
    isAdmin,
    
    // User preferences
    userPreferences,
    setUserPreferences,
    
    // Simplified helper functions
    getAccessibleRegions,
    canAccessData,
    
    // Simple flags for components
    canViewData: isLoggedIn,
    canEditData: isAdmin,
    canDeleteData: isAdmin,
    canExportData: isLoggedIn,
    
    // Legacy compatibility (for components not yet updated)
    hasRestrictedAccess: false,
    shouldShowAggregated: true,
    shouldShowIndividualData: true,
    canCompareWithOthers: true,
    canSeeBMUData: true,
    
    // Deprecated properties (kept for backwards compatibility during migration)
    isCiaUser: false,
    isWbciaUser: false,
    isIiaUser: false,
    userBMU: null,
    referenceBMU: null,
    userFisherId: null,
    getAccessibleBMUs: (allBMUs: string[]) => allBMUs,
    getLimitedBMUs: (allBMUs: string[]) => allBMUs,
  };
};

export default useUserPermissions; 