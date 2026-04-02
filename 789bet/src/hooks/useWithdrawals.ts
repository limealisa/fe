/**
 * useWithdrawals Hook - Tự động rút tiền từ tất cả ví game về ví chính
 * Tương tự BC88BET: Rút tiền từ tất cả ví game khi được gọi
 */

import { useState } from "react";
import { GameConfig } from "@/config/GameConfig";
import walletService from "@/api/services/wallet.service";
import swal from "sweetalert2";

/**
 * Hook để rút tiền từ tất cả ví game về ví chính
 * Tương tự BC88BET useWithdrawals
 * 
 * @returns Object với function withdrawals và loading state
 */
export default function useWithdrawals() {
  const [loading, setLoading] = useState(false);

  const withdrawals = async (showNotification: boolean = true) => {
    if (loading) return; // Tránh gọi nhiều lần cùng lúc
    
    setLoading(true);
    try {
      let totalWithdrawn = 0;
      let successCount = 0;
      let errorCount = 0;

      // BC88BET style: xử lý song song và chỉ rút nếu status = true và balance > 0
      const withdrawalPromises = GameConfig.map(async (item) => {
        try {
          const WalletUser: any = await walletService.getWalletGameByUser(item.code);
          // BC88BET kiểm tra status === true và balance > 0
          if (WalletUser?.status === true && WalletUser.balance > 0) {
            await walletService.walletTransfer(
              WalletUser.balance,
              item.type,
              2 // transferType: 2 = ví game → ví chính
            );
            totalWithdrawn += WalletUser.balance;
            successCount++;
          }
        } catch (error: any) {
          // Không log lỗi 404 (game wallet chưa được tạo là bình thường)
          const errorStatus = error?.response?.status;
          if (errorStatus !== 404) {
            console.error(`Error withdrawing from ${item.code}:`, error);
            errorCount++;
          }
        }
      });

      // Đợi tất cả promise hoàn thành (kể cả lỗi)
      await Promise.allSettled(withdrawalPromises);

      // Đợi một chút để server xử lý xong trước khi refresh balance
      if (successCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Hiển thị thông báo nếu có
      if (showNotification) {
        if (successCount > 0) {
          swal.fire({
            title: "Chuyển quỹ thành công",
            text: `Đã chuyển ${totalWithdrawn.toLocaleString('vi-VN')} VND từ ${successCount} ví game về ví chính`,
            icon: "success",
            confirmButtonText: "OK"
          });
        } else if (errorCount > 0) {
          swal.fire({
            title: "Chuyển quỹ thất bại",
            text: "Có lỗi xảy ra khi chuyển quỹ. Vui lòng thử lại.",
            icon: "error",
            confirmButtonText: "OK"
          });
        } else {
          swal.fire({
            title: "Không có quỹ để chuyển",
            text: "Tất cả ví game đều không có số dư",
            icon: "info",
            confirmButtonText: "OK"
          });
        }
      }

      return { successCount, totalWithdrawn, errorCount };
    } catch (error) {
      console.error("Withdrawals error:", error);
      if (showNotification) {
        swal.fire({
          title: "Lỗi",
          text: "Có lỗi xảy ra khi chuyển quỹ",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { withdrawals, loading };
}

