#!/usr/bin/env node

import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedUsers = async () => {
  console.log('🌱 Seeding users...');
  
  const users = [
    {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      department: 'IT'
    },
    {
      id: uuidv4(),
      username: 'manager',
      email: 'manager@example.com',
      password: 'manager123',
      name: 'Production Manager',
      role: 'manager',
      department: 'Production'
    },
    {
      id: uuidv4(),
      username: 'operator1',
      email: 'operator1@example.com',
      password: 'operator123',
      name: 'John Smith',
      role: 'operator',
      department: 'Assembly'
    },
    {
      id: uuidv4(),
      username: 'operator2',
      email: 'operator2@example.com',
      password: 'operator123',
      name: 'Jane Doe',
      role: 'operator',
      department: 'Quality Control'
    }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    
    await db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password_hash, name, role, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [user.id, user.username, user.email, hashedPassword, user.name, user.role, user.department]);
  }

  console.log(`✅ Seeded ${users.length} users`);
  return users;
};

const seedStations = async () => {
  console.log('🌱 Seeding stations...');
  
  const stations = [
    {
      id: uuidv4(),
      name: 'Material Preparation',
      owner: 'John Smith',
      completion_rule: 'all_filled',
      estimated_duration: 30
    },
    {
      id: uuidv4(),
      name: 'Assembly',
      owner: 'Jane Doe',
      completion_rule: 'all_filled',
      estimated_duration: 120
    },
    {
      id: uuidv4(),
      name: 'Quality Control',
      owner: 'Jane Doe',
      completion_rule: 'custom',
      estimated_duration: 45
    },
    {
      id: uuidv4(),
      name: 'Packaging',
      owner: 'John Smith',
      completion_rule: 'all_filled',
      estimated_duration: 20
    },
    {
      id: uuidv4(),
      name: 'Final Inspection',
      owner: 'Production Manager',
      completion_rule: 'custom',
      estimated_duration: 15
    }
  ];

  for (const station of stations) {
    await db.run(`
      INSERT OR IGNORE INTO stations (id, name, owner, completion_rule, estimated_duration)
      VALUES (?, ?, ?, ?, ?)
    `, [station.id, station.name, station.owner, station.completion_rule, station.estimated_duration]);
  }

  console.log(`✅ Seeded ${stations.length} stations`);
  return stations;
};

