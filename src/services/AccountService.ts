import { getDb } from '../db/database';

export type AccountStatus = 'active' | 'expired';
export type Platform = 'instagram' | 'tiktok';

export interface Account {
  id: number;
  platform: Platform;
  username: string;
  status: AccountStatus;
  created_at: string;
}

export async function getAccounts(): Promise<Account[]> {
  const db = await getDb();
  return db.getAllAsync<Account>('SELECT * FROM accounts ORDER BY platform, username');
}

export async function getAccountsByPlatform(platform: Platform): Promise<Account[]> {
  const db = await getDb();
  return db.getAllAsync<Account>(
    'SELECT * FROM accounts WHERE platform = ? ORDER BY username',
    [platform]
  );
}

export async function addAccount(platform: Platform, username: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO accounts (platform, username, status) VALUES (?, ?, ?)',
    [platform, username, 'active']
  );
  return result.lastInsertRowId;
}

export async function updateAccountStatus(id: number, status: AccountStatus): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE accounts SET status = ? WHERE id = ?', [status, id]);
}

export async function deleteAccount(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = await getDb();
  return db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', [id]);
}
