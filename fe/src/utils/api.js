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
const registerApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
  };
  return axios.post(URL_API, data);
};
const fetchAccountApi = () => {
  const URL_API = "/v1/api/account-fetch";
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
const createVoucher = (voucherData) => {
  const URL_API = "/v1/api/voucher"; 
  return axios.post(URL_API, voucherData);
};
const getVoucher=()=>{
  const URL_API = "/v1/api/voucher"; 
  return axios.get(URL_API)
}
const logoutApi=()=>{
  const URL_API = "/v1/api/logout"; 
  return axios.post(URL_API)
}
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
export {
  createUserApi,
  loginApi,
  fetchAccountApi,
  registerApi,
  getVoucherCategory,
  getVoucherPlatform,
  createVoucher,
  getVoucher,logoutApi,uploadApi
};
