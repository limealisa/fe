import { config } from "@fortawesome/fontawesome-svg-core";
/* eslint-disable import/no-anonymous-default-export */
import { contentInstance, contentCFInstance } from "@/configs/CustomizeAxios";
import { ConfigPaymentEndPoint } from "../services/contants";
import { PaymentHistoryReq } from "../types/payment.interface";

const getListPaymentType = async () => {
  const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_PAYMENT_TYPE);
  return response?.data?.data;
};

const getListBankIn = async () => {
  const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_BANK_IN);
  return response?.data?.data;
};

const getListBankOut = async () => {
  const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_BANK_OUT);
  return response?.data?.data;
};

const getBankRequest = async (bankCode: string, amount: string) => {
  const response = await contentInstance.get(`${ConfigPaymentEndPoint.BANK_REQUEST}?bankCode=${bankCode}&amount=${amount}`);
  return response?.data;
};

const getMomoRequest = async (amount: string) => {
  const response = await contentInstance.get(`${ConfigPaymentEndPoint.MOMO_REQUEST}?amount=${amount}`);
  return response?.data;
};

const getCardRequest = ({
  cardNumber,
  serialNumber,
  cardValue,
  telco,
}: {
  cardNumber: number;
  serialNumber: number;
  cardValue: number;
  telco: number;
}) =>
  contentInstance.get(`${ConfigPaymentEndPoint.CARD_REQUEST}?cardNumber=${cardNumber}&serialNumber=${serialNumber}&cardValue=${cardValue}&telco=${telco}`);

const getListCardType = async () => {
  const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_CARD_TYPE);
  return response?.data;
};

const getAllVNBanks = async () => {
  try {
    const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_ALL_BANK_VN);
    console.log("getAllVNBanks raw response:", response);
    console.log("getAllVNBanks response.data:", response?.data);
    
    // Thử nhiều cách truy cập data
    if (Array.isArray(response?.data)) {
      return response.data;
    } else if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    } else if (Array.isArray(response?.data?.data?.data)) {
      return response.data.data.data;
    } else if (response?.data?.data) {
      return response.data.data;
    } else if (response?.data) {
      return response.data;
    }
    
    console.warn("getAllVNBanks: Unexpected response structure", response);
    return [];
  } catch (error) {
    console.error("getAllVNBanks error:", error);
    throw error;
  }
};

const getAllBankUser = async () => {
  try {
    const response = await contentInstance.get(ConfigPaymentEndPoint.GET_ALL_BANK_USER);
    console.log("getAllBankUser raw response:", response);
    console.log("getAllBankUser response.data:", response?.data);
    
    // BC88BET response format: response.data có thể là array hoặc object
    let bankUsersArray: any[] = [];
    let balance = 0;
    let userName = "";
    
    if (Array.isArray(response?.data)) {
      // Nếu response.data là array trực tiếp
      bankUsersArray = response.data;
    } else if (response?.data && typeof response.data === 'object') {
      // Nếu response.data là object
      if (Array.isArray(response.data.data)) {
        bankUsersArray = response.data.data;
        balance = response.data.balance || response.data.coin || 0;
        userName = response.data.name || response.data.userName || "";
      } else if (Array.isArray(response.data)) {
        bankUsersArray = response.data;
      } else {
        // Có thể response.data chứa thông tin user
        bankUsersArray = response.data.bankUsers || response.data.banks || [];
        balance = response.data.balance || response.data.coin || 0;
        userName = response.data.name || response.data.userName || "";
      }
    }
    
    // Map dữ liệu từ BC88BET format sang format chuẩn
    // BC88BET có: bankProvide, bankNumber, bankName
    // Format chuẩn cần: bankProvider, bankAccountNumber, bankAccountName
    const mappedBankUsers = bankUsersArray.map((bank: any) => ({
      id: bank.id,
      uid: bank.uid,
      bankProvider: bank.bankProvider || bank.bankProvide, // Hỗ trợ cả hai
      bankProvide: bank.bankProvide || bank.bankProvider, // Giữ lại để tương thích
      bankAccountNumber: bank.bankAccountNumber || bank.bankNumber, // Hỗ trợ cả hai
      bankNumber: bank.bankNumber || bank.bankAccountNumber, // Giữ lại để tương thích
      bankAccountName: bank.bankAccountName || bank.bankName, // Hỗ trợ cả hai
      bankName: bank.bankName || bank.bankAccountName, // Giữ lại để tương thích
      bankBranch: bank.bankBranch || bank.branch || "",
    }));
    
    console.log("getAllBankUser - mapped bankUsers:", mappedBankUsers);
    
    return {
      balance,
      bankUsers: mappedBankUsers,
      name: userName,
    };
  } catch (error: any) {
    console.error("getAllBankUser error:", error);
    // Nếu 404 hoặc lỗi, trả về empty thay vì throw error
    if (error?.response?.status === 404) {
      console.warn("getAllBankUser: 404 - User may not have any banks yet");
      return {
        balance: 0,
        bankUsers: [],
        name: "",
      };
    }
    // Với các lỗi khác, vẫn trả về empty để không break UI
    return {
      balance: 0,
      bankUsers: [],
      name: "",
    };
  }
};

