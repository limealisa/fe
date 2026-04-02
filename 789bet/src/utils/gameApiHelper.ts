/**
 * Game API Helper - Chuyển đổi từ format cũ sang format mới (BC88BET style)
 */

import { getListGame, getListGameFish, getGameHot } from "@/api/services/game.service";
import gameName from "@/constant/gameName";

/**
 * Map ProviderID sang ProductType (BC88BET format)
 */
export const mapProviderIdToProductType = (providerId: number | string): string => {
  const providerMap: Record<string | number, string> = {
    // 789BET ProviderID -> BC88BET ProductType
    1007: "PG",      // PGSoft
    1091: "JL",      // Jili
    1009: "CQ9",     // CQ9
    1085: "JDB",     // JDB
    1079: "FC",      // Fachai
    1006: "PP",      // PragmaticPlay
    "MP": "MG",      // Microgaming
    "R8": "R88",     // R88
    "RE": "KM",      // KingMidas
    "R5": "YGR",     // YesGetRich
    "FTG": "FTG",
    "TP": "TP",
    "V8": "V8",
    1052: "DG",      // Dream Gaming
    1020: "WM",      // WM Casino
    1046: "SABA",    // SABA
    1078: "CMD",     // CMD
    1002: "EVO",     // Evolution Gaming
    1001: "AG",      // Asia Gaming
    1022: "SE",      // Sexy Gaming
    1012: "SBO",     // SBO
    1150: "LIVE22",  // Live22
  };
  
  return providerMap[providerId] || String(providerId);
};

/**
 * Map GameType sang BC88BET format
 */
export const mapGameTypeToBC88BET = (gameType: number | string): string => {
  const gameTypeMap: Record<number | string, string> = {
    1: "RNG",        // SLOT -> RNG
    2: "LIVE",       // LIVE_CASINO -> LIVE
    3: "SPORT",      // SPORT_BOOK -> SPORT
    8: "FISH",       // FISHING -> FISH
    "FH": "FISH",
    "SL": "RNG",
    "CB": "LIVE",
    "LC": "LIVE",
    "SB": "SPORT",
  };
  
  return gameTypeMap[gameType] || "RNG";
};

/**
 * Map gameName (supplier) sang ProductType (BC88BET format)
 * Ví dụ: "pg" -> "PG", "jili" -> "JL"
 */
export const mapGameNameToProductType = (gameNameStr: string): string => {
  const nameMap: Record<string, string> = {
    // Slot games
    [gameName.PG]: "PG",
    [gameName.Jili]: "JL",
    [gameName.TP]: "TP",
    [gameName.FC]: "FC",
    [gameName.CQ9]: "CQ9",
    [gameName.PP]: "PP",
    [gameName.JDB]: "JDB",
    [gameName.VA]: "VA",
    [gameName.MG]: "MG",
    [gameName.SPRIBE]: "SPB",
    [gameName.AFB]: "AFB",
    [gameName.KA]: "KA",
    [gameName.R88]: "R88",
    [gameName.PT]: "PT",
    [gameName.BNG]: "BNG",
    [gameName.PS]: "PS",
    [gameName.FTG]: "FTG",
    [gameName.YGR]: "YGR",
    [gameName.NS]: "NS",
    [gameName.MW]: "MW",
    [gameName.ASKME]: "ASKME",
    [gameName.V8]: "LCC", // V8 -> LCC trong BC88BET
    [gameName.KM]: "KM",
    // Casino games
    [gameName.DG]: "DG",
    [gameName.WM]: "WM",
    [gameName.SE]: "SEX",
    [gameName.AG]: "AG",
    [gameName.EVO]: "SA", // EVO -> SA trong BC88BET
    [gameName.SA]: "SA",
    // Sport games
    [gameName.SABA]: "SB",
    [gameName.CMD]: "CMD",
    [gameName.SBO]: "SBO",
  };
  
  return nameMap[gameNameStr?.toLowerCase()] || gameNameStr?.toUpperCase() || "";
};

/**
 * Normalize games response - Xử lý các format response khác nhau
 * BC88BET format: { games: [...] } hoặc trực tiếp là array
 */
export const normalizeGames = (payload: any): any[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload?.games && Array.isArray(payload.games)) {
    return payload.games;
  }
  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
};