const seedFields = async (stations: any[]) => {
  console.log('🌱 Seeding station fields...');
  
  const fieldsData = [
    // Material Preparation fields
    {
      station_name: 'Material Preparation',
      fields: [
        { name: 'Material Type', type: 'select', is_required: true, options: ['Steel', 'Aluminum', 'Plastic', 'Composite'] },
        { name: 'Quantity', type: 'number', is_required: true },
        { name: 'Batch Number', type: 'text', is_required: true },
        { name: 'Quality Check', type: 'checkbox', is_required: true }
      ]
    },
    // Assembly fields
    {
      station_name: 'Assembly',
      fields: [
        { name: 'Assembly Instructions', type: 'textarea', is_required: true },
        { name: 'Tools Used', type: 'text', is_required: true },
        { name: 'Assembly Time', type: 'number', is_required: true },
        { name: 'Torque Settings', type: 'text', is_required: false }
      ]
    },
    // Quality Control fields
    {
      station_name: 'Quality Control',
      fields: [
        { name: 'Pass/Fail', type: 'select', is_required: true, options: ['Pass', 'Fail', 'Conditional Pass'] },
        { name: 'Defects Found', type: 'textarea', is_required: false },
        { name: 'Inspector ID', type: 'text', is_required: true },
        { name: 'Test Results', type: 'textarea', is_required: false }
      ]
    },
    // Packaging fields
    {
      station_name: 'Packaging',
      fields: [
        { name: 'Package Type', type: 'select', is_required: true, options: ['Standard', 'Custom', 'Export'] },
        { name: 'Weight', type: 'number', is_required: true },
        { name: 'Dimensions', type: 'text', is_required: true },
        { name: 'Special Instructions', type: 'textarea', is_required: false }
      ]
    },
    // Final Inspection fields
    {
      station_name: 'Final Inspection',
      fields: [
        { name: 'Overall Quality', type: 'select', is_required: true, options: ['Excellent', 'Good', 'Acceptable', 'Poor'] },
        { name: 'Customer Requirements Met', type: 'checkbox', is_required: true },
        { name: 'Final Notes', type: 'textarea', is_required: false }
      ]
    }
  ];

  let totalFields = 0;
  
  for (const stationData of fieldsData) {
    const station = stations.find(s => s.name === stationData.station_name);
    if (!station) continue;

    for (const field of stationData.fields) {
      const fieldId = uuidv4();
      const options = field.options ? JSON.stringify(field.options) : null;
      
      await db.run(`
        INSERT OR IGNORE INTO fields (id, station_id, name, type, is_required, options)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [fieldId, station.id, field.name, field.type, field.is_required, options]);
      
      totalFields++;
    }
  }

  console.log(`✅ Seeded ${totalFields} station fields`);
};

const seedRoutes = async (stations: any[]) => {
  console.log('🌱 Seeding routes...');
  
  const routes = [
    {
      id: uuidv4(),
      name: 'Standard Manufacturing',
      description: 'Standard production route for regular products',
      station_sequence: ['Material Preparation', 'Assembly', 'Quality Control', 'Packaging', 'Final Inspection']
    },
    {
      id: uuidv4(),
      name: 'Express Manufacturing',
      description: 'Fast-track production for urgent orders',
      station_sequence: ['Material Preparation', 'Assembly', 'Final Inspection']
    },
    {
      id: uuidv4(),
      name: 'Custom Manufacturing',
      description: 'Custom production route with additional quality checks',
      station_sequence: ['Material Preparation', 'Assembly', 'Quality Control', 'Quality Control', 'Packaging', 'Final Inspection']
    }
  ];

  for (const route of routes) {
    await db.run(`
      INSERT OR IGNORE INTO routes (id, name, description)
      VALUES (?, ?, ?)
    `, [route.id, route.name, route.description]);

    // Create route-station relationships
    let sequenceOrder = 1;
    for (const stationName of route.station_sequence) {
      const station = stations.find(s => s.name === stationName);
      if (station) {
        const routeStationId = uuidv4();
        await db.run(`
          INSERT OR IGNORE INTO route_stations (id, route_id, station_id, sequence_order)
          VALUES (?, ?, ?, ?)
        `, [routeStationId, route.id, station.id, sequenceOrder]);
        sequenceOrder++;
      }
    }
  }

  console.log(`✅ Seeded ${routes.length} routes`);
  return routes;
};

const seedProducts = async (users: any[], routes: any[], stations: any[]) => {
  console.log('🌱 Seeding products...');
  
  const products = [
    {
      name: 'Widget A-100',
      model: 'WA100',
      route_name: 'Standard Manufacturing',
      priority: 'medium',
      status: 'normal',
      progress: 60
    },
    {
      name: 'Gadget B-200',
      model: 'GB200',
      route_name: 'Express Manufacturing',
      priority: 'high',
      status: 'normal',
      progress: 33
    },
    {
      name: 'Component C-300',
      model: 'CC300',
      route_name: 'Custom Manufacturing',
      priority: 'low',
      status: 'overdue',
      progress: 20
    },
    {
      name: 'Device D-400',
      model: 'DD400',
      route_name: 'Standard Manufacturing',
      priority: 'medium',
      status: 'normal',
      progress: 100
    },
    {
      name: 'Assembly E-500',
      model: 'AE500',
      route_name: 'Standard Manufacturing',
      priority: 'high',
      status: 'normal',
      progress: 80
    }
  ];

  const admin = users.find(u => u.role === 'admin');
  
  for (const product of products) {
    const route = routes.find(r => r.name === product.route_name);
    if (!route) continue;

    const productId = uuidv4();
    
    await db.run(`
      INSERT OR IGNORE INTO products (id, name, model, route_id, progress, status, priority, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [productId, product.name, product.model, route.id, product.progress, product.status, product.priority, admin.id]);
  }

  console.log(`✅ Seeded ${products.length} products`);
};

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await db.connect();
    
    // Run seeds
    const users = await seedUsers();
    const stations = await seedStations();
    await seedFields(stations);
    const routes = await seedRoutes(stations);
    await seedProducts(users, routes, stations);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📋 Default login credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Manager: manager / manager123');
    console.log('  Operator: operator1 / operator123');
    console.log('  Operator: operator2 / operator123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
};

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'run' || !command) {
  runSeed();
} else {
  console.log('🌱 Database Seeding Tool');
  console.log('');
  console.log('Usage: npm run seed [run]');
  console.log('');
  console.log('This will populate the database with initial data including:');
  console.log('- Default users (admin, manager, operators)');
  console.log('- Sample stations and routes');
  console.log('- Demo products');
}