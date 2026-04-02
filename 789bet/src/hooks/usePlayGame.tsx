/**
 * usePlayGame Hook - Chơi game với auto wallet transfer
 * BC88BET style: Mở window trước → Gọi API → Transfer wallet → Redirect
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import swal from "sweetalert2";
import gameService, { getPlayGameById, getListGame } from "@/api/services/game.service";
import walletService from "@/api/services/wallet.service";
import {
  GameConfig,
  GameConfigItem,
  findGameConfigBySupplier,
  findGameConfigByCode,
} from "@/config/GameConfig";
import { mapGameNameToProductType } from "@/utils/gameApiHelper";
import { useUser } from "@/context/useUserContext";
import useLaunchGameDevice from "./useLaunchGameDevice";
import { isMobile } from "@/utils/check";

interface PlayGameParams {
  gameId: number | string;
  gpid: number | string;
  supplier: string;
  type: number | string;
  code?: string; // Optional: Game code (codeGame, tcgGameCode, productCode) - BC88BET style
  id?: string; // Optional: Game ID (gameId, productCode, game_code) - BC88BET style
  lang?: string; // Optional: mặc định "en"
  gamename?: string; // Optional: Game name từ URL (fallback để tìm config)
}

export const usePlayGame = () => {
  const router = useRouter();
  const deviceC = useLaunchGameDevice();
  const { user, setLoadingGame, refreshBalance } = useUser();
  const [loading, setLoading] = useState(false);

  /**
   * Chơi game với auto transfer - BC88BET style
   * Flow: Mở window trước → Gọi API → Transfer wallet → Redirect window
   */
  const playGame = async ({
    gameId,
    gpid,
    supplier,
    type,
    code,
    id,
    lang = "en",
    gamename,
  }: PlayGameParams) => {
    // Check authentication - check cả user object và token từ localStorage
    // Vì user state có thể chưa được sync ngay sau khi đăng nhập
    let currentUser = user;
    const hasUser = currentUser && (currentUser.username || currentUser.id || currentUser.name);
    const hasToken = typeof window !== "undefined" && localStorage.getItem("token");
    
    // Nếu không có user trong state nhưng có token, thử load từ localStorage
    if (!hasUser && hasToken) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && (parsedUser.username || parsedUser.id || parsedUser.name)) {
            console.log("Found user in localStorage, using it");
            currentUser = parsedUser;
          }
        }
      } catch (error) {
        console.error("Error reading user from localStorage:", error);
      }
    }
    
    // Final check: nếu vẫn không có user hoặc token, redirect to login
    if (!currentUser || (!currentUser.username && !currentUser.id && !currentUser.name) || !hasToken) {
      console.log("No valid user or token, redirecting to login");
      router.push(
        `/lobby/navigation/LoginToSupplier?d=${deviceC}&gameid=${gameId}&gpid=${gpid}&supplier=${supplier}&type=${type}&lang=${lang}`
      );
      return;
    }

    // 1. Tìm config game để lấy code và type
    // BC88BET style: 
    // - `id` (gameId) là mã nhà cung cấp (ví dụ: "SB", "PG", "JL") - từ product_code
    // - `code` (codeGame) là mã game cụ thể (ví dụ: "SB0001", "PG0123") - từ game_code
    // - Tìm config theo `id` (product_code) trước, vì đó là mã nhà cung cấp
    let gameConfig: GameConfigItem | null = null;
    
    // Ưu tiên 1: Tìm theo id (product_code từ BC88BET - mã nhà cung cấp)
    // BC88BET: GameConfig.find((item) => item.code === id)
    if (id) {
      gameConfig = GameConfig.find((item) => item.code.toLowerCase() === String(id).toLowerCase()) || null;
    }
    
    // Ưu tiên 2: Nếu chưa tìm thấy và có code (codeGame), thử extract mã nhà cung cấp từ code
    // Ví dụ: "PG0001" -> "PG", "JL0091" -> "JL", "SB0001" -> "SB", "EG5001" -> "EG5"
    if (!gameConfig && code) {
      // Extract mã nhà cung cấp từ codeGame
      // Pattern 1: Thử từ dài đến ngắn để ưu tiên mã dài hơn (EG5 trước EG từ "EG5001")
      let providerCode = null;
      for (let len = 4; len >= 2; len--) {
        const match = code.match(new RegExp(`^([A-Z]{${len}})`));
        if (match) {
          const candidate = match[1];
          // Kiểm tra xem có config nào match không
          const found = GameConfig.find((item) => item.code.toLowerCase() === candidate.toLowerCase());
          if (found) {
            providerCode = candidate;
            break;
          }
        }
      }
      
      // Pattern 2: Nếu không match, thử pattern khác (ví dụ: "SB0001" -> "SB")
      if (!providerCode) {
        providerCode = code.match(/^([A-Z]+)/)?.[1];
      }
      
      if (providerCode) {
        gameConfig = GameConfig.find((item) => item.code.toLowerCase() === providerCode.toLowerCase()) || null;
      }
      
      // Nếu vẫn không tìm thấy, thử tìm trực tiếp theo code (có thể code là mã nhà cung cấp)
      if (!gameConfig) {
        gameConfig = GameConfig.find((item) => item.code.toLowerCase() === String(code).toLowerCase()) || null;
      }
    }
    
    // Ưu tiên 3: Tìm theo supplier (partnerName)
    if (!gameConfig && supplier) {
      gameConfig = findGameConfigBySupplier(supplier);
    }
    
    // Ưu tiên 4: Tìm theo gpid (providerId)
    if (!gameConfig && gpid) {
      gameConfig = GameConfig.find((item) => String(item.gpid) === String(gpid)) || null;
    }
    
    // Ưu tiên 5: Tìm theo gameId (nếu gameId là số, có thể là providerId)
    if (!gameConfig && gameId && typeof gameId === 'number') {
      gameConfig = GameConfig.find((item) => String(item.gpid) === String(gameId)) || null;
    }
    
    // Ưu tiên 6: Tìm theo gamename từ URL (fallback cuối cùng)
    if (!gameConfig && gamename) {
      const productType = mapGameNameToProductType(gamename);
      if (productType) {
        gameConfig = findGameConfigByCode(productType);
      }
    }

    if (!gameConfig) {
      console.error("Game config not found:", { code, id, supplier, gameId, gpid });
      swal.fire("Lỗi", "Không tìm thấy cấu hình game", "error");
      return;
    }

    // 2. Xác định code và id cho BC88BET API
    // BC88BET API: getPlayGameById(code, id)
    // - code: codeGame (mã game cụ thể, ví dụ: "SB0001", "PG0123", "EG5001")
    // - id: gameId (mã nhà cung cấp, ví dụ: "SB", "PG", "EG5")
    // Lưu ý: 
    // - Nếu có code từ params (codeGame cụ thể), dùng nó
    // - Nếu không có code, cần lấy game đầu tiên từ danh sách game của provider
    // - id: Ưu tiên id từ params, nếu không có thì dùng gameConfig.code
    let gameCodeForAPI: string = "";
    let gameIdForAPI: string = String(id || gameConfig.code || "");
    
    // Nếu có code từ params (codeGame cụ thể), dùng nó
    if (code) {
      gameCodeForAPI = String(code);
    } else {
      // Nếu không có codeGame cụ thể, thử lấy game đầu tiên từ danh sách game của provider
      try {
        // Xác định gameType dựa trên gameConfig
        const gameType = gameConfig.gameType === 2 ? "LIVE" : gameConfig.gameType === 3 ? "SPORT" : "RNG";
        const productType = gameConfig.code;
        
        console.log("=== FETCHING FIRST GAME ===");
        console.log("ProductType:", productType);
        console.log("GameType:", gameType);
        
        // Lấy danh sách game của provider
        const gamesResponse: any = await getListGame(productType, gameType);
        const games = gamesResponse?.data?.games || gamesResponse?.games || gamesResponse?.data || [];
        
        console.log("Games list:", games);
        
        // Lấy game đầu tiên
        if (games && games.length > 0) {
          const firstGame = games[0];
          gameCodeForAPI = firstGame.codeGame || firstGame.game_code || firstGame.code || "";
          console.log("First game codeGame:", gameCodeForAPI);
        } else {
          // Nếu không có game, thử tạo codeGame mặc định
          const providerCode = gameConfig.code.toUpperCase();
          gameCodeForAPI = `${providerCode}0001`;
          console.log("No games found, using default:", gameCodeForAPI);
        }
      } catch (error) {
        console.error("Error fetching games list:", error);
        // Fallback: Tạo codeGame mặc định
        const providerCode = gameConfig.code.toUpperCase();
        gameCodeForAPI = `${providerCode}0001`;
        console.log("Error fetching games, using default:", gameCodeForAPI);
      }
    }
    
    // Validate: Đảm bảo code và id không rỗng
    if (!gameCodeForAPI || !gameIdForAPI) {
      console.error("Invalid API parameters:", { gameCodeForAPI, gameIdForAPI, code, id, gameConfig });
      swal.fire("Lỗi", "Thông tin game không hợp lệ", "error");
      return;
    }

    // 3. Kiểm tra xem có phải mobile không (đặc biệt iOS)
    const isMobileDevice = typeof window !== "undefined" && isMobile(window);
    let tempWindow: Window | null = null;
    
    // Trên mobile: không mở window trống trước (tránh bị chặn popup trên iOS)
    // Trên desktop: vẫn mở window trống trước như cũ
    if (!isMobileDevice) {
      tempWindow = window.open("", "_blank");
      if (!tempWindow) {
        swal.fire(
          "Chuyển tiền không thành công",
          "Cửa sổ bật lên bị chặn bởi trình duyệt. Vui lòng cho phép cửa sổ bật lên.",
          "error"
        );
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setLoadingGame(true);

      // Debug logging
      console.log("=== PLAY GAME API CALL ===");
      console.log("gameCodeForAPI:", gameCodeForAPI);
      console.log("gameIdForAPI:", gameIdForAPI);
      console.log("gameConfig:", gameConfig);
      console.log("Original params:", { code, id, gameId, gpid, supplier });

      // Log theo format JSON như backend API (chỉ trong development)
      // Map platform: "d" -> "html5-desktop", "m" -> "mobile"
      const platformMap: Record<string, string> = {
        "d": "html5-desktop",
        "m": "mobile",
      };
      const platform = deviceC ? (platformMap[deviceC] || "html5") : null;
      
      // Thời gian bắt đầu gọi API
      const requestTime = new Date().toISOString();
      const requestTimestamp = Date.now();
      
      const apiLogData = {
        method: "lg",
        username: currentUser?.username || currentUser?.id || null,
        product_type: gameConfig.type || null,
        game_code: gameCodeForAPI || null,
        game_mode: gameConfig.mode || null,
        language: lang || null,
        platform: platform,
        request_time: requestTime,
      };
      
      // Chỉ log trong development mode
      if (process.env.NODE_ENV === "development") {
        console.log("=== API REQUEST LOG (Backend Format) ===");
        console.log(JSON.stringify(apiLogData, null, 2));
      }

      // 4. Gọi API để lấy playUrl TRƯỚC (BC88BET style - giống y hệt)
      // BC88BET: getPlayGameById(code, id)
      // Lưu ý: contentInstance interceptor đã return response.data, nên res chính là data
      const res: any = await getPlayGameById(gameCodeForAPI, gameIdForAPI);
      
      // Thời gian nhận response và tính thời gian phản hồi
      const responseTime = new Date().toISOString();
      const responseTimestamp = Date.now();
      const responseTimeMs = responseTimestamp - requestTimestamp;
      
      // Log response với thời gian
      console.log("=== API RESPONSE ===");
      console.log("Response:", res);
      console.log("Response status:", res?.status);
      console.log("Response msg:", res?.msg);
      console.log("Response code:", res?.code);
      console.log("Response data:", res?.data);
      
      // Log response với thời gian phản hồi (chỉ trong development)
      if (process.env.NODE_ENV === "development") {
        const responseLogData = {
          ...apiLogData,
          response_time: responseTime,
          response_time_ms: responseTimeMs,
        };
        console.log("=== API RESPONSE LOG (Backend Format) ===");
        console.log(JSON.stringify(responseLogData, null, 2));
      }

      // 5. Chuyển tiền từ ví chính → ví game (BC88BET style - giống y hệt)
      // BC88BET: walletTransfer(user.coin, String(dataGame?.type), 1)
      // BC88BET LUÔN gọi walletTransfer mà KHÔNG kiểm tra user.coin > 0
      // Lưu ý: bc88bet dùng user.coin, nhưng nếu không có thì dùng user.balance
      const userCoin = currentUser.coin ?? currentUser.balance ?? 0;
      let wallet: any = null;
      
      // Dùng type trực tiếp từ gameConfig (EG5 dùng type: 191)
      const walletType = gameConfig.type;
      
      try {
        console.log("=== WALLET TRANSFER CALL ===");
        console.log("Game config code:", gameConfig.code);
        console.log("Amount:", userCoin);
        console.log("Type:", walletType);
        console.log("TransferType: 1 (main -> game)");
        
        // BC88BET: walletTransfer nhận type là string
        // BC88BET LUÔN gọi walletTransfer, kể cả khi user.coin = 0
      const walletResponse: any = await walletService.walletTransfer(
        userCoin,
          walletType, // walletTransfer sẽ tự convert sang string
          1
        );

        console.log("=== WALLET TRANSFER RESPONSE ===");
        console.log("Raw response:", walletResponse);
        console.log("Response type:", typeof walletResponse);
        console.log("Response status:", walletResponse?.status);
        console.log("Response keys:", walletResponse ? Object.keys(walletResponse) : "null");

        // BC88BET: contentInstance interceptor đã return response.data
        // walletResponse chính là data rồi
        wallet = walletResponse;
        
        // BC88BET chỉ kiểm tra wallet có tồn tại không (truthy check)
        // Không kiểm tra status, chỉ cần wallet là truthy
        // Nếu wallet có status === false, vẫn giữ nguyên wallet để pass check (giống bc88bet)
        // Vì bc88bet chỉ check `if (res?.data?.playUrl && wallet)` - không check status
        if (!wallet) {
          console.error("Wallet transfer returned null/undefined");
        } else if (wallet?.status === false) {
          console.warn("Wallet transfer returned status === false, but keeping for check:", wallet);
        } else {
          console.log("Wallet transfer response received:", wallet);
        }
      } catch (walletError: any) {
        console.error("=== WALLET TRANSFER ERROR ===");
        console.error("Error:", walletError);
        console.error("Error response:", walletError?.response);
        console.error("Error data:", walletError?.response?.data || walletError);
        console.error("Error status:", walletError?.status);
        console.error("Error msg:", walletError?.msg);
        
        // Nếu error có data (từ interceptor), có thể đó là response từ API
        // BC88BET: Nếu wallet transfer throw error, vẫn có thể có data trong error
        if (walletError?.response?.data) {
          wallet = walletError.response.data;
          console.log("Using error response data as wallet:", wallet);
        } else if (walletError?.status !== undefined || walletError?.msg) {
          // Nếu error chính là response data (từ interceptor reject)
          wallet = walletError;
          console.log("Using error as wallet:", wallet);
        } else {
          // Nếu thực sự là lỗi, wallet = null
          wallet = null;
        }
      }

      // Debug logging
      console.log("=== WALLET TRANSFER DEBUG ===");
      console.log("User coin:", currentUser.coin);
      console.log("User balance:", currentUser.balance);
      console.log("User coin (used):", userCoin);
      console.log("Game config type:", gameConfig.type);
      console.log("Wallet (processed):", wallet);
      console.log("Res (playUrl):", res);
      console.log("Res data playUrl:", res?.data?.playUrl);

      // 6. Kiểm tra response (BC88BET style - giống y hệt)
      // Lưu ý: contentInstance interceptor đã return response.data
      // Response format có thể là: {status, msg, data: {playUrl}} hoặc {status, msg, playUrl}
      if (res?.status === false) {
        if (tempWindow) {
          tempWindow.close();
        }
        const errorMsg = res?.msg || res?.message || "Không thể khởi động game";
        console.error("API Error:", {
          status: res?.status,
          msg: errorMsg,
          code: res?.code,
          response: res
        });
        swal.fire("Lỗi", errorMsg, "error");
        setLoading(false);
        setLoadingGame(false);
        return;
      }

      // 7. BC88BET Desktop: Kiểm tra playUrl và wallet (giống y hệt desktop)
      // Desktop BC88BET code: if (res?.data?.playUrl && wallet)
      // Desktop chỉ dùng res.data.playUrl trực tiếp, không xử lý phức tạp
      // Nhưng vì interceptor đã return response.data, nên res có thể là:
      // - {status, data: {playUrl}} -> res.data.playUrl
      // - {status, playUrl} -> res.playUrl
      const playUrl = res?.data?.playUrl || res?.playUrl;
      
      // Desktop BC88BET: Dùng playUrl trực tiếp từ API, không xử lý phức tạp
      // Desktop mở tab mới với URL từ API (có traceId cũng được), tab mới sẽ tự redirect đến URL game thực
      // Mobile cũng làm tương tự: mở tab mới với URL từ API, tab mới sẽ tự redirect
      let playUrlString: string | null = null;
      if (playUrl) {
        if (typeof playUrl === 'string') {
          // Nếu là string, dùng trực tiếp từ API (giống desktop)
          playUrlString = playUrl;
        } else if (typeof playUrl === 'object') {
          // Nếu là object, lấy giá trị đầu tiên từ API (giống desktop - đơn giản)
          // Desktop không xử lý phức tạp, chỉ lấy URL đầu tiên và mở tab mới
          // Tab mới sẽ tự redirect đến URL game thực
          if (Array.isArray(playUrl) && playUrl.length > 0) {
            // Nếu là array, lấy phần tử đầu tiên là string
            playUrlString = playUrl.find((item: any) => typeof item === 'string') || null;
          } else if (!Array.isArray(playUrl)) {
            // Nếu là object, lấy giá trị string đầu tiên từ Object.values
            const firstValue = Object.values(playUrl).find((v: any) => typeof v === 'string' && v.startsWith('http'));
            playUrlString = firstValue as string || null;
          }
        }
      }
      
      // Debug: Log chi tiết để kiểm tra
      console.log("=== FINAL CHECK (Desktop Style) ===");
      console.log("playUrl (raw):", playUrl);
      console.log("playUrlString (processed):", playUrlString);
      console.log("wallet:", wallet);
      console.log("res:", res);
      console.log("res.data:", res?.data);
      
      // Desktop BC88BET: if (res?.data?.playUrl && wallet)
      if (playUrlString && typeof playUrlString === 'string' && wallet) {
        // Desktop và Mobile: Mở tab mới với URL từ API trực tiếp (giống desktop)
        // URL từ API (có traceId) là endpoint trung gian, khi mở sẽ tự redirect đến URL game thực
        if (isMobileDevice) {
          // Kiểm tra xem có phải PG không
          const isPG = gameIdForAPI?.toUpperCase() === 'PG' || 
                      gameConfig?.code?.toUpperCase() === 'PG' ||
                      id?.toUpperCase() === 'PG' ||
                      supplier?.toUpperCase() === 'PG' ||
                      code?.toUpperCase()?.startsWith('PG') ||
                      gameCodeForAPI?.toUpperCase()?.startsWith('PG');
          
          // Trên mobile: Mở tab mới trực tiếp với URL từ API (giống desktop)
          // URL có traceId sẽ tự redirect đến URL game thực khi mở
          const newWindow = window.open(playUrlString, "_blank", "noopener,noreferrer");
          if (newWindow) {
            console.log("Mobile: Opened new tab with API URL (will auto-redirect):", playUrlString);
          } else {
            // Nếu popup bị chặn
            if (isPG) {
              // Với PG: Mở URL trực tiếp trong tab hiện tại (URL trung gian sẽ tự redirect)
              // URL có traceId là endpoint trung gian, khi mở sẽ tự redirect đến URL game thực
              window.location.href = playUrlString;
              console.log("Mobile PG: Popup blocked, opening URL directly in current tab (will auto-redirect):", playUrlString);
            } else {
              // Với các provider khác: Fallback về trang trung gian
              const encodedUrl = encodeURIComponent(playUrlString);
              window.location.href = `/games/open?url=${encodedUrl}`;
              console.log("Mobile: Popup blocked, using intermediate page:", playUrlString);
            }
          }
        } else {
          // Trên desktop: giống BC88BET - redirect window đã mở
          if (tempWindow) {
            tempWindow.location.href = playUrlString;
          }
        }
        setLoading(false);
        setLoadingGame(false);
      } else {
        if (tempWindow) {
          tempWindow.close();
        }
        console.error("Failed to launch game:", {
          hasPlayUrl: !!playUrlString,
          playUrl: playUrlString,
          playUrlRaw: playUrl,
          hasWallet: !!wallet,
          walletValue: wallet,
          resValue: res,
          resData: res?.data
        });
        
        // Xác định thông báo lỗi rõ ràng
        let errorMessage = "Không thể khởi động game";
        
        if (!playUrlString && !wallet) {
          errorMessage = "Không nhận được URL game và thông tin ví";
        } else if (!playUrlString) {
          errorMessage = "Không nhận được URL game từ server";
        } else if (!wallet) {
          errorMessage = "Không thể chuyển tiền vào ví game";
        } else {
          // Nếu có msg từ API nhưng không phải là lỗi thực sự (ví dụ: "success")
          // thì dùng thông báo mặc định
          const apiMsg = res?.msg || res?.message;
          if (apiMsg && apiMsg.toLowerCase() !== "success") {
            errorMessage = apiMsg;
          }
        }
        
        swal.fire("Lỗi", errorMessage, "error");
        setLoading(false);
        setLoadingGame(false);
      }
    } catch (error: any) {
      if (tempWindow) {
        tempWindow.close();
      }
      console.error("=== PLAY GAME ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error?.response);
      console.error("Error message:", error?.message);
      console.error("Error data:", error?.response?.data);
      
      // Xử lý lỗi từ API response
      const errorMsg = error?.response?.data?.msg || 
                      error?.response?.data?.message || 
                      error?.message || 
                      "Không thể khởi động game";
      
      swal.fire("Lỗi", errorMsg, "error");
      setLoading(false);
      setLoadingGame(false);
    }
  };

  return {
    playGame,
    loading,
  };
};

export default usePlayGame;

