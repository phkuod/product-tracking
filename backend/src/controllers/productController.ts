import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async (req: Request, res: Response) => {
  const {
    search,
    status,
    route_id,
    owner,
    priority,
    date_from,
    date_to,
    page = 1,
    limit = 20
  } = req.query;

  let query = `
    SELECT 
      p.*,
      r.name as route_name,
      s.name as current_station_name,
      s.owner as current_station_owner
    FROM products p
    LEFT JOIN routes r ON p.route_id = r.id
    LEFT JOIN stations s ON p.current_station_id = s.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (search) {
    query += ` AND (p.name LIKE ? OR p.model LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    query += ` AND p.status = ?`;
    params.push(status);
  }

  if (route_id) {
    query += ` AND p.route_id = ?`;
    params.push(route_id);
  }

  if (priority) {
    query += ` AND p.priority = ?`;
    params.push(priority);
  }

  if (date_from) {
    query += ` AND p.created_at >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    query += ` AND p.created_at <= ?`;
    params.push(date_to);
  }

  // Get total count
  const countQuery = query.replace('SELECT p.*, r.name as route_name, s.name as current_station_name, s.owner as current_station_owner', 'SELECT COUNT(*) as total');
  const totalResult = db.prepare(countQuery).get(...params) as { total: number };
  const total = totalResult.total;

  // Add pagination
  const offset = (Number(page) - 1) * Number(limit);
  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), offset);

  const products = db.prepare(query).all(...params);

  // Format products for frontend
  const formattedProducts = products.map((product: any) => ({
    id: product.id,
    name: product.name,
    model: product.model,
    currentStation: product.current_station_name || 'Not Started',
    progress: product.progress,
    status: product.status,
    priority: product.priority,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at),
    route: {
      id: product.route_id,
      name: product.route_name
    }
  }));

  res.json({
    success: true,
    data: {
      products: formattedProducts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = db.prepare(`
    SELECT 
      p.*,
      r.name as route_name,
      s.name as current_station_name,
      s.owner as current_station_owner
    FROM products p
    LEFT JOIN routes r ON p.route_id = r.id
    LEFT JOIN stations s ON p.current_station_id = s.id
    WHERE p.id = ?
  `).get(id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Get station history
  const history = db.prepare(`
    SELECT 
      sh.*,
      s.name as station_name,
      s.owner
    FROM station_history sh
    LEFT JOIN stations s ON sh.station_id = s.id
    WHERE sh.product_id = ?
    ORDER BY sh.start_time ASC
  `).all(id);

  const formattedProduct = {
    id: product.id,
    name: product.name,
    model: product.model,
    currentStation: product.current_station_name || 'Not Started',
    progress: product.progress,
    status: product.status,
    priority: product.priority,
    createdAt: new Date(product.created_at),
    updatedAt: new Date(product.updated_at),
    route: {
      id: product.route_id,
      name: product.route_name
    },
    stationHistory: history.map((h: any) => ({
      id: h.id,
      stationId: h.station_id,
      stationName: h.station_name,
      owner: h.owner,
      startTime: new Date(h.start_time),
      endTime: h.end_time ? new Date(h.end_time) : null,
      status: h.status,
      notes: h.notes,
      formData: h.form_data ? JSON.parse(h.form_data) : {}
    }))
  };

  res.json({
    success: true,
    data: formattedProduct
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, model, route_id, priority = 'medium', notes } = req.body;

  const productId = uuidv4();
  const createdBy = req.user?.id; // Get user ID from authenticated request

  // Get first station of the route
  const firstStation = db.prepare(`
    SELECT s.id, s.name, s.owner
    FROM route_stations rs
    JOIN stations s ON rs.station_id = s.id
    WHERE rs.route_id = ?
    ORDER BY rs.sequence_order ASC
    LIMIT 1
  `).get(route_id);

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, model, route_id, current_station_id, progress, status, priority, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  insertProduct.run(
    productId,
    name,
    model,
    route_id,
    firstStation?.id || null,
    0,
    'normal',
    priority,
    createdBy
  );

  // Create initial station history entry
  if (firstStation) {
    const historyId = uuidv4();
    const insertHistory = db.prepare(`
      INSERT INTO station_history (id, product_id, station_id, station_name, owner, start_time, status, notes, form_data, created_by)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
    `);

    insertHistory.run(
      historyId,
      productId,
      firstStation.id,
      firstStation.name,
      firstStation.owner,
      'pending',
      notes || '',
      '{}',
      createdBy
    );
  }

  // Get the created product
  const createdProduct = db.prepare(`
    SELECT 
      p.*,
      r.name as route_name,
      s.name as current_station_name,
      s.owner as current_station_owner
    FROM products p
    LEFT JOIN routes r ON p.route_id = r.id
    LEFT JOIN stations s ON p.current_station_id = s.id
    WHERE p.id = ?
  `).get(productId);

  const formattedProduct = {
    id: createdProduct.id,
    name: createdProduct.name,
    model: createdProduct.model,
    currentStation: createdProduct.current_station_name || 'Not Started',
    progress: createdProduct.progress,
    status: createdProduct.status,
    priority: createdProduct.priority,
    createdAt: new Date(createdProduct.created_at),
    updatedAt: new Date(createdProduct.updated_at),
    route: {
      id: createdProduct.route_id,
      name: createdProduct.route_name
    }
  };

  res.status(201).json({
    success: true,
    data: formattedProduct
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if product exists
  const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  // Build update query
  const updateFields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    updateFields.push(`${key} = ?`);
    params.push(value);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
  db.prepare(updateQuery).run(...params);

  // Get updated product
  const updatedProduct = db.prepare(`
    SELECT 
      p.*,
      r.name as route_name,
      s.name as current_station_name,
      s.owner as current_station_owner
    FROM products p
    LEFT JOIN routes r ON p.route_id = r.id
    LEFT JOIN stations s ON p.current_station_id = s.id
    WHERE p.id = ?
  `).get(id);

  const formattedProduct = {
    id: updatedProduct.id,
    name: updatedProduct.name,
    model: updatedProduct.model,
    currentStation: updatedProduct.current_station_name || 'Not Started',
    progress: updatedProduct.progress,
    status: updatedProduct.status,
    priority: updatedProduct.priority,
    createdAt: new Date(updatedProduct.created_at),
    updatedAt: new Date(updatedProduct.updated_at),
    route: {
      id: updatedProduct.route_id,
      name: updatedProduct.route_name
    }
  };

  res.json({
    success: true,
    data: formattedProduct
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProduct = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  // Delete related records first
  db.prepare('DELETE FROM station_history WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM field_data WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
};

export const bulkUpdateProducts = async (req: Request, res: Response) => {
  const { product_ids, updates } = req.body;

  // Build update query
  const updateFields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    updateFields.push(`${key} = ?`);
    params.push(value);
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  const placeholders = product_ids.map(() => '?').join(',');
  const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id IN (${placeholders})`;
  
  const result = db.prepare(updateQuery).run(...params, ...product_ids);

  res.json({
    success: true,
    data: {
      updated_count: result.changes
    }
  });
};