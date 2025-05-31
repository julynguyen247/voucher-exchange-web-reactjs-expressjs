
require('dotenv').config();
const mongoose = require('mongoose');

const dbState = [{
    value: 0,
    label: "Disconnected"
},
{
    value: 1,
    label: "Connected"
},
{
    value: 2,
    label: "Connecting"
},
{
    value: 3,
    label: "Disconnecting"
}];


const connection = async () => {
    try {
        // Log MongoDB connection URL for debugging
        console.log(`Connecting to MongoDB: ${process.env.MONGO_DB_URL || 'undefined connection string'}`);
        
        // Thêm timeout và retry options
        await mongoose.connect(process.env.MONGO_DB_URL, {
            serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây
            maxPoolSize: 10, // Tối đa 10 kết nối
        });
        
        const state = Number(mongoose.connection.readyState);
        console.log(dbState.find(f => f.value === state).label, "to database"); // connected to db
        
        // Thêm event handler cho các sự kiện reconnect
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        // Fallback để server có thể khởi động mà không cần DB
        console.log('Warning: Server is running without database connection');
    }
}
module.exports = connection;
