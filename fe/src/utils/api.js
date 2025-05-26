import axios from "./apiCustomize";
const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
  };
  return axios.post(URL_API, data);
};
const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email,
    password,
  };
  return axios.post(URL_API, data);
};
const registerApi = (name, email, password, phone, image) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
    phone,
    image,
  };
  return axios.post(URL_API, data);
};
// Cache the account API fetch to prevent excessive calls
let accountApiCache = null;
let accountApiLastFetch = 0;
let pendingFetchPromise = null;
const ACCOUNT_API_CACHE_DURATION = 300000; // 5 minutes - increased from 60 seconds

// Track API call counts to detect potential issues
const apiCallCounts = {
  total: 0,
  byHour: {},
  lastHourFlushed: 0,
};

// Function to update API call statistics
const trackApiCall = () => {
  apiCallCounts.total++;

  // Track by hour for debugging
  const now = new Date();
  const hourKey = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()}-${now.getHours()}`;

  apiCallCounts.byHour[hourKey] = (apiCallCounts.byHour[hourKey] || 0) + 1;

  // Flush old hour data occasionally to prevent memory bloat
  if (now.getTime() - apiCallCounts.lastHourFlushed > 3600000) {
    // 1 hour
    const keysToKeep = Object.keys(apiCallCounts.byHour).sort().slice(-24); // Keep last 24 hours
    const newByHour = {};
    keysToKeep.forEach((k) => (newByHour[k] = apiCallCounts.byHour[k]));
    apiCallCounts.byHour = newByHour;
    apiCallCounts.lastHourFlushed = now.getTime();
  }
};

const fetchAccountApi = () => {
  const URL_API = "/v1/api/account";

  // Return a promise that resolves with cached data if available and recent
  return new Promise((resolve, reject) => {
    const now = Date.now();

    // Use cached data if it exists and is recent
    if (
      accountApiCache &&
      now - accountApiLastFetch < ACCOUNT_API_CACHE_DURATION
    ) {
      resolve(accountApiCache);
      return;
    }
    // If there's already a pending request, return that promise
    // This prevents multiple simultaneous API calls
    if (pendingFetchPromise) {
      return pendingFetchPromise;
    }

    // Otherwise, make the API call
    console.log("Making fresh account API call");
    trackApiCall();

    pendingFetchPromise = axios
      .get(URL_API)
      .then((response) => {
        // Update cache
        accountApiCache = response;
        accountApiLastFetch = now;
        pendingFetchPromise = null; // Clear the pending promise
        resolve(response);
        return response; // Important for the returned promise chain
      })
      .catch((error) => {
        pendingFetchPromise = null; // Clear the pending promise on error
        reject(error);
        throw error; // Re-throw for the promise chain
      });
    return pendingFetchPromise;
  });
};
const getVoucherCategory = () => {
  const URL_API = "/v1/api/voucher/category";
  return axios.get(URL_API);
};
const getVoucherPlatform = () => {
  const URL_API = "/v1/api/voucher/platform";
  return axios.get(URL_API);
};
const createVoucher = (
  minimumOrder,
  platform,
  category,
  code,
  image,
  discountValue,
  expirationDate,
  price
) => {
  const URL_API = "/v1/api/voucher";

  expirationDate = expirationDate.format("YYYY-MM-DD");

  return axios.post(URL_API, {
    minimumOrder,
    platform,
    category,
    image,
    code,
    discountValue,
    expirationDate,
    price,
  });
};

const getVoucher = () => {
  const URL_API = "/v1/api/voucher";
  return axios.get(URL_API);
};
const logoutApi = () => {
  const URL_API = "/v1/api/logout";
  return axios.post(URL_API);
};
const uploadApi = (file, folder) => {
  const URL_API = "/v1/api/image";
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);

  return axios.post(URL_API, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
const updateUserApi = (id, name, email, password, phone, image) => {
  const URL_API = "/v1/api/user";
  return axios.put(URL_API, { id, name, email, password, phone, image });
};
const getTransactions = () => {
  const URL_API = `/v1/api/transaction/get`;
  return axios.get(URL_API);
};
const processTransaction = (transactionData) => {
  const URL_API = "/v1/api/transaction/process";
  return axios.post(URL_API, transactionData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
const getSellerPaymentDetails = (voucherId, bank) => {
  const URL_API = `/v1/api/seller-payment-details`;
  return axios.get(URL_API, {
    params: {
      voucherId,
      bank,
    },
  });
};
const getBank = () => {
  const URL_API = `/v1/api/bank`;
  return axios.get(URL_API);
};
const addToFavoriteApi = (userId, voucherId) => {
  const URL_API = "/v1/api/favorites";
  const data = { userId, voucherId };

  return axios.post(URL_API, data);
};
const getFavoritesApi = (userId) => {
  return axios.get(`/v1/api/favorites/${userId}`);
};
const removeFavoriteApi = (userId, voucherId) => {
  return axios.delete("/v1/api/favorites", {
    data: { userId, voucherId },
  });
};

// ============ ADMIN API ============
// Admin Users API
const getAllUsersApi = (limit = 10, page = 1, filters = {}) => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API, {
    params: { limit, page, ...filters },
  });
};

const deleteUserApi = (userId) => {
  const URL_API = "/v1/api/user";
  return axios.delete(URL_API, { data: { id: userId } });
};

const updateAdminUserApi = (userId, userData) => {
  const URL_API = "/v1/api/user";
  return axios.put(URL_API, { id: userId, ...userData });
};

// Admin Vouchers API
const getAllVouchersApi = (limit = 10, page = 1, filters = {}) => {
  const URL_API = "/v1/api/voucher";
  return axios.get(URL_API, {
    params: { limit, page, ...filters, admin: true },
  });
};

const deleteVoucherApi = (voucherId) => {
  const URL_API = "/v1/api/voucher";
  return axios.delete(URL_API, { data: { id: voucherId } });
};

// Admin Transactions API
const getAllTransactionsApi = (limit = 10, page = 1, filters = {}) => {
  const URL_API = "/v1/api/transaction/get";
  return axios.get(URL_API, {
    params: { limit, page, ...filters, admin: true },
  });
};

// Admin Statistics API
const getDashboardStatsApi = () => {
  const URL_API = "/v1/api/admin/stats";
  return axios.get(URL_API);
};

//rating API
const ratingApi = {
  getUsers: async (page = 1, limit = 20) => {
    const API_URL = "/v1/api/user/ratings";
    const response = await axios.get(API_URL, {
      params: { page, limit }
    });
    return response.data;
  },
  
  rateUser: async (userId, star) => {
    const API_URL = `/v1/api/user/${userId}/rating`;
    const response = await axios.post(API_URL, { star });
    return response.data;
  }
};


export {
  createUserApi,
  loginApi,
  fetchAccountApi,
  registerApi,
  getVoucherCategory,
  getVoucherPlatform,
  createVoucher,
  getVoucher,
  logoutApi,
  uploadApi,
  updateUserApi,
  getTransactions,
  processTransaction,
  getSellerPaymentDetails,
  getBank,
  addToFavoriteApi,
  getFavoritesApi,
  removeFavoriteApi,
  getAllUsersApi,
  deleteUserApi,
  updateAdminUserApi,
  getAllVouchersApi,
  deleteVoucherApi,
  getAllTransactionsApi,
  getDashboardStatsApi,
  ratingApi,
};