const addBankUserInfo = async (data: {
  bankCode: string; // bin code
  bankBranch: string;
  bankAccountName: string; // Tên ngân hàng
  bankAccountNumber: string; // Số tài khoản
}) => {
  // Format data theo BC88BET style: bankProvide, bankName, bankNumber, bankBranch
  // Trong bc88bet: addBankUser(bank.code, bank.code, bankNumber, bank.name)
  const requestData = {
    bankProvide: data.bankCode, // bin code hoặc code
    bankName: data.bankAccountName || data.bankCode, // Tên ngân hàng hoặc code
    bankNumber: data.bankAccountNumber, // Số tài khoản
    bankBranch: data.bankBranch, // Chi nhánh
  };
  
  console.log("addBankUserInfo request data:", requestData);
  const response = await contentInstance.post(ConfigPaymentEndPoint.ADD_BANK_USER_INFO, requestData);
  return response?.data;
};

const bankOutRequest = async (data: {
  amount: number;
  bankUserId?: string | number;
  withdrawPassword: string;
  bankProvide?: string;
  bankName?: string;
  bankNumber?: string;
}) => {
  // Format theo BC88BET: bankProvide, bankName, bankNumber, amount, passwd
  // Nếu có bankUserId, cần lấy thông tin bank từ đó, nhưng BC88BET không dùng bankUserId
  // Nên format trực tiếp với bankProvide, bankName, bankNumber
  const requestData = {
    bankProvide: data.bankProvide || "",
    bankName: data.bankName || "",
    bankNumber: data.bankNumber || "",
    amount: data.amount,
    passwd: data.withdrawPassword,
  };
  
  console.log("bankOutRequest - request data:", requestData);
  const response = await contentInstance.post(ConfigPaymentEndPoint.BANK_OUT_REQUEST, requestData);
  
  // contentInstance interceptor đã trả về data trực tiếp, không cần response.data
  // Nhưng để an toàn, kiểm tra cả hai
  const result = response?.data || response;
  console.log("bankOutRequest - response:", JSON.stringify(result, null, 2));
  return result;
};

const sendCryptoTrx = async (data: { trxId: number; network: string }) => {
  const response = await contentInstance.post(ConfigPaymentEndPoint.SEND_CRYPTO_TRX, data);
  return response?.data;
};

const getUsdtPrice = async () => {
  const response = await contentCFInstance.get(ConfigPaymentEndPoint.GET_USDT_PRICE);
  return response?.data?.data;
};

const getCryptoInfo = async (data: { network: string }) => {
  const response = await contentCFInstance.get(`${ConfigPaymentEndPoint.GET_CRYTO_TO_INFO}?network=${data.network}`);
  return response?.data?.data;
};

// Lấy danh sách ngân hàng tự động (FastPay) - giống bc88bet
const getListAutoBankDeposit = async () => {
  const response = await contentInstance.get(ConfigPaymentEndPoint.LIST_AUTO_BANK_DEPOSIT);
  // Trả về toàn bộ response để component có thể xử lý nhiều format
  return response;
};

// Tạo lệnh nạp tiền tự động (FastPay) - giống bc88bet
const createRequestAutoBank = async (amount: number, bankCode: string) => {
  const response = await contentInstance.post(ConfigPaymentEndPoint.CREATE_REQUEST_AUTO_BANK, {
    amount,
    bankCode,
    subType: bankCode,
  });
  return response?.data;
};

/**
 * BC88BET style: getPaymentHistory
 * Endpoint: /api/payment/history?page={page}&limit={limit}&from={from}&to={to}
 * Response: { dataExport: [...], total: number, page: number, kmess: number }
 */
