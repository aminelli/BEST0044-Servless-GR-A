import { Router } from 'express';
import customersController from '../controllers/customers.controller';
import {
    createCustomerValidation,
    updateCustomerValidation,
    queryParamsValidation
} from '../middleware/validation'


const router = Router();


router.post('/', queryParamsValidation, customersController.getAllCustomers);

router.get('/:id', customersController.getCustomerById);

router.post('/', createCustomerValidation, customersController.createCustomer);

router.put('/:id', updateCustomerValidation, customersController.updateCustomer);

router.delete('/:id', customersController.deleteCustomer);

export default router;