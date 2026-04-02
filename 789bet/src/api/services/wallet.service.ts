/**
 * Wallet Service - Quản lý ví chính và ví game
 * Tương tự BC88BET
 */

import { contentInstance } from "@/configs/CustomizeAxios";
import { ConfigWalletEndPoint } from "./contants";

/**
 * Interface cho Wallet Game Response
 */
export interface WalletGameResponse {
  balance: number;
  code?: string;
  [key: string]: any;
}

/**
 * Interface cho Wallet Transfer Request
 */
export interface WalletTransferRequest {
  amount: number;
  type: number;        // Loại game (từ GameConfig.type)
  direction: 1 | 2;    // 1: ví chính → ví game, 2: ví game → ví chính
}

/**
 * Lấy số dư ví game của user theo code provider
 * BC88BET style: sử dụng /api/game/wallets/${code}
 * 
 * @param code - Mã nhà cung cấp (VD: "PG", "JL", "DG")
 * @returns Promise<WalletGameResponse>
 */
export const getWalletGameByUser = async (
  code: string
): Promise<WalletGameResponse> => {
  try {
    // BC88BET style: endpoint là /api/game/wallets/${code}
    const response: any = await contentInstance.get(`/api/game/wallets/${code}`);
    
    // BC88BET response format: { status: true, balance: number } hoặc { status: false, ... }
    const walletData = response?.data || response;
    
    if (walletData?.status === true) {
      return {
        balance: walletData.balance || 0,
        code: code,
        ...walletData,
      };
    }
    
    // Nếu status = false hoặc không có status, trả về balance = 0
    return { balance: 0, code: code };
  } catch (error: any) {
    // Chỉ log error nếu không phải 404 (có thể game wallet chưa được tạo)
    if (error?.response?.status !== 404) {
      console.error(`Error getting wallet for ${code}:`, error?.response?.data || error?.message || error);
    }
    return { balance: 0, code: code };
  }
};

/**
 * Chuyển tiền giữa ví chính và ví game
 * BC88BET style: sử dụng /api/game/wallet-transfer
 * 
 * @param amount - Số tiền cần chuyển
 * @param type - Loại game (từ GameConfig.type) - BC88BET dùng string
 * @param transferType - 1: ví chính → ví game, 2: ví game → ví chính
 * @returns Promise<any>
 */
export const walletTransfer = async (
  amount: number,
  type: number,
  transferType: 1 | 2
): Promise<any> => {
  // BC88BET style: trả về response trực tiếp từ axios, không có .data
  // Giống y hệt bc88bet: return contentInstance.post(...)
  return contentInstance.post(`/api/game/wallet-transfer`, {
    amount,
    type: String(type), // BC88BET yêu cầu type là string
    transferType, // BC88BET dùng transferType thay vì direction
  });
};

/**
 * Lấy số dư tất cả ví game của user
 * 
 * @param codes - Mảng các mã nhà cung cấp
 * @returns Promise<Record<string, WalletGameResponse>>
 */
export const getAllWalletGamesByUser = async (
  codes: string[]
): Promise<Record<string, WalletGameResponse>> => {
  const wallets: Record<string, WalletGameResponse> = {};
  
  // Lấy song song để tối ưu performance
  const promises = codes.map(async (code) => {
    const wallet = await getWalletGameByUser(code);
    wallets[code] = wallet;
  });
  
  await Promise.all(promises);
  return wallets;
};

export default {
  getWalletGameByUser,
  walletTransfer,
  getAllWalletGamesByUser,
};

