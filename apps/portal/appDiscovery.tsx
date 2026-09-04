import { sqlite } from '../../db/database.ts';

interface AppInfo {
  name: string;
  fullname: string;
  category: string;
  basePath: string;
  mountPath: string;
  modulePath: string;
}

export async function discoverApps(): Promise<AppInfo[]> {
  const apps: AppInfo[] = [];

  try {
    // Get apps from database using raw SQL
    const stmt = sqlite.prepare('SELECT * FROM portal_apps');
    const rows = stmt.all() as any[];
    
    for (const row of rows) {
      apps.push({
        name: row.name,
        fullname: row.fullname,
        category: row.category || 'default',
        basePath: row.mount_path,
        mountPath: row.mount_path,
        modulePath: row.module_path
      });
    }
  } catch (err) {
    console.error('Error discovering apps:', err);
  }

  // Sort by category (ascending), then by fullname (ascending)
  return apps.sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;
    return a.fullname.localeCompare(b.fullname);
  });
}
