/* eslint-disable import/no-anonymous-default-export */
import Partner from "@/config/Partner";
import { contentInstance } from "@/configs/CustomizeAxios";
import { SignInReq } from "../types/auth.interface";
import { ConfigGameEndPoint, ConfigAuthEndPoint } from "./contants";

/**
 * Lấy danh sách game available - Giống BC88BET
 */
const getListGameAvalible = () => {
  return contentInstance.get(`/api/game/gameAvalible`);
};

/**
 * Lấy danh sách game bắn cá - Giống BC88BET
 */
const getListGameFish = () => {
  return contentInstance.get(`/api/product/fish`);
};

/**
 * Lấy danh sách game theo productType và gameType - Giống BC88BET
 * @param productType - Loại sản phẩm (VD: "FC", "PG", "JL", etc.)
 * @param gameType - Loại game (VD: "RNG", "LIVE", "SPORT", etc.)
 */
const getListGame = (productType: string, gameType: string) => {
  return contentInstance.get(`/api/product/${productType}/${gameType}`);
};

/**
 * Lấy danh sách game hot - Giống BC88BET
 */
const getGameHot = () => {
  return contentInstance.get(`/api/product/hot-games`);
};

/**
 * Lấy danh sách game available (cũ - giữ lại để tương thích)
 */
const GameAvalible = ({
  category,
  game,
}: {
  category: string;
  game: string | null;
}) =>
  contentInstance.get(`${ConfigGameEndPoint.GETGAMELIST}?category=${category}&game=${game}`);

const lauchgame = ({
  username,
  device,
  lang,
  gameid,
  gpid,
}: {
  username: string;
  device: string;
  lang: string;
  gameid: number;
  gpid: number;
}) =>
  contentInstance.get(`${ConfigGameEndPoint.LAUCHGAME}?username=${username}&device=${device}&lang=${lang}&gameid=${gameid}&gpid=${gpid}`);

const lauchgameType2 = async ({
  supplier,
  device,
  lang,
  gameid,
  type,
  gpid,
}: {
  supplier: string;
  device: string;
  lang: string;
  gameid: number | string;
  gpid: number | string;
  type: number | string;
}) => {
  // Log theo format JSON như backend API
  // Map platform: "d" -> "html5-desktop", "m" -> "mobile"
  const platformMap: Record<string, string> = {
    "d": "html5-desktop",
    "m": "mobile",
  };
  const platform = device ? (platformMap[device] || "html5") : null;
  
  // Thời gian bắt đầu gọi API
  const requestTime = new Date().toISOString();
  const requestTimestamp = Date.now();
  
  const apiLogData = {
    method: "lg",
    username: null, // Will be logged at call site if available
    product_type: type || null,
    game_code: null, // Not available in Type2 API params
    game_mode: null, // Not available in Type2 API params
    language: lang || null,
    platform: platform,
    request_time: requestTime,
  };
  
  // Chỉ log trong development mode
  if (process.env.NODE_ENV === "development") {
    console.log("=== API REQUEST LOG (lauchgameType2 - Backend Format) ===");
    console.log(JSON.stringify(apiLogData, null, 2));
  }
  
  const response = await contentInstance.get(`${ConfigGameEndPoint.LAUCHGAME}/${supplier}?&device=${device}&lang=${lang}&gameid=${gameid}&gpid=${gpid}&type=${type}`);
  
  // Thời gian nhận response và tính thời gian phản hồi
  const responseTime = new Date().toISOString();
  const responseTimestamp = Date.now();
  const responseTimeMs = responseTimestamp - requestTimestamp;
  
  // Log response với thời gian phản hồi (chỉ trong development)
  if (process.env.NODE_ENV === "development") {
    const responseLogData = {
      ...apiLogData,
      response_time: responseTime,
      response_time_ms: responseTimeMs,
    };
    console.log("=== API RESPONSE LOG (lauchgameType2 - Backend Format) ===");
    console.log(JSON.stringify(responseLogData, null, 2));
  }
  
  return response;
};

/**
 * BC88BET style: Launch game by code and id
 * @param code - Game code (codeGame, tcgGameCode, productCode)
 * @param id - Game ID (gameId, productCode, game_code)
 * @note method=lg is required according to API documentation
 */
const getPlayGameById = async (code: string, id: string) => {
  return contentInstance.get(`/api/game/launchgame/${id}?code=${code}&method=lg`);
};

const GameAvalibleV2 = async (data: {
  gpIds: string[];
  gameTypes: string[];
  maxRank?: number;
  partner?: string;
}) =>
  await contentInstance.post(ConfigGameEndPoint.GAME_AVALIBLE_NEW, {
    ...data,
    pn: data.partner ? data.partner : Partner.FE,
  });

const GameAvalibleNewV2 = async (data: {
  gpIds: string[] | undefined;
  gameTypes: string[] | undefined;
  rankType?: "rank" | "rank_super" | "rank_hot" | "rank_new";
  pn: string | null;
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await contentInstance.post(ConfigGameEndPoint.GAME_AVALIBLE_NEW_V2, {
      ...data,
      rankType: data?.rankType ? data?.rankType : "rank",
    });
    return res?.data?.data;
  } catch (error: any) {
    // Nếu endpoint không tồn tại (404), return empty array thay vì throw error
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

const AddGameFavorite = async (gameId: number | string, partnerName: string) => {
  try {
    await contentInstance.post(ConfigGameEndPoint.FAVORITE_ADD, {
      gameId: gameId,
      partnerName: partnerName,
    });
  } catch (error: any) {
    // Nếu endpoint không tồn tại (404), không throw error (silent fail)
    if (error?.response?.status === 404) {
      return;
    }
    throw error;
  }
};

const ListGameFavorite = async () => {
  try {
    const res = await contentInstance.get(ConfigGameEndPoint.FAVORITE_LIST);
    return res.data;
  } catch (error: any) {
    // Nếu endpoint không tồn tại (404), return empty array
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

const DeleteGameFavorite = async (
  gameId: number | string,
  partnerName: string
) => {
  try {
    await contentInstance.post(ConfigGameEndPoint.FAVORITE_DELETE, {
      gameId: gameId,
      partnerName: partnerName,
    });
  } catch (error: any) {
    // Nếu endpoint không tồn tại (404), không throw error (silent fail)
    if (error?.response?.status === 404) {
      return;
    }
    throw error;
  }
};
export default {
  lauchgame,
  GameAvalible,
  lauchgameType2,
  GameAvalibleV2,
  GameAvalibleNewV2,
  AddGameFavorite,
  ListGameFavorite,
  DeleteGameFavorite,
  // BC88BET style APIs
  getListGameAvalible,
  getListGameFish,
  getListGame,
  getGameHot,
  getPlayGameById, // BC88BET style: launch game by code and id
};

// Export named để dễ import
export {
  getListGameAvalible,
  getListGameFish,
  getListGame,
  getGameHot,
  getPlayGameById,
};
