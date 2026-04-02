/**
 * Game Configuration - Tương tự BC88BET
 * Map các game providers với wallet system
 */

export interface GameConfigItem {
  code: string;          // Mã nhà cung cấp (VD: "PG", "JL", "DG")
  config: string;         // Config API
  type: number;           // Product Code thực tế cho wallet transfer (BC88BET style - số lớn như 27, 86, 112)
  gameType?: number;      // GameType enum (SLOT=1, LIVE_CASINO=2, SPORT_BOOK=3) - dùng cho UI
  game: string;           // Tên game
  name: string;           // Tên hiển thị
  mode: number;          // Chế độ
  supplier?: string;      // Supplier name (từ 789BET - partnerName)
  gpid?: number | string; // Provider ID (từ 789BET - providerId)
}

/**
 * GameConfig - Danh sách cấu hình các nhà cung cấp game
 * 
 * Lưu ý:
 * - type: Map với GameType từ 789BET (SLOT=1, LIVE_CASINO=2, etc.)
 * - supplier: Map với partnerName từ game data
 * - gpid: Map với providerId từ game data
 * - code: Mã riêng cho wallet system (có thể giống supplier hoặc khác)
 */
export const GameConfig: GameConfigItem[] = [
  // Dream Gaming
  {
    code: "DG",
    config: "API_1",
    type: 27,
    game: "XXXXXX",
    name: "DG Casino",
    mode: 1,
    gameType: 2,         // LIVE_CASINO
    supplier: "dg",
    gpid: 1052,
  },
  // Asia Gaming
  {
    code: "AG",
    config: "API_1",
    type: 4,
    game: "XXXXXX",
    name: "AG Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "ag",
    gpid: 1001,
  },
  // Evolution Gaming
  {
    code: "EG",
    config: "API_1",
    type: 191,
    game: "XXXXXX",
    name: "EVO Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "evo",
    gpid: 1002,
  },
  // Evolution Gaming (EG5 variant - để tương thích với menuItems)
  {
    code: "EG5",
    config: "API_1",
    type: 191,
    game: "XXXXXX",
    name: "EVO Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "evo",
    gpid: 1002,
  },
  // Sexy Gaming
  {
    code: "SEX",
    config: "API_1",
    type: 112,
    game: "XXXXXX",
    name: "SEX Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "se",
    gpid: 1022,
  },
  // SABA Sports
  {
    code: "SB",
    config: "API_1",
    type: 174,
    game: "XXXXXX",
    name: "SaBa Thể Thao",
    mode: 1,
    gameType: 3,         // SPORT_BOOK
    supplier: "saba",
    gpid: 1046,
  },
  // CMD Sports
  {
    code: "CMD",
    config: "API_1",
    type: 104,
    game: "XXXXXX",
    name: "CMD Thể Thao",
    mode: 1,
    gameType: 3,        // SPORT_BOOK
    supplier: "cmd",
    gpid: 1078,
  },
  // GPI Casino
  {
    code: "GPI",
    config: "API_1",
    type: 76,
    game: "XXXXXX",
    name: "GPI Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "gpi",
    gpid: 0,
  },
  // BB Nổ hũ, Bắn Cá
  {
    code: "BB",
    config: "API_1",
    type: 79,
    game: "XXXXXX",
    name: "BB Nổ hũ, Bắn Cá",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "bb",
    gpid: 0,
  },
  // CQ9
  {
    code: "CQ9",
    config: "API_1",
    type: 16,
    game: "XXXXXX",
    name: "CQ9 Nổ hũ, Bắn Cá",
    mode: 1,
    gameType: 1,         // SLOT
    supplier: "cq9",
    gpid: 1009,
  },
  // WS168 Đá gà
  {
    code: "WS168",
    config: "API_1",
    type: 202,
    game: "XXXXXX",
    name: "Đá gà WS168",
    mode: 1,
    gameType: 8,        // FISHING/COCKFIGHTING
    supplier: "ws168",
    gpid: 1033,
  },
  // Jili
  {
    code: "JL",
    config: "API_1",
    type: 140,
    game: "XXXXXX",
    name: "JL Nổ hũ, Bắn Cá",
    mode: 1,
    gameType: 1,         // SLOT
    supplier: "jili",
    gpid: 1091,
  },
  // WM Casino
  {
    code: "WM",
    config: "API_1",
    type: 118,
    game: "XXXXXX",
    name: "WM CASINO",
    mode: 1,
    gameType: 2,         // LIVE_CASINO
    supplier: "wm",
    gpid: 1020,
  },
  // R88
  {
    code: "R88",
    config: "API_1",
    type: 162,
    game: "XXXXXX",
    name: "R88 Điện Tử",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "r88",
    gpid: "R8",
  },
  // SA Gaming
  {
    code: "SA",
    config: "API_1",
    type: 93,
    game: "XXXXXX",
    name: "SA Gaming",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "sa",
    gpid: 0,
  },
  // V8 Game 3D (LCC)
  {
    code: "LCC",
    config: "API_1",
    type: 102,
    game: "XXXXXX",
    name: "V8 Game 3D",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "v8",
    gpid: "V8",
  },
  // V8 (alias cho LCC - để tương thích)
  {
    code: "V8",
    config: "API_1",
    type: 102,
    game: "XXXXXX",
    name: "V8 Game 3D",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "v8",
    gpid: "V8",
  },
  // KA
  {
    code: "KA",
    config: "API_1",
    type: 157,
    game: "XXXXXX",
    name: "KA Nổ hũ, Bắn Cá",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "ka",
    gpid: 1102,
  },
  // Spribe
  {
    code: "SPB",
    config: "API_1",
    type: 193,
    game: "XXXXXX",
    name: "Spribe",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "spribe",
    gpid: 0,
  },
  // Pragmatic Play
  {
    code: "PP",
    config: "API_1",
    type: 39,
    game: "XXXXXX",
    name: "Pragmatic Play",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "pp",
    gpid: 1006,
  },
  // Microgaming
  {
    code: "MG",
    config: "API_1",
    type: 43,
    game: "XXXXXX",
    name: "Micro Gaming",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "mg",
    gpid: "MP",
  },
  // JDB
  {
    code: "JDB",
    config: "API_1",
    type: 55,
    game: "XXXXXX",
    name: "JDB Điện Tử",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "jdb",
    gpid: 1085,
  },
  // RSG
  {
    code: "RSG",
    config: "API_1",
    type: 138,
    game: "XXXXXX",
    name: "RSG Điện Tử",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "rsg",
    gpid: 0,
  },
  // FC (FACAI GAMING)
  {
    code: "FC",
    config: "API_1",
    type: 141,
    game: "XXXXXX",
    name: "FACAI GAMING",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "fc",
    gpid: 1079,
  },
  // FTG
  {
    code: "FTG",
    config: "API_1",
    type: 147,
    game: "XXXXXX",
    name: "FunTa Gaming",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "ftg",
    gpid: "FTG",
  },
  // PS (PLAYSTAR)
  {
    code: "PS",
    config: "API_1",
    type: 173,
    game: "XXXXXX",
    name: "PLAYSTAR",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "ps",
    gpid: 1050,
  },
  // BTG (Big Time Gaming)
  {
    code: "BTG",
    config: "API_1",
    type: 184,
    game: "XXXXXX",
    name: "Big Time Gaming",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "btg",
    gpid: 0,
  },
  // PG Soft
  {
    code: "PG",
    config: "API_1",
    type: 98,
    game: "XXXXXX",
    name: "PG Điện Tử",
    mode: 1,
    gameType: 1,          // SLOT
    supplier: "pg",
    gpid: 1007,
  },
  // SBO
  {
    code: "SBO",
    config: "API_1",
    type: 54,
    game: "XXXXXX",
    name: "SBOBET",
    mode: 1,
    gameType: 3,       // SPORT_BOOK
    supplier: "sbo",
    gpid: 1012,
  },
  // TCG_VNLOTT
  {
    code: "TCG_VNLOTT",
    config: "API_1",
    type: 420,
    game: "XXXXXX",
    name: "VNLOTT Xổ Số",
    mode: 1,
    gameType: 4,       // LOTTERY
    supplier: "tcg_vnlott",
    gpid: 0,
  },
  // RTG (RealTime Gaming) - Không có trong bc88bet, giữ lại
  {
    code: "RTG",
    config: "API_1",
    type: 1,
    game: "XXXXXX",
    name: "RealTime Gaming",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "rtg",
    gpid: 11,
  },
  // YGR (YesGetRich) - Không có trong bc88bet, giữ lại
  {
    code: "YGR",
    config: "API_1",
    type: 1,
    game: "XXXXXX",
    name: "YesGetRich",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "ygr",
    gpid: 1010,
  },
  // KM (KingMidas) - Không có trong bc88bet, giữ lại
  {
    code: "KM",
    config: "API_1",
    type: 1,
    game: "XXXXXX",
    name: "KingMidas",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "km",
    gpid: "RE",
  },
  // Live22 - Không có trong bc88bet, giữ lại
  {
    code: "LIVE22",
    config: "API_1",
    type: 1,
    game: "XXXXXX",
    name: "Live22",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "live22",
    gpid: 1150,
  },
  // TP (Tiger Play) - Không có trong bc88bet, giữ lại
  {
    code: "TP",
    config: "API_1",
    type: 1,
    game: "XXXXXX",
    name: "Tiger Play",
    mode: 1,
    gameType: 1,        // SLOT
    supplier: "tp",
    gpid: "TP",
  },
  // BG (Big Game) - Casino
  {
    code: "BG",
    config: "API_1",
    type: 1,            // TODO: Cần xác định type chính xác từ backend
    game: "XXXXXX",
    name: "BG Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "bg",
    gpid: 1004,         // BigGame từ ProviderID
  },
  // ON (OnCasino) - Casino
  {
    code: "ON",
    config: "API_1",
    type: 1,            // TODO: Cần xác định type chính xác từ backend
    game: "XXXXXX",
    name: "ON Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "on",
    gpid: "OC",         // OnCasino từ ProviderID
  },
  // Astar - Casino
  {
    code: "ASTAR",
    config: "API_1",
    type: 1,            // TODO: Cần xác định type chính xác từ backend
    game: "XXXXXX",
    name: "Astar Casino",
    mode: 1,
    gameType: 2,        // LIVE_CASINO
    supplier: "astar",
    gpid: 0,
  },
];

/**
 * Helper function: Tìm GameConfig theo supplier hoặc code
 */
export const findGameConfigBySupplier = (supplier: string): GameConfigItem | null => {
  return GameConfig.find(
    (item) =>
      item.supplier?.toLowerCase() === supplier.toLowerCase() ||
      item.code.toLowerCase() === supplier.toLowerCase()
  ) || null;
};

/**
 * Helper function: Tìm GameConfig theo code
 */
export const findGameConfigByCode = (code: string): GameConfigItem | null => {
  return GameConfig.find(
    (item) => item.code.toLowerCase() === code.toLowerCase()
  ) || null;
};

/**
 * Helper function: Tìm GameConfig theo gpid
 */
export const findGameConfigByGpid = (gpid: number | string): GameConfigItem | null => {
  return GameConfig.find(
    (item) => String(item.gpid) === String(gpid)
  ) || null;
};

