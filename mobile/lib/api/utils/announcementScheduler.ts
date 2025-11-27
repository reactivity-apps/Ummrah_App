/**
 * Announcement Scheduler
 * 
 * Background task to process scheduled announcements and send them at the right time
 * This should be triggered periodically (e.g., every 5-15 minutes)
 */

import { processScheduledAnnouncements } from '../services/announcement.service';

/**
 * Main scheduler function - processes all scheduled announcements that are due
 * Call this from a background task, cron job, or periodic interval
 */
export async function runAnnouncementScheduler(): Promise<{
    success: boolean;
    sent: number;
    errors: string[];
    timestamp: string;
}> {
    const timestamp = new Date().toISOString();
    console.log(`[Announcement Scheduler] Running at ${timestamp}`);

    try {
        const result = await processScheduledAnnouncements();

        if (result.sent > 0) {
            console.log(`[Announcement Scheduler] Successfully sent ${result.sent} scheduled announcements`);
        }

        if (result.errors.length > 0) {
            console.error(`[Announcement Scheduler] Errors encountered:`, result.errors);
        }

        return {
            success: true,
            sent: result.sent,
            errors: result.errors,
            timestamp,
        };
    } catch (error) {
        console.error(`[Announcement Scheduler] Fatal error:`, error);
        return {
            success: false,
            sent: 0,
            errors: [`Fatal error: ${error}`],
            timestamp,
        };
    }
}

/**
 * Start a periodic scheduler that runs every N minutes
 * For development/testing - in production, use a proper background task service
 */
export function startPeriodicScheduler(intervalMinutes: number = 15): () => void {
    console.log(`[Announcement Scheduler] Starting periodic scheduler (every ${intervalMinutes} minutes)`);

    // Run immediately on start
    runAnnouncementScheduler();

    // Then run periodically
    const intervalId = setInterval(() => {
        runAnnouncementScheduler();
    }, intervalMinutes * 60 * 1000);

    // Return cleanup function
    return () => {
        console.log('[Announcement Scheduler] Stopping periodic scheduler');
        clearInterval(intervalId);
    };
}

/**
 * For React Native, you might want to use expo-task-manager and expo-background-fetch
 * Example integration:
 * 
 * import * as BackgroundFetch from 'expo-background-fetch';
 * import * as TaskManager from 'expo-task-manager';
 * 
 * const ANNOUNCEMENT_SCHEDULER_TASK = 'announcement-scheduler';
 * 
 * TaskManager.defineTask(ANNOUNCEMENT_SCHEDULER_TASK, async () => {
 *     try {
 *         await runAnnouncementScheduler();
 *         return BackgroundFetch.BackgroundFetchResult.NewData;
 *     } catch (error) {
 *         return BackgroundFetch.BackgroundFetchResult.Failed;
 *     }
 * });
 * 
 * export async function registerBackgroundScheduler() {
 *     return BackgroundFetch.registerTaskAsync(ANNOUNCEMENT_SCHEDULER_TASK, {
 *         minimumInterval: 15 * 60, // 15 minutes
 *         stopOnTerminate: false,
 *         startOnBoot: true,
 *     });
 * }
 */
