import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import pool from '../config/database';
import { Customer, CustomerQueryParams, CustomerStats, PaginatedResponse } from '../models/customer.model';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class CustomersController {

    async getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validazione input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const sortBy = req.query.sortBy as string || 'created_at';
            const order = (req.query.order as string || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            const offset = (page - 1) * limit;

            // Query
            let query = 'SELECT * FROM customers';
            let countQuery = 'SELECT COUNT(*) as total FROM customers';
            const params: any[] = [];
            const countParams: any[] = [];

            if (search) {
                const searchCondition = ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ? OR city LIKE ? OR state LIKE ? OR country LIKE ?';
                const searchParam = `%${search}%`;
                query += searchCondition;
                countQuery += searchCondition;
                params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
                countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
            }
            
            query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const [customers] = await pool.query<RowDataPacket[]>(query, params);
            const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);    

            logger.info(`Fetched customers - Page: ${page}, Limit: ${limit}, Search: ${search}, SortBy: ${sortBy}, Order: ${order}`);

            const response: PaginatedResponse<Customer> = {
                success: true,
                data: customers as Customer[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };

            res.status(200).json(response);
        }
        catch (error) {
            logger.error('Error fetching customers', { error });
            next(error);
        } finally {
            logger.info('getAllCustomers request completed');
        }
    }

    
    async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customers WHERE id = ?', [id]);

            if (rows.length === 0) {
                res.status(404).json({ success: false, message: 'Customer not found' });
                return;
            }

            logger.info(`Fetched customer with ID: ${id}`);
         
            res.status(200).json({ 
                success: true, 
                data: rows[0] as Customer }
            );
        } catch (error) {
            logger.error('Error fetching customer by ID', { error });
            next(error);
        } finally {
            logger.info('getCustomerById request completed');
        }
    }

    async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
         
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }

            const customer: Customer = req.body;

            const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM customers WHERE email = ?', [customer.email]);
           
            if (existing.length > 0) {
                // res.status(400).json({ success: false, errors: [{ msg: 'Email already exists' }] });
                // return;
                throw new AppError('Email already exists', 404);
            }

            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO customers (first_name, last_name, email, phone, company, address, city, state, postal_code, country, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [
                    customer.first_name, 
                    customer.last_name, 
                    customer.email, 
                    customer.phone, 
                    customer.company, 
                    customer.address, 
                    customer.city, 
                    customer.state, 
                    customer.postal_code, 
                    customer.country, 
                    customer.notes
                ]
            );

            logger.info(`Created new customer with ID: ${result.insertId}`);
            
            res.status(201).json({ 
                success: true, 
                data: { 
                    id: result.insertId, 
                    ...customer 
                } 
            });


        } catch (error) {
            logger.error('Error creating customer', { error });
            next(error);
        } finally {
            logger.info('createCustomer request completed');
        }
    }

    async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
                return;
            }   

            const { id } = req.params;
            const customer: Partial<Customer> = req.body;
            
            const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM customers WHERE id = ?', [id]);
            if (existing.length === 0) {
                res.status(404).json({ success: false, message: 'Customer not found' });
                return;
            }

            // Verifica se l'email è già in uso da un altro cliente
            if (customer.email) {
                const [emailCheck] = await pool.query<RowDataPacket[]>('SELECT id FROM customers WHERE email = ? AND id != ?', [customer.email, id]);
                if (emailCheck.length > 0) {
                    res.status(400).json({ success: false, errors: [{ msg: 'Email already exists' }] });
                    return;
                }
            }

            const fields: string[] = [];
            const values: any[] = [];

            Object.entries(customer).forEach(([key, value]) => {
                fields.push(`${key} = ?`);
                values.push(value);
            });

            if (fields.length === 0) {
                res.status(400).json({ success: false, message: 'No fields to update' });
                return;
            }

            values.push(id);

            const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
            await pool.query(query, values);

            res.status(200).json({ success: true, message: 'Customer updated successfully' });


        } catch (error) {
            logger.error('Error updating customer', { error });
            next(error);
        } finally {
            logger.info('updateCustomer request completed');
        }           
    }


    async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const [result] = await pool.query<ResultSetHeader>('DELETE FROM customers WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                res.status(404).json({ success: false, message: 'Customer not found' });
                return;
            }

            logger.info(`Deleted customer with ID: ${id}`);
            
            res.status(200).json({ success: true, message: 'Customer deleted successfully' });

        } catch (error) {
             logger.error('Error deleting customer', { error });
            next(error);    
        } finally {
            logger.info('deleteCustomer request completed');
        }
    }

}


export default new CustomersController();