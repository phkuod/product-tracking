import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

// Generic validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown properties
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      next(new ValidationError('Validation failed', errorMessages));
    } else {
      // Replace the original data with validated/sanitized data
      req[property] = value;
      next();
    }
  };
};

// Common validation schemas
export const schemas = {
  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // User schemas
  login: Joi.object({
    username: Joi.string().required().trim(),
    password: Joi.string().required().min(6)
  }),

  createUser: Joi.object({
    username: Joi.string().required().trim().min(3).max(50),
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().min(6).max(128),
    name: Joi.string().required().trim().min(2).max(100),
    role: Joi.string().valid('admin', 'manager', 'operator', 'viewer').required(),
    department: Joi.string().required().trim().min(2).max(100)
  }),

  updateUser: Joi.object({
    username: Joi.string().trim().min(3).max(50).optional(),
    email: Joi.string().email().trim().optional(),
    password: Joi.string().min(6).max(128).optional(),
    name: Joi.string().trim().min(2).max(100).optional(),
    role: Joi.string().valid('admin', 'manager', 'operator', 'viewer').optional(),
    department: Joi.string().trim().min(2).max(100).optional(),
    is_active: Joi.boolean().optional()
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    model: Joi.string().required().trim().min(2).max(100),
    route_id: Joi.string().uuid().required(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    notes: Joi.string().trim().max(1000).optional()
  }),

  updateProduct: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    model: Joi.string().trim().min(2).max(100).optional(),
    route_id: Joi.string().uuid().optional(),
    current_station_id: Joi.string().uuid().allow(null).optional(),
    progress: Joi.number().integer().min(0).max(100).optional(),
    status: Joi.string().valid('normal', 'overdue').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional()
  }),

  productFilters: Joi.object({
    search: Joi.string().trim().optional(),
    status: Joi.string().valid('normal', 'overdue').optional(),
    route_id: Joi.string().uuid().optional(),
    owner: Joi.string().trim().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional()
  }),

  advanceProduct: Joi.object({
    notes: Joi.string().trim().max(1000).optional(),
    field_data: Joi.object().optional()
  }),

  bulkUpdate: Joi.object({
    product_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
    updates: Joi.object({
      status: Joi.string().valid('normal', 'overdue').optional(),
      priority: Joi.string().valid('low', 'medium', 'high').optional(),
      current_station_id: Joi.string().uuid().allow(null).optional()
    }).min(1).required()
  }),

  // Route schemas
  createRoute: Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    description: Joi.string().trim().max(1000).optional(),
    station_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
  }),

  updateRoute: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(1000).optional(),
    station_ids: Joi.array().items(Joi.string().uuid()).min(1).optional(),
    is_active: Joi.boolean().optional()
  }),

  // Station schemas
  createStation: Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    owner: Joi.string().required().trim().min(2).max(100),
    completion_rule: Joi.string().valid('all_filled', 'custom').required(),
    estimated_duration: Joi.number().integer().min(0).required(),
    fields: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim().min(2).max(100),
        type: Joi.string().valid('text', 'number', 'date', 'select', 'checkbox', 'textarea').required(),
        is_required: Joi.boolean().default(false),
        options: Joi.array().items(Joi.string()).when('type', {
          is: 'select',
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        default_value: Joi.string().optional(),
        validation_rules: Joi.object().optional()
      })
    ).optional()
  }),

  updateStation: Joi.object({
    name: Joi.string().trim().min(2).max(200).optional(),
    owner: Joi.string().trim().min(2).max(100).optional(),
    completion_rule: Joi.string().valid('all_filled', 'custom').optional(),
    estimated_duration: Joi.number().integer().min(0).optional(),
    is_active: Joi.boolean().optional()
  }),

  // ID parameter validation
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  })
};

// Predefined validation middleware
export const validateLogin = validate(schemas.login);
export const validateCreateUser = validate(schemas.createUser);
export const validateUpdateUser = validate(schemas.updateUser);
export const validateCreateProduct = validate(schemas.createProduct);
export const validateUpdateProduct = validate(schemas.updateProduct);
export const validateProductFilters = validate(schemas.productFilters, 'query');
export const validateAdvanceProduct = validate(schemas.advanceProduct);
export const validateBulkUpdate = validate(schemas.bulkUpdate);
export const validateCreateRoute = validate(schemas.createRoute);
export const validateUpdateRoute = validate(schemas.updateRoute);
export const validateCreateStation = validate(schemas.createStation);
export const validateUpdateStation = validate(schemas.updateStation);
export const validatePagination = validate(schemas.pagination, 'query');
export const validateUuidParam = validate(schemas.uuidParam, 'params');