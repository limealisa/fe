/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { useEffect } from "react";
import { contentInstance } from "@/configs/CustomizeAxios";
import { ConfigAuthEndPoint } from "@/api/services/contants";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { QueryClient } from "@tanstack/react-query";
import { clearToken, getTokenFromLocalStorage, setTokenToLocalStorage } from "@/lib/storage/tokenStorage";
import walletService from "@/api/services/wallet.service";
import { GameConfig } from "@/config/GameConfig";
const queryClient = new QueryClient();

type UserContextType = {
  user: null | Record<string, any>;
  loginUser: (userInfo: any, token: string) => void;
  logoutUser: () => void;
  checkTokenInSession: () => Promise<void>;
  isFetching: boolean;
  loadingGame: boolean;
  setLoadingGame: (value: boolean) => void;
  balance: number;
  refreshBalance: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: any) {
  const router = useRouter();
  const [user, setUser] = useState<null | Record<string, any>>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isFetching, setIsFetching] = useState(false);
  const [token, setToken] = useState(() => {
    const storedUser = localStorage.getItem("token");
    return storedUser ? JSON.parse(storedUser).token : null;
  });
  const [firstTime, setFirstTime] = useState(true);
  const [loadingGame, setLoadingGame] = useState(false);
  const [balance, setBalance] = useState(0);
  const [hasAutoWithdrawn, setHasAutoWithdrawn] = useState(false);

  const loginUser = async (userInfo: any, token: string) => {
    setUser(userInfo);
    setTokenToLocalStorage(token);
    setBalance(userInfo?.balance || 0);
    
    // Reset flag để cho phép auto withdrawal chạy lại
    setHasAutoWithdrawn(false);
    
    // Auto withdrawal từ ví game về ví chính (async, không block UI)
    // Sẽ được gọi tự động bởi useEffect khi user state thay đổi
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user"); // Xóa khỏi localStorage nếu user là null
    }
  }, [user]);

  const logoutUser = () => {
    clearToken();
    setUser(null);
    router.push("/");
    queryClient.clear();
  };

  const refreshBalance = async () => {
    const token = await getTokenFromLocalStorage();

    if (token) {
      setIsFetching(true);
      try {
        // BC88BET style: Lấy balance từ /api/auth/me thay vì /auth/getBalance
        const response: any = await contentInstance.get(ConfigAuthEndPoint.ME);
        
        // BC88BET response format: { code: 200, user: {...} } hoặc { user: {...} }
        let userData;
        if (response?.code === 200 && response?.user) {
          userData = response.user;
        } else {
          // Fallback: nếu không có code, thử lấy user trực tiếp
          userData = response?.user || response?.data?.user || response;
        }
        
        const balance = userData?.balance || userData?.coin || 0;
        setBalance(balance);
        
        // Cập nhật user nếu có
        if (userData) {
          setUser({ ...user, ...userData, balance });
        }
      } catch (error: any) {
        // Không log error nếu là 401 hoặc 404 (bình thường khi chưa login hoặc endpoint không tồn tại)
        const status = error?.response?.status;
        if (status !== 401 && status !== 404) {
          // Chỉ log nếu có thông tin error thực sự
          const errorData = error?.response?.data;
          const errorMessage = error?.message;
          if (errorData || (errorMessage && errorMessage !== "Request failed")) {
            console.log("error", errorData || errorMessage || error);
          }
        }
      } finally {
        setIsFetching(false);
      }
    }
  };

  /**
   * Tự động rút tiền từ tất cả ví game về ví chính
   * Tương tự BC88BET - chạy khi user login hoặc checkTokenInSession
   */
  const autoWithdrawalFromGameWallets = async () => {
    try {
      // BC88BET style: xử lý song song và chỉ rút nếu status = true và balance > 0
      const withdrawalPromises = GameConfig.map(async (item) => {
        try {
          const walletUser: any = await walletService.getWalletGameByUser(item.code);
          // BC88BET kiểm tra status === true và balance > 0
          if (walletUser?.status === true && walletUser.balance > 0) {
            await walletService.walletTransfer(walletUser.balance, item.type, 2);
          }
        } catch (error: any) {
          // Không log lỗi 404 (game wallet chưa được tạo là bình thường)
          const errorStatus = error?.response?.status;
          if (errorStatus !== 404) {
            console.error(`Error withdrawing from ${item.code}:`, error);
          }
        }
      });

      // Đợi tất cả promise hoàn thành (kể cả lỗi)
      await Promise.allSettled(withdrawalPromises);
      
      // Đợi một chút để server xử lý xong trước khi refresh balance
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh balance sau khi withdrawal
      await refreshBalance();
    } catch (error) {
      console.error("Auto withdrawal error:", error);
    }
  };

  const checkTokenInSession = async () => {
    // const token = user?.token;
    const token = localStorage.getItem("token");
    setIsFetching(true);
    if (token) {
      await contentInstance
        .get(ConfigAuthEndPoint.ME)
        .then(async (response: any) => {
          // BC88BET response format: { code: 200, user: {...} } hoặc { user: {...} }
          let userData;
          if (response?.code === 200 && response?.user) {
            userData = response.user;
          } else {
            // Fallback: nếu không có code, thử lấy user trực tiếp
            userData = response?.user || response?.data?.user || response;
          }
          
          if (userData) {
            setUser(userData);
            setBalance(userData?.balance || userData?.coin || 0);
            
            // Reset flag để cho phép auto withdrawal chạy lại
            setHasAutoWithdrawn(false);
            
            // Auto withdrawal từ ví game về ví chính sẽ được gọi tự động bởi useEffect
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else {
      setIsFetching(false);
    }
  };

  // BC88BET style: Không sử dụng WebSocket, chỉ refresh balance khi cần
  // Có thể thêm polling để refresh balance định kỳ nếu cần
  useEffect(() => {
    if (token && firstTime) {
      setFirstTime(false);
      // Refresh balance khi có token
      refreshBalance();
    }
  }, [token]);

  // Tự động rút tiền từ tất cả ví game về ví chính khi load lại trang
  // Chạy khi user đã đăng nhập và chưa rút tiền trong session này
  useEffect(() => {
    const performAutoWithdrawal = async () => {
      // Chỉ chạy nếu có user, có token, và chưa rút tiền trong session này
      if (user && token && !hasAutoWithdrawn && !isFetching) {
        setHasAutoWithdrawn(true);
        // Auto withdrawal từ ví game về ví chính (async, không block UI)
        autoWithdrawalFromGameWallets().catch((error) => {
          console.error("Auto withdrawal error on page load:", error);
          // Reset flag nếu có lỗi để có thể thử lại
          setHasAutoWithdrawn(false);
        });
      }
    };

    performAutoWithdrawal();
  }, [user, token, hasAutoWithdrawn, isFetching]);

  // Reset hasAutoWithdrawn khi user logout
  useEffect(() => {
    if (!user || !token) {
      setHasAutoWithdrawn(false);
    }
  }, [user, token]);

  return (
    <UserContext.Provider
      value={{
        user,
        loginUser,
        logoutUser,
        isFetching,
        checkTokenInSession,
        setLoadingGame,
        loadingGame,
        refreshBalance,
        balance,
      }}
    >
      {children}
      {loadingGame && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-[999]">
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48, color: "#fff" }} spin />
            }
          />
        </div>
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
