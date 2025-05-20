const jwt = require("jsonwebtoken");
require("dotenv").config();

// In-memory token validation cache to reduce repeated JWT verifications
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL (increased from 10 minutes)

// Cache metrics
const authMetrics = {
  total: 0,
  cacheHits: 0,
  cacheMisses: 0,
  publicEndpoints: 0,
  lastReported: Date.now()
};

// Cleanup old tokens to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let removed = 0;
  
  tokenCache.forEach((value, key) => {
    if (value.timestamp < now - TOKEN_CACHE_TTL) {
      tokenCache.delete(key);
      removed++;
    }
  });
  
  if (removed > 0) {
    console.log(`Auth cache cleanup: removed ${removed} expired tokens`);
  }
}, 3600000); // Clean up every hour

const auth = (req, res, next) => {
  authMetrics.total++;
  
  // Report metrics every hour
  if (Date.now() - authMetrics.lastReported > 3600000) {
    console.log(`Auth Metrics: ${authMetrics.total} total, ${authMetrics.cacheHits} cache hits (${Math.round(authMetrics.cacheHits/authMetrics.total*100)}%), ${authMetrics.cacheMisses} cache misses (${Math.round(authMetrics.cacheMisses/authMetrics.total*100)}%), ${authMetrics.publicEndpoints} public endpoint calls`);
    authMetrics.lastReported = Date.now();
  }

  const white_lists = [
    "/login",
    "/register",
    "/",
    "/logout",
    "/image",
    "/voucher",
  ];
  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    authMetrics.publicEndpoints++;
    next();
  } else {
    if (req.header && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        // Prevent repeated token verifications for the same request
        // Use a request-scoped cache
        if (!req._cachedToken) {
          req._cachedToken = {};
        }
        
        if (req._cachedToken.token === token && req._cachedToken.decoded) {
          req.user = req._cachedToken.decoded;
          return next();
        }
        
        // Check if this token has been validated before in the global cache
        const cachedData = tokenCache.get(token);
        let decoded;
        
        if (cachedData && cachedData.timestamp > Date.now() - TOKEN_CACHE_TTL) {
          // Use cached token verification data
          decoded = cachedData.decoded;
          authMetrics.cacheHits++;
        } else {
          // Verify token and cache the result
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          authMetrics.cacheMisses++;
          
          // Store decoded token in cache
          tokenCache.set(token, {
            decoded,
            timestamp: Date.now()
          });
          
          // Log only for new sessions
          const sessionKey = decoded.id || decoded.email;
          if (!global._loggedAuthSessions) {
            global._loggedAuthSessions = new Set();
          }
          
          if (!global._loggedAuthSessions.has(sessionKey)) {
            console.log("JWT decoded token for new session:", {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role || "user"
            });
            global._loggedAuthSessions.add(sessionKey);
          }
        }
        
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || "user",
        };
        
        // Cache in request scope to avoid repeated verification for the same request
        // across different middleware
        req._cachedToken = {
          token,
          decoded: req.user
        };
        
        next();
      } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({
          message: "Token hết hạn hoặc token không hợp lệ ",
        });
      }
    } else {
      return res.status(401).json({
        message: "Bạn chưa truyền token hoặc token không hợp lệ ",
      });
    }
  }
};
module.exports = auth;
