import { getDb } from '../db/database';

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';
export type TaskAction = 'like' | 'comment' | 'repost';
export type TaskPlatform = 'instagram' | 'tiktok';

/** Actions are stored in SQLite as a JSON string, e.g. '["like","repost"]' */
export interface Task {
  id: number;
  platform: TaskPlatform;
  /** Raw JSON string stored in DB — use parseActions() to get the array */
  action: string;
  url: string;
  post_id: string | null;
  account_id: number | null;
  comment_text: string | null;
  status: TaskStatus;
  retry_count: number;
  scheduled_at: string | null;
  executed_at: string | null;
  result_message: string | null;
  screenshot_path: string | null;
  created_at: string;
}

export interface CreateTaskInput {
  platform: TaskPlatform;
  /** Multiple actions — e.g. ['like','repost'] or ['comment'] */
  actions: TaskAction[];
  url: string;
  post_id?: string;
  account_id?: number;
  comment_text?: string;
  scheduled_at?: string;
}

/** Parse the JSON-encoded action string from DB into an array */
export function parseActions(actionJson: string): TaskAction[] {
  try {
    const parsed = JSON.parse(actionJson);
    return Array.isArray(parsed) ? parsed : [parsed as TaskAction];
  } catch {
    // Legacy single-action string fallback
    return [actionJson as TaskAction];
  }
}

/** Returns true if the action set requires a separate comment screenshot */
export function hasComment(actions: TaskAction[]): boolean {
  return actions.includes('comment');
}

/** Returns true if Like or Repost is in the set */
export function hasEngagement(actions: TaskAction[]): boolean {
  return actions.includes('like') || actions.includes('repost');
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.getAllAsync<Task>('SELECT * FROM tasks ORDER BY created_at DESC');
}

export async function getPendingTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at ASC"
  );
}

export async function createTask(input: CreateTaskInput): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO tasks (platform, action, url, post_id, account_id, comment_text, status, scheduled_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      input.platform,
      JSON.stringify(input.actions),
      input.url,
      input.post_id ?? null,
      input.account_id ?? null,
      input.comment_text ?? null,
      input.scheduled_at ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus,
  opts?: { result_message?: string; screenshot_path?: string }
): Promise<void> {
  const db = await getDb();
  const executedAt = status === 'done' || status === 'failed' ? new Date().toISOString() : null;
  await db.runAsync(
    `UPDATE tasks SET status = ?, executed_at = ?,
      result_message = COALESCE(?, result_message),
      screenshot_path = COALESCE(?, screenshot_path)
     WHERE id = ?`,
    [status, executedAt, opts?.result_message ?? null, opts?.screenshot_path ?? null, id]
  );
}

export async function incrementRetry(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tasks SET retry_count = retry_count + 1 WHERE id = ?', [id]);
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function resetTaskToPending(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE tasks SET status = 'pending', retry_count = 0, result_message = NULL WHERE id = ?",
    [id]
  );
}
