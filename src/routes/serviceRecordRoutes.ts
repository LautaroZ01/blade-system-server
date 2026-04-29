import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { checkAdminAccess } from '../middlewares/authMiddleware';
import {
    createServiceRecord,
    getClientRecords,
    getUpcomingTouchups,
    updateServiceRecord,
    deleteServiceRecord
} from '../controllers/serviceRecordController';

const router: Router = Router();

// Middleware para manejar los errores de express-validator
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Proteger todas las rutas con el middleware de admin
// router.use(checkAdminAccess);

// ==========================================
// Rutas Específicas (Deben ir antes de las dinámicas como /:id)
// ==========================================

// 3. Read - Próximos Retoques / Dashboard (GET /api/registros/retoques)
router.get('/retoques', getUpcomingTouchups);

// 2. Read - Historial por Cliente (GET /api/registros/cliente/:clientId)
router.get(
    '/cliente/:clientId',
    [
        param('clientId').isMongoId().withMessage('El ID del cliente no es válido'),
        validateRequest
    ],
    getClientRecords
);

// ==========================================
// Rutas Base (CRUD Estándar)
// ==========================================

// 1. Create (POST /api/registros)
router.post(
    '/',
    [
        body('client').isMongoId().withMessage('El ID del cliente (client) es obligatorio y debe ser válido'),
        body('service').isMongoId().withMessage('El ID del servicio (service) es obligatorio y debe ser válido'),
        body('serviceDate').isISO8601().withMessage('La fecha del servicio (serviceDate) es obligatoria y debe tener formato ISO 8601').toDate(),
        body('notes').optional().isString().trim(),
        body('productsUsed').optional().isString().trim(),
        body('nextTouchupDate').optional({ nullable: true }).isISO8601().withMessage('nextTouchupDate debe ser una fecha válida').toDate(),
        body('touchupStatus').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Estado de retoque no válido'),
        validateRequest
    ],
    createServiceRecord
);

// 4. Update (PUT /api/registros/:id)
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('El ID del registro no es válido'),
        body('client').optional().isMongoId().withMessage('El ID del cliente no es válido'),
        body('service').optional().isMongoId().withMessage('El ID del servicio no es válido'),
        body('serviceDate').optional().isISO8601().withMessage('serviceDate debe tener formato ISO 8601').toDate(),
        body('notes').optional().isString().trim(),
        body('productsUsed').optional().isString().trim(),
        body('nextTouchupDate').optional({ nullable: true }).isISO8601().withMessage('nextTouchupDate debe ser una fecha válida').toDate(),
        body('touchupStatus').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Estado de retoque no válido'),
        validateRequest
    ],
    updateServiceRecord
);

// 5. Delete (DELETE /api/registros/:id)
router.delete(
    '/:id',
    [
        param('id').isMongoId().withMessage('El ID del registro no es válido'),
        validateRequest
    ],
    deleteServiceRecord
);

export default router;
