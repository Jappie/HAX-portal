import { db } from '../../db/database.ts';
import { portalApps } from '../../db/schema.ts';

export interface AppInfo {
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
    // Get apps from database using Drizzle ORM with node-sqlite driver
    const rows = db.select().from(portalApps).all();
    
    for (const row of rows) {
      apps.push({
        name: row.name,
        fullname: row.fullname,
        category: row.category || 'default',
        basePath: row.mountPath,
        mountPath: row.mountPath,
        modulePath: row.modulePath
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
