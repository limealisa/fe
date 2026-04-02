/* eslint-disable import/no-anonymous-default-export */
import { API_GATE } from "@/constant/gate";
import { authInstance, contentInstance } from "@/configs/CustomizeAxios";
import { ConfigAuthEndPoint, ConfigMailBoxEndPoint } from "./contants";
import querystring from "querystring";


// Đăng nhập - BC88BET style (chỉ username, password, captcha)
const signin = (username: string, password: string) => {
  return authInstance.post("/auth/login", {
    username,
    password,
    captcha: "123", // BC88BET sử dụng captcha cố định
  });
};

// Đăng ký - BC88BET style (không có captcha, gate, referral, withdrawPassword)
const signupUser = (
  name: string,
  username: string,
  password: string,
  email: string,
  phone: string
) => {
  return authInstance.post("/auth/register", {
    name,
    username,
    phone,
    email,
    password,
  });
};

// Đăng ký với refcode - BC88BET style
const signupUserRe = (
  name: string,
  username: string,
  password: string,
  email: string,
  phone: string,
  refcode: string | null
) => {
  return authInstance.post("/auth/register", {
    name,
    username,
    phone,
    email,
    password,
    refcode,
  });
};

const me = async () => {
  try {
    const res = await contentInstance.get(ConfigAuthEndPoint.ME);
    // BC88BET response format: { code: 200, user: {...} } hoặc { user: {...} }
    return res;
  } catch (error: any) {
    // Nếu 404, có thể endpoint không tồn tại - return null
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await contentInstance.post(ConfigAuthEndPoint.CHANGE_PASSSWORD, data);
  return res?.data;
};

const getWithdrawalCondition = async () => {
  const res = await contentInstance.get(ConfigAuthEndPoint.WITH_DRAWAL_CONDITION);
  return res?.data?.data;
};

const updateUserInfo = async (data: { name: string }) => {
  const res = await contentInstance.post(ConfigAuthEndPoint.UPDATE_USER_INFO, data);
  return res?.data;
};

const updateWithdrawPassword = async (data: {
  oldWithdrawPassword: string;
  newWithdrawPassword: string;
}) => {
  const res = await contentInstance.post(ConfigAuthEndPoint.UPDATE_WITHDRAWAL_PASSWORD, data);
  return res?.data;
};

const getMailBoxes = async (data: {
  page: number;
  size: number;
  mailTypes: string[];
}) => {
  const queryString = querystring.encode(data);
  const res = await contentInstance.get(`${ConfigMailBoxEndPoint.MY_MAIL}?${queryString}`);
  return res?.data;
};


// BC88BET style: Lấy balance từ /api/auth/me thay vì /auth/getBalance
export const getBalance = async () => {
  try {
    // Kiểm tra token trước khi gọi API
    const { getToken } = await import("@/configs/client-store");
    const token = getToken();
    if (!token) {
      return 0; // Không có token thì không cần gọi API
    }

    const res: any = await contentInstance.get(ConfigAuthEndPoint.ME);
    
    // BC88BET response format: { code: 200, user: {...} } hoặc { user: {...} }
    if (res?.code === 200 && res?.user) {
      return res.user.balance || res.user.coin || 0;
    }
    
    // Fallback: nếu không có code, thử lấy user trực tiếp
    const userData = res?.user || res?.data?.user || res;
    return userData?.balance || userData?.coin || 0;
  } catch (error: any) {
    // Suppress tất cả error logging cho getBalance
    return 0;
  }
};

export default {
  signin,
  signupUser,
  signupUserRe,
  me,
  changePassword,
  getWithdrawalCondition,
  updateWithdrawPassword,
  updateUserInfo,
  getMailBoxes,
};
