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
const fetchAccountApi = () => {
  const URL_API = "/v1/api/account";
  return axios.get(URL_API);
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
    params: { limit, page, ...filters }
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
    params: { limit, page, ...filters, admin: true }
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
    params: { limit, page, ...filters, admin: true }
  });
};

// Admin Statistics API
const getDashboardStatsApi = () => {
  const URL_API = "/v1/api/admin/stats";
  return axios.get(URL_API);
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
  getDashboardStatsApi
};
