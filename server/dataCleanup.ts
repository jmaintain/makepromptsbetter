import { storage } from "./storage";

/**
 * Automated data cleanup service that runs daily to maintain privacy compliance
 * - Deletes prompt optimizations older than 30 days
 * - Deletes unsaved personas older than 30 days  
 * - Deletes usage logs older than 90 days (keeping for billing compliance)
 */
export class DataCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[DataCleanup] Starting automated data cleanup service');
    
    // Run cleanup immediately on startup
    this.runCleanup();
    
    // Schedule daily cleanup at 2 AM
    const runDaily = () => {
      const now = new Date();
      const tomorrow2AM = new Date(now);
      tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
      tomorrow2AM.setHours(2, 0, 0, 0);
      
      const msUntil2AM = tomorrow2AM.getTime() - now.getTime();
      
      setTimeout(() => {
        this.runCleanup();
        // Set up recurring daily cleanup
        this.cleanupInterval = setInterval(() => {
          this.runCleanup();
        }, 24 * 60 * 60 * 1000); // 24 hours
      }, msUntil2AM);
    };

    runDaily();
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('[DataCleanup] Stopped automated data cleanup service');
  }

  async runCleanup(): Promise<void> {
    try {
      console.log('[DataCleanup] Starting scheduled data cleanup...');
      const result = await storage.deleteOldData();
      
      console.log('[DataCleanup] Cleanup completed:', {
        deletedOptimizations: result.deletedOptimizations,
        deletedPersonas: result.deletedPersonas,
        deletedUsageLogs: result.deletedUsageLogs,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[DataCleanup] Error during cleanup:', error);
    }
  }

  async deleteUserData(userFingerprint: string): Promise<{ deletedOptimizations: number; deletedPersonas: number }> {
    console.log(`[DataCleanup] Manual user data deletion requested for: ${userFingerprint}`);
    const result = await storage.deleteUserData(userFingerprint);
    console.log(`[DataCleanup] User data deleted:`, result);
    return result;
  }
}

export const dataCleanupService = new DataCleanupService();