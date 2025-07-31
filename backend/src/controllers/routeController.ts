import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const getRoutes = async (req: Request, res: Response) => {
  const routes = db.prepare(`
    SELECT * FROM routes WHERE is_active = 1 ORDER BY name
  `).all();

  const formattedRoutes = await Promise.all(routes.map(async (route: any) => {
    // Get full station objects for each route
    const stations = db.prepare(`
      SELECT s.id, s.name, s.owner, s.completion_rule, s.estimated_duration
      FROM route_stations rs
      JOIN stations s ON rs.station_id = s.id
      WHERE rs.route_id = ? AND s.is_active = 1
      ORDER BY rs.sequence_order
    `).all(route.id);

    // Get fields for each station
    const stationsWithFields = stations.map((station: any) => {
      const fields = db.prepare(`
        SELECT id, name, type, is_required as required, options, default_value as defaultValue
        FROM fields
        WHERE station_id = ?
        ORDER BY name
      `).all(station.id);

      return {
        id: station.id,
        name: station.name,
        owner: station.owner,
        completionRule: station.completion_rule,
        estimatedDuration: station.estimated_duration,
        fields: fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          required: field.required === 1,
          options: field.options ? JSON.parse(field.options) : undefined,
          defaultValue: field.defaultValue
        }))
      };
    });

    return {
      id: route.id,
      name: route.name,
      description: route.description || '',
      stations: stationsWithFields,
      isActive: route.is_active === 1,
      createdAt: new Date(route.created_at),
      updatedAt: new Date(route.updated_at)
    };
  }));

  res.json({
    success: true,
    data: formattedRoutes
  });
};

export const getRoute = async (req: Request, res: Response) => {
  const { id } = req.params;

  const route = db.prepare(`
    SELECT * FROM routes WHERE id = ? AND is_active = 1
  `).get(id);

  if (!route) {
    throw new NotFoundError('Route not found');
  }

  // Get stations for this route
  const stations = db.prepare(`
    SELECT s.*, rs.sequence_order
    FROM route_stations rs
    JOIN stations s ON rs.station_id = s.id
    WHERE rs.route_id = ?
    ORDER BY rs.sequence_order
  `).all(id);

  const formattedRoute = {
    id: route.id,
    name: route.name,
    description: route.description || '',
    stations: stations.map((station: any) => ({
      id: station.id,
      name: station.name,
      owner: station.owner,
      completionRule: station.completion_rule,
      estimatedDuration: station.estimated_duration,
      orderIndex: station.sequence_order
    })),
    isActive: route.is_active === 1,
    createdAt: new Date(route.created_at),
    updatedAt: new Date(route.updated_at)
  };

  res.json({
    success: true,
    data: formattedRoute
  });
};