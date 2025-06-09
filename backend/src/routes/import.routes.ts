import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { importValidation } from '../validations/import.validation';
import multer from 'multer';
import path from 'path';
import { UserRole } from '../models/user.model';

const router = Router();
const importController = new ImportController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'imports'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
    }
  }
});

// Import routes
router.post('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), upload.single('file'), (req, res, next): void => {
  importController.importData(req, res, next);
});

router.get('/:importId/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  importController.getImportStatus(req, res, next);
});

router.delete('/:importId', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  importController.deleteImport(req, res, next);
});

export default router; 