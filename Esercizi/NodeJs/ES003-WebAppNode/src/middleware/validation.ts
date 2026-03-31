import { body, query, ValidationChain } from 'express-validator';

export const createCustomerValidation: ValidationChain[] = [
    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min:2,  max: 100 }).withMessage('First name must be between 2 and 100 characters long')
        .escape(),

    body('last_name')    
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min:2,  max: 100 }).withMessage('Last name must be between 2 and 100 characters long')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\+\-\(\)]+$/)
        .withMessage('Phone number can only contain digits, spaces, +, -, and parentheses')
        .escape(),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('Company name must be at most 150 characters long')
        .escape(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Address must be at most 255 characters long')
        .escape(),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City must be at most 100 characters long')
        .escape(),

    body('state')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('State must be at most 100 characters long')
        .escape(),

    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Postal code must be at most 20 characters long')
        .escape(),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country must be at most 100 characters long')
        .escape(),
   
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes must be at most 500 characters long')
        .escape(),
    
];


export const updateCustomerValidation: ValidationChain[] = [
    body('first_name')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min:2,  max: 100 }).withMessage('First name must be between 2 and 100 characters long')
        .escape(),

    body('last_name')    
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min:2,  max: 100 }).withMessage('Last name must be between 2 and 100 characters long')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\+\-\(\)]+$/)
        .withMessage('Phone number can only contain digits, spaces, +, -, and parentheses')
        .escape(),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 150 }).withMessage('Company name must be at most 150 characters long')
        .escape(),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('Address must be at most 255 characters long')
        .escape(),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('City must be at most 100 characters long')
        .escape(),

    body('state')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('State must be at most 100 characters long')
        .escape(),

    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Postal code must be at most 20 characters long')
        .escape(),

    body('country')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Country must be at most 100 characters long')
        .escape(),
   
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Notes must be at most 500 characters long')
        .escape(),
    
];


export const queryParamsValidation: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        
  
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be a positive integer between 1 and 100'),
  
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query must be at most 100 characters long')
        .escape(),
    
    query('sortBy')
        .optional()
        .isIn(['first_name', 'last_name', 'email', 'company', 'city', 'created_at', 'updated_at']),
    
    query('order')
        .optional()
        .isIn(['ASC', 'DESC']).withMessage('Order must be either ASC or DESC'),
];