/**
 * Normalize game object từ BC88BET format sang 789BET format
 * BC88BET: { game_code, product_code, game_icon, game_name }
 * 789BET: { codeGame, gameId, gameIconUrl, gameName }
 */
export const normalizeGameObject = (game: any): any => {
  if (!game) return game;
  
  // Nếu đã có format 789BET, return nguyên (nhưng vẫn đảm bảo có đủ field)
  if (game.codeGame && game.gameId) {
    return game;
  }
  
  // Convert từ BC88BET format sang 789BET format
  const normalized = {
    ...game,
    // BC88BET -> 789BET mapping
    codeGame: game.game_code || game.tcgGameCode || game.codeGame || game.code || game.gameCode,
    gameId: game.product_code || game.productCode || game.gameId || game.id,
    gameIconUrl: game.game_icon || game.icon || game.gameIconUrl || game.image,
    gameName: game.game_name || game.gameName || game.name,
    // Giữ lại các field khác từ BC88BET
    partnerName: game.partnerName || game.partner_name || game.supplier,
    providerId: game.providerId || game.provider_id || game.gpid,
    providerName: game.providerName || game.provider_name,
    gameTypeId: game.gameTypeId || game.game_type_id || game.type,
    gameTypeName: game.gameTypeName || game.game_type_name,
    // Giữ lại các field gốc từ BC88BET để dùng cho playGame
    id: game.id,
    product_code: game.product_code || game.productCode || game.gameId,
    productCode: game.product_code || game.productCode || game.gameId,
    game_code: game.game_code || game.codeGame || game.code,
    gameType: game.gameType, // BC88BET dùng để filter
  };
  
  return normalized;
};

/**
 * Normalize mảng games từ BC88BET format sang 789BET format
 */
export const normalizeGamesTo789BET = (games: any[]): any[] => {
  return games.map(normalizeGameObject);
};

/**
 * Lấy danh sách game theo nhiều providers (gọi nhiều API và merge)
 */
export const getListGameByMultipleProviders = async (
  providerIds: (number | string)[],
  gameType: number | string
): Promise<any[]> => {
  const productType = mapGameTypeToBC88BET(gameType);
  const allGames: any[] = [];
  
  // Gọi API cho từng provider
  const promises = providerIds.map(async (providerId) => {
    try {
      const productTypeStr = mapProviderIdToProductType(providerId);
      const response = await getListGame(productTypeStr, productType);
      const games = normalizeGames(response?.data || response);
      return games;
    } catch (error) {
      console.error(`Error loading games for provider ${providerId}:`, error);
      return [];
    }
  });
  
  const results = await Promise.all(promises);
  results.forEach((games) => {
    allGames.push(...games);
  });
  
  return allGames;
};

/**
 * Lấy danh sách game - Tự động chọn API phù hợp
 */
export const fetchGameList = async (options: {
  providerIds?: (number | string)[];
  gameTypes?: (number | string)[];
  isFish?: boolean;
  isHot?: boolean;
}): Promise<any[]> => {
  try {
    // Game bắn cá
    if (options.isFish) {
      const response = await getListGameFish();
      return normalizeGames(response?.data || response);
    }
    
    // Game hot
    if (options.isHot) {
      const response = await getGameHot();
      return normalizeGames(response?.data || response);
    }
    
    // Game theo provider và type
    if (options.providerIds && options.providerIds.length > 0 && options.gameTypes && options.gameTypes.length > 0) {
      // Nếu chỉ có 1 provider và 1 gameType, gọi trực tiếp
      if (options.providerIds.length === 1 && options.gameTypes.length === 1) {
        const productType = mapProviderIdToProductType(options.providerIds[0]);
        const gameType = mapGameTypeToBC88BET(options.gameTypes[0]);
        const response = await getListGame(productType, gameType);
        return normalizeGames(response?.data || response);
      }
      
      // Nếu có nhiều providers, gọi nhiều API và merge
      const allGames: any[] = [];
      for (const providerId of options.providerIds) {
        for (const gameType of options.gameTypes) {
          const productType = mapProviderIdToProductType(providerId);
          const gameTypeStr = mapGameTypeToBC88BET(gameType);
          const response = await getListGame(productType, gameTypeStr);
          const games = normalizeGames(response?.data || response);
          allGames.push(...games);
        }
      }
      return allGames;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching game list:", error);
    return [];
  }
};

