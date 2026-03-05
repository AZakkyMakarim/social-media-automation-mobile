import { getDb } from '../db/database';
import { TaskAction, TaskPlatform } from './TaskService';

export interface ActivityLog {
  id: number;
  task_id: number | null;
  platform: TaskPlatform;
  action: TaskAction;
  url: string;
  account_username: string | null;
  status: 'success' | 'failed';
  result_message: string | null;
  screenshot_path: string | null;
  created_at: string;
}

export interface CreateLogInput {
  task_id?: number;
  platform: TaskPlatform;
  action: TaskAction;
  url: string;
  account_username?: string;
  status: 'success' | 'failed';
  result_message?: string;
  screenshot_path?: string;
}

export async function getLogs(): Promise<ActivityLog[]> {
  const db = await getDb();
  return db.getAllAsync<ActivityLog>('SELECT * FROM activity_logs ORDER BY created_at DESC');
}

export async function createLog(input: CreateLogInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO activity_logs (task_id, platform, action, url, account_username, status, result_message, screenshot_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.task_id ?? null,
      input.platform,
      input.action,
      input.url,
      input.account_username ?? null,
      input.status,
      input.result_message ?? null,
      input.screenshot_path ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getTodayStats(): Promise<{ total: number; success: number; failed: number }> {
  const db = await getDb();
  const today = new Date().toISOString().substring(0, 10);
  const result = await db.getFirstAsync<{ total: number; success: number; failed: number }>(
    `SELECT COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
     FROM activity_logs WHERE created_at LIKE ?`,
    [`${today}%`]
  );
  return result ?? { total: 0, success: 0, failed: 0 };
}

export async function clearLogs(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM activity_logs');
}
