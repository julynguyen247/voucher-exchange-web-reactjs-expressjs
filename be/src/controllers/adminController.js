const User = require("../models/user");
const Voucher = require("../models/voucher");
const Transaction = require("../models/transaction");

// Middleware kiểm tra quyền Admin
const isAdmin = async (req, res, next) => {
  try {
    // Lấy thông tin người dùng từ middleware auth trước đó
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    console.log(`Checking admin permissions for user: ${user?.email}, role: ${user?.role}`);
    
    // Kiểm tra quyền admin thông qua email hoặc role
    // 1. Email mặc định admin@voucher-exchange.com
    // 2. Trường role = "ADMIN" hoặc "admin"
    if (!user || (user.email !== "admin@voucher-exchange.com" && 
                 user.role?.toLowerCase() !== "admin")) {
      console.log(`Access denied. User ${user?.email} has role ${user?.role}`);
      return res.status(403).json({
        EC: 1,
        message: "Không có quyền truy cập. Chỉ admin mới có thể thực hiện chức năng này.",
      });
    }
    
    console.log(`Admin access granted for user: ${user.email}`);
    next();
  } catch (error) {
    console.error("Lỗi kiểm tra quyền admin:", error);
    return res.status(500).json({
      EC: 1,
      message: "Có lỗi xảy ra khi xác thực quyền admin.",
    });
  }
};

// API thống kê cho Dashboard
const getDashboardStats = async (req, res) => {
  try {
    console.log("Dashboard stats API called by:", req.user?.email, req.user?.role);
    
    // Parse date range if provided in query parameters
    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
      // Set endDate to end of day
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to last 30 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Setup for calculating previous period comparisons
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let stats = {
      userStats: { 
        total: 0, 
        newUsers: 0, 
        growth: 0 
      },
      voucherStats: { 
        total: 0, 
        sold: 0, 
        available: 0 
      },
      transactionStats: { 
        total: 0, 
        periodCount: 0,
        growth: 0 
      },
      revenueStats: { 
        total: 0, 
        periodTotal: 0,
        growth: 0,
        monthly: [] 
      },
      platformStats: [],
      categoryStats: []
    };
    
    try {
      // Get total users
      stats.userStats.total = await User.countDocuments();
      
      // Get new users in the selected period
      stats.userStats.newUsers = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // Calculate user growth (comparing to previous period)
      const previousPeriodUsers = await User.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      });
      
      if (previousPeriodUsers > 0) {
        stats.userStats.growth = ((stats.userStats.newUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1);
      } else {
        stats.userStats.growth = stats.userStats.newUsers > 0 ? 100 : 0;
      }
    } catch (userError) {
      console.error("Lỗi khi đếm người dùng:", userError);
    }
    
    try {
      // Get voucher information
      stats.voucherStats.total = await Voucher.countDocuments();
      stats.voucherStats.sold = await Voucher.countDocuments({ status: "Sold" });
      stats.voucherStats.available = stats.voucherStats.total - stats.voucherStats.sold;
    } catch (voucherError) {
      console.error("Lỗi khi đếm vouchers:", voucherError);
    }
    
    try {
      // Get transaction information
      stats.transactionStats.total = await Transaction.countDocuments();
      
      // Get transactions in the selected period
      const periodTransactions = await Transaction.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      stats.transactionStats.periodCount = periodTransactions.length;
      
      // Calculate transaction growth (comparing to previous period)
      const previousPeriodTransactions = await Transaction.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      });
      
      if (previousPeriodTransactions > 0) {
        stats.transactionStats.growth = ((stats.transactionStats.periodCount - previousPeriodTransactions) / previousPeriodTransactions * 100).toFixed(1);
      } else {
        stats.transactionStats.growth = stats.transactionStats.periodCount > 0 ? 100 : 0;
      }
      
      // Calculate total revenue
      const allTransactions = await Transaction.find();
      stats.revenueStats.total = allTransactions.reduce(
        (sum, transaction) => sum + (transaction.amount || 0), 
        0
      );
      
      // Calculate revenue for the selected period
      stats.revenueStats.periodTotal = periodTransactions.reduce(
        (sum, transaction) => sum + (transaction.amount || 0),
        0
      );
      
      // Calculate revenue growth (comparing to previous period)
      const previousPeriodRevenueTransactions = await Transaction.find({
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      });
      
      const previousPeriodRevenue = previousPeriodRevenueTransactions.reduce(
        (sum, transaction) => sum + (transaction.amount || 0),
        0
      );
      
      if (previousPeriodRevenue > 0) {
        stats.revenueStats.growth = ((stats.revenueStats.periodTotal - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1);
      } else {
        stats.revenueStats.growth = stats.revenueStats.periodTotal > 0 ? 100 : 0;
      }

      // Generate monthly revenue for the current year
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = [];
      
      for (let month = 0; month < 12; month++) {
        const monthStartDate = new Date(currentYear, month, 1);
        const monthEndDate = new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
        
        try {
          const monthTransactions = await Transaction.find({
            createdAt: { $gte: monthStartDate, $lte: monthEndDate }
          });
          
          const revenue = monthTransactions.reduce(
            (sum, transaction) => sum + (transaction.amount || 0),
            0
          );
          
          monthlyRevenue.push({
            month: `Tháng ${month + 1}`,
            sales: revenue
          });
        } catch (error) {
          console.error(`Lỗi khi tính doanh thu tháng ${month + 1}:`, error);
          monthlyRevenue.push({
            month: `Tháng ${month + 1}`,
            sales: 0
          });
        }
      }
      
      stats.revenueStats.monthly = monthlyRevenue;
    } catch (transError) {
      console.error("Lỗi khi đếm giao dịch:", transError);
      
      // Create dummy data for the chart
      stats.revenueStats.monthly = Array.from({length: 12}, (_, i) => ({
        month: `Tháng ${i + 1}`,
        sales: 0
      }));
    }
    
    try {
      // Voucher statistics by platform
      const vouchersByPlatform = await Voucher.aggregate([
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 }
          }
        }
      ]);
      
      stats.platformStats = vouchersByPlatform.map(item => ({
        type: item._id || 'Không xác định',
        value: item.count
      }));
    } catch (platformError) {
      console.error("Lỗi khi thống kê voucher theo nền tảng:", platformError);
      stats.platformStats = [
        { type: "Không xác định", value: 0 }
      ];
    }
    
    try {
      // Voucher statistics by category
      const vouchersByCategory = await Voucher.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        }
      ]);
      
      stats.categoryStats = vouchersByCategory.map(item => ({
        type: item._id || 'Không xác định',
        value: item.count
      }));
    } catch (categoryError) {
      console.error("Lỗi khi thống kê voucher theo danh mục:", categoryError);
      stats.categoryStats = [
        { type: "Không xác định", value: 0 }
      ];
    }
    
    // Log the stats we're about to return
    console.log("Returning dashboard stats:", JSON.stringify(stats, null, 2));
    
    // Return results
    return res.status(200).json({
      EC: 0,
      data: stats || {},
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    
    // Return dummy data to prevent dashboard errors
    return res.status(200).json({
      EC: 1,
      message: "Lỗi khi lấy dữ liệu dashboard: " + error.message,
      data: {
        userStats: { total: 0, newUsers: 0, growth: 0 },
        voucherStats: { total: 0, sold: 0, available: 0 },
        transactionStats: { total: 0, periodCount: 0, growth: 0 },
        revenueStats: { total: 0, periodTotal: 0, growth: 0, monthly: [] },
        platformStats: [],
        categoryStats: []
      }
    });
  }
};

