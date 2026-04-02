import { API_GATE } from "@/constant/gate";

export const ConfigAuthEndPoint = {
  LOGIN: "/auth/login",
  VISITOR_IPS: "/auth/getVisitorIPs",
  ME: "/api/auth/me", // BC88BET: baseURL là https://api.bc88bet.com, endpoint là /api/auth/me
  REGISTER: "/auth/register",
  WITH_DRAWAL_CONDITION: "/auth/getWithdrawalCondition",
  UPDATE_WITHDRAWAL_PASSWORD: "/auth/updateWithdrawPassword",
  UPDATE_SIGN_IN_PASSWORD: "/auth/change-password",
  UPDATE_PHONE_NUMBER: "/auth/updatePhoneNumber",
  GET_BALANCE: "/auth/getBalance",
  CHANGE_PASSSWORD: "/auth/change-password",
  UPDATE_USER_INFO: '/auth/updateUserInfo'
};

export const ConfigCapchaEndPoint = {
  LOG: `/auth/captchaForLogin?gate=${API_GATE}`,
  REG: `/auth/captchaForRegister?gate=${API_GATE}`,
};

export const ConfigGameEndPoint = {
  GETGAMELIST: "/game/game-avalible",
  LAUCHGAME: "game/launchgame",
  GAME_AVALIBLE_NEW: "/game/game-avalible-new",
  GAME_AVALIBLE_NEW_V2: "/game/game-avalible-new-v2",
  FAVORITE_ADD: "/game/favorite/add",
  FAVORITE_DELETE: "/game/favorite/delete",
  FAVORITE_LIST: "/game/favorite/all",
};

export const ConfigMailBoxEndPoint = {
  MY_MAIL: "/mail-boxes",
};

export const ConfigTransactionHistoryEndPoint = {
  LIST_TRANSACTION: "/transaction/histories",
};

export const BetRecordEndPoint = {
  BET_RECORD: "/api/game/history", // BC88BET style endpoint
};

export const ConfigPaymentEndPoint = {
  LIST_PAYMENT_TYPE: "/payment/listConfig",
  LIST_BANK_IN: "/payment/listBanking",
  LIST_BANK_OUT: "/payment/listBankOut",
  BANK_REQUEST: "/payment/bankRequest",
  MOMO_REQUEST: "/payment/momoRequest",
  CARD_REQUEST: "/payment/cardRequest",
  LIST_CARD_TYPE: "/payment/listCardType",
  LIST_ALL_BANK_VN: "/payment/getAllVNBanks",
  ADD_BANK_USER_INFO: "/api/payment/userAddBank", // BC88BET style endpoint
  GET_ALL_BANK_USER: "/api/payment/getListUserBank", // BC88BET style endpoint
  BANK_OUT_REQUEST: "/api/payment/createRequestWithdraw", // BC88BET style endpoint
  PAYMENT_HISTORY: "/api/payment/history", // BC88BET style
  SEND_CRYPTO_TRX: "/payment/sendCryptoTrx",
  GET_USDT_PRICE: "/payment/getUsdtPrice",
  GET_CRYTO_TO_INFO: "/payment/getCryptoInfo",
  LIST_AUTO_BANK_DEPOSIT: "/api/payment/getListAutoBankDeposit", // FastPay bank list
  CREATE_REQUEST_AUTO_BANK: "/api/payment/createRequestAutoBank", // FastPay create deposit request
};

export const CurrentVipInfo = {
  CURRENT_VIP_INFO: "/vip/getCurrentVipInfo",
  UPGRADE_HISTORY: "/vip/getUpgradeHistory",
};

export const ConfigWalletEndPoint = {
  GET_WALLET_GAME_BY_USER: "/wallet/game-by-user",
  WALLET_TRANSFER: "/wallet/transfer",
};

export const ConfigPromotionEndPoint = {
  GET_ALL_PROMOTION: "/api/promotion", // BC88BET style
  GET_PROMOTION_BY_ID: "/api/promotion/promotion-info", // BC88BET style
  REGISTER_PROMOTION: "/api/promotion/promotion-register", // BC88BET style
};
