import { validate } from 'express-validation';
import { importValidation } from '../validations/import';

// ...

validate({ body: importValidation.importData }), 