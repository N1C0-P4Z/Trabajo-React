import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export interface AuditMetadata {
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
  resource: 'patient' | 'appointment' | 'payment';
  resourceIdParam?: string; // route param name for resource ID (e.g. 'id')
}

/**
 * Audit middleware that wraps route handlers.
 * After the route handler sends a successful (2xx) response,
 * an AuditLog row is written. On audit write failure, the
 * request is failed with 500.
 *
 * Usage: router.get('/', audit({ action: 'READ', resource: 'patient' }), controller.list)
 */
export function audit(metadata: AuditMetadata) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    let responseBody: any;
    let auditDone = false;

    // Override res.json to capture the response body and status
    res.json = function (body: any): any {
      responseBody = body;
      return originalJson(body);
    };

    // After response is sent, write audit log asynchronously
    res.on('finish', () => {
      if (auditDone) return;
      auditDone = true;

      // Only audit 2xx responses
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const user = (req as any).user;
      const userId = user?.userId ?? null;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      // Extract resource ID from route param if specified
      let resourceId: number | null = null;
      if (metadata.resourceIdParam && req.params[metadata.resourceIdParam]) {
        const parsed = parseInt(req.params[metadata.resourceIdParam]);
        if (!isNaN(parsed)) {
          resourceId = parsed;
        }
      }

      prisma.auditLog
        .create({
          data: {
            userId,
            action: metadata.action,
            resource: metadata.resource,
            resourceId,
            ipAddress,
          },
        })
        .catch((err: unknown) => {
          console.error('AUDIT WRITE FAILED — compliance gap:', err);
        });
    });

    next();
  };
}