// Cập nhật quyền người dùng (đặt người dùng làm admin)
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        EC: 1,
        message: "Thiếu thông tin: userId"
      });
    }
    
    // Mặc định đặt vai trò là "ADMIN" nếu không được cung cấp
    const newRole = role || "ADMIN";
    
    console.log(`Updating user ${userId} role to ${newRole}`);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        EC: 1,
        message: "Không tìm thấy người dùng"
      });
    }
    
    // Cập nhật vai trò người dùng
    user.role = newRole;
    await user.save();
    
    console.log(`Successfully updated user ${user.email} to role ${newRole}`);
    
    return res.status(200).json({
      EC: 0,
      message: `Đã cập nhật vai trò của người dùng thành ${newRole}`,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vai trò người dùng:", error);
    return res.status(500).json({
      EC: 1,
      message: "Lỗi server khi cập nhật vai trò người dùng",
      error: error.message
    });
  }
};

// API kiểm tra vai trò người dùng theo email (debug)
const checkUserRole = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        EC: 1,
        message: "Thiếu thông tin: email"
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        EC: 1,
        message: "Không tìm thấy người dùng"
      });
    }
    
    return res.status(200).json({
      EC: 0,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra vai trò người dùng:", error);
    return res.status(500).json({
      EC: 1,
      message: "Lỗi server khi kiểm tra vai trò người dùng",
      error: error.message
    });
  }
};

module.exports = {
  isAdmin,
  getDashboardStats,
  updateUserRole,
  checkUserRole
};
