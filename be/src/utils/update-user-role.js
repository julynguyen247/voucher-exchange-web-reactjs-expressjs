/**
 * Utility script to update a user's role in the database
 * 
 * Usage:
 * node update-user-role.js <email> <role>
 * 
 * Example:
 * node update-user-role.js vngbthi@gmail.com ADMIN
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user');

async function updateUserRole(email, role) {
  try {
    // Connect to MongoDB with fallbacks
    let dbUrl = process.env.MONGO_DB_URL;
    
    if (!dbUrl) {
      console.log('MONGO_DB_URL environment variable is not defined, checking alternatives...');
      
      // Thử các url thay thế thường được sử dụng
      if (process.env.MONGODB_URI) {
        dbUrl = process.env.MONGODB_URI;
        console.log('Using MONGODB_URI instead');
      } else if (process.env.DB_URI) {
        dbUrl = process.env.DB_URI;
        console.log('Using DB_URI instead');
      } else {
        // Hard-coded backup default nếu cần
        dbUrl = 'mongodb://localhost:27017/voucher-exchange';
        console.log(`No database URL found in environment. Using default: ${dbUrl}`);
      }
    }
    
    console.log(`Connecting to database: ${dbUrl.replace(/:\/\/.*@/, '://*****@')}`); // Hide credentials in logs
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Update user role
    console.log(`Updating user ${email} role from ${user.role || 'none'} to ${role}`);
    user.role = role;
    await user.save();
    
    console.log(`User ${email} role updated successfully to ${role}`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node update-user-role.js <email> <role>');
  process.exit(1);
}

const [email, role] = args;
updateUserRole(email, role);
