import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export interface AuditMetadata {
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
  resource: 'patient' | 'appointment' | 'payment';
  resourceIdParam?: string;
}

/** Registra accesos exitosos (2xx) a recursos sensibles. */
export function audit(metadata: AuditMetadata) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let auditDone = false;

    res.on('finish', () => {
      if (auditDone) return;
      auditDone = true;

      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const user = (req as any).user;
      const userId = user?.userId ?? null;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

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
          console.error('Error al escribir audit log:', err);
        });
    });

    next();
  };
}
