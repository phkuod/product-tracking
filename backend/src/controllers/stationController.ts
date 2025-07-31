import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const getStations = async (req: Request, res: Response) => {
  const stations = db.prepare(`
    SELECT * FROM stations 
    WHERE is_active = 1
    ORDER BY name
  `).all();

  const formattedStations = stations.map((station: any) => {
    // Get fields for this station
    const fields = db.prepare(`
      SELECT * FROM fields 
      WHERE station_id = ?
      ORDER BY created_at
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
        required: field.is_required === 1,
        options: field.options ? JSON.parse(field.options) : undefined,
        defaultValue: field.default_value,
        validationRules: field.validation_rules ? JSON.parse(field.validation_rules) : undefined
      })),
      isActive: station.is_active === 1,
      createdAt: new Date(station.created_at),
      updatedAt: new Date(station.updated_at)
    };
  });

  res.json({
    success: true,
    data: formattedStations
  });
};

export const getStation = async (req: Request, res: Response) => {
  const { id } = req.params;

  const station = db.prepare(`
    SELECT * FROM stations WHERE id = ? AND is_active = 1
  `).get(id);

  if (!station) {
    throw new NotFoundError('Station not found');
  }

  // Get fields for this station
  const fields = db.prepare(`
    SELECT * FROM fields 
    WHERE station_id = ?
    ORDER BY created_at
  `).all(id);

  const formattedStation = {
    id: station.id,
    name: station.name,
    owner: station.owner,
    completionRule: station.completion_rule,
    estimatedDuration: station.estimated_duration,
    fields: fields.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.is_required === 1,
      options: field.options ? JSON.parse(field.options) : undefined,
      defaultValue: field.default_value,
      validationRules: field.validation_rules ? JSON.parse(field.validation_rules) : undefined
    })),
    isActive: station.is_active === 1,
    createdAt: new Date(station.created_at),
    updatedAt: new Date(station.updated_at)
  };

  res.json({
    success: true,
    data: formattedStation
  });
};