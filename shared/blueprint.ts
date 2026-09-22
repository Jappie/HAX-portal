import { z } from 'zod';
import type { Hono } from 'hono';

// ========================================
// 1. ZOD SCHEMA FOR MENU METADATA
// ========================================
export const RouteMetadataSchema = z.object({
  showInMenu: z.literal(true), 
  menuName: z.string().min(1, "MenuName mag niet leeg zijn"),
  roles: z.array(z.string()).default([]), 
  isFavorite: z.boolean().default(false),
  resource: z.string().optional() // For ABAC integration
});

export type RouteConfig = {
  menuName: string;
  roles?: string[];
  isFavorite?: boolean;
  resource?: string;
  handler: any; // The Hono route handler
};

// ==========================================
// 2. THE FACTORY FUNCTION
// ==========================================
export function createMenuRoute(config: RouteConfig) {
  const fn = config.handler;

  // Attach metadata directly to the handler
  fn.menuName = config.menuName;
  fn.roles = config.roles || [];
  fn.isFavorite = config.isFavorite || false;
  fn.showInMenu = true;
  if (config.resource) {
    fn.resource = config.resource;
  }

  return fn;
}

// ==========================================
// 3. RUNTIME VALIDATION
// ==========================================
export function validateRoutesWithZod(honoApp: Hono) {
  let hasErrors = false;

  console.log('🔍 Route validation starting...');

  // In Hono, routes are available in honoApp.routes
  honoApp.routes.forEach((route) => {
    const handler = route.handler as any;
    
    // We only check GET routes meant for the menu
    if (route.method === 'GET' && handler && handler.showInMenu) {
      const result = RouteMetadataSchema.safeParse(handler);

      if (!result.success) {
        hasErrors = true;
        console.error(`\n❌ Validation error on route: [GET] ${route.path}`);
        
        result.error.issues.forEach((issue) => {
          console.error(`   -> Property '${issue.path.join('.')}' : ${issue.message}`);
        });
      }
    }
  });

  if (hasErrors) {
    console.error('\n🚨 Application startup halted: Fix the above route errors.');
    process.exit(1);
  } else {
    console.log('✅ All menu routes successfully validated with Zod.');
  }
}