/**
 * BC88BET style: createRequestManualBank
 * Tạo request nạp tiền thủ công sau khi user đã chuyển tiền
 * Endpoint: /api/payment/createRequestManualBank
 * 
 * @param bank - Mã ngân hàng (bank code)
 * @param nameDeposit - Tên người gửi (từ form hoặc user.username)
 * @param bankDeposit - Ngân hàng người gửi (từ form hoặc user.username)
 * @param numberDeposit - Số tài khoản người gửi (từ form hoặc user.username)
 * @param transIdDeposit - Nội dung chuyển khoản (thường là user.username)
 * @param amountDeposit - Số tiền (đã nhân 1000: 100 → 100.000)
 * @returns Promise<any>
 */
const createRequestManualBank = async (
  bank: string,
  nameDeposit: string,
  bankDeposit: string,
  numberDeposit: string,
  transIdDeposit: string,
  amountDeposit: number
) => {
  const response = await contentInstance.post("/api/payment/createRequestManualBank", {
    bank,
    nameDeposit,
    bankDeposit,
    numberDeposit,
    transIdDeposit,
    amountDeposit,
  });
  return response?.data;
};

const getPaymentHistory = async (data: PaymentHistoryReq) => {
  // Convert dateFrom/dateTo (ISO) sang from/to (BC88BET format: "DD/MM/YYYY HH:mm:ss")
  let from = data.from;
  let to = data.to;
  
  // Nếu có dateFrom/dateTo (legacy), convert sang BC88BET format
  if (!from && data.dateFrom) {
    from = formatDateToBC88BET(data.dateFrom);
  }
  if (!to && data.dateTo) {
    to = formatDateToBC88BET(data.dateTo);
  }
  
  // BC88BET API params
  const params: any = {
    page: data.page,
    limit: data.limit,
    from: from,
    to: to,
  };
  
  // Nếu có type, thêm vào params (nếu BC88BET hỗ trợ)
  if (data.type) {
    params.type = data.type;
  }
  
  console.log("getPaymentHistory - Request params:", params);
  
  const res = await contentInstance.get(ConfigPaymentEndPoint.PAYMENT_HISTORY, { params });
  
  console.log("getPaymentHistory - Raw response:", res);
  
  // BC88BET response format: { dataExport: [...], total: number, page: number, kmess: number }
  // contentInstance interceptor đã trả về data trực tiếp, không cần res.data
  const responseData = res?.data || res;
  
  console.log("getPaymentHistory - Response data:", responseData);
  
  // Convert sang format 789BET nếu cần
  if (responseData) {
    const result = {
      ...responseData,
      data: responseData.dataExport || responseData.data || [], // Support cả dataExport và data
      total: responseData.total || 0,
    };
    
    console.log("getPaymentHistory - Mapped result:", result);
    console.log("getPaymentHistory - Data count:", result.data?.length || 0);
    
    return result;
  }
  
  console.warn("getPaymentHistory - No data in response");
  return {
    data: [],
    total: 0,
  };
};

/**
 * Convert ISO date string sang BC88BET format: "DD/MM/YYYY HH:mm:ss"
 * BC88BET sử dụng UTC+7 (giống formatDateTime của BC88BET)
 */
const formatDateToBC88BET = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    
    // Tính giờ UTC+7 (chênh lệch 7 * 60 phút = 420 phút)
    const utc7Offset = 7 * 60; // phút
    const localOffset = date.getTimezoneOffset(); // phút
    const totalOffset = utc7Offset + localOffset;
    
    const utc7Date = new Date(date.getTime() + totalOffset * 60 * 1000);
    
    const pad = (n: number) => n.toString().padStart(2, "0");
    
    const day = pad(utc7Date.getDate());
    const month = pad(utc7Date.getMonth() + 1);
    const year = utc7Date.getFullYear();
    const hours = pad(utc7Date.getHours());
    const minutes = pad(utc7Date.getMinutes());
    const seconds = pad(utc7Date.getSeconds());
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return isoDate; // Return original nếu lỗi
  }
};

export default {
  getListPaymentType,
  getListBankIn,
  getListBankOut,
  getBankRequest,
  getMomoRequest,
  getCardRequest,
  getListCardType,
  getAllVNBanks,
  addBankUserInfo,
  getAllBankUser,
  bankOutRequest,
  sendCryptoTrx,
  getUsdtPrice,
  getCryptoInfo,
  getPaymentHistory,
  createRequestManualBank,
  getListAutoBankDeposit,
  createRequestAutoBank,
};
