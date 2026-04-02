/**
 * API Logger Utility
 * Chỉ log trong development mode để tránh:
 * - Performance issues trong production
 * - Security/privacy concerns (username, game data)
 * - Console pollution
 * - Unnecessary bundle size
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Log API request với format chuẩn
 * Chỉ log trong development mode
 */
export const logApiRequest = (data: {
  method: string;
  username: string | null;
  product_type: number | string | null;
  game_code: string | null;
  game_mode: number | null;
  language: string | null;
  platform: string | null;
  request_time: string;
  source?: string; // Tên component/hook gọi log
}) => {
  if (!isDevelopment) return;

  const logData = {
    method: data.method,
    username: data.username,
    product_type: data.product_type,
    game_code: data.game_code,
    game_mode: data.game_mode,
    language: data.language,
    platform: data.platform,
    request_time: data.request_time,
  };

  const source = data.source ? ` (${data.source})` : "";
  console.log(`=== API REQUEST LOG${source} - Backend Format ===`);
  console.log(JSON.stringify(logData, null, 2));
};

/**
 * Log API response với thời gian phản hồi
 * Chỉ log trong development mode
 */
export const logApiResponse = (
  requestData: {
    method: string;
    username: string | null;
    product_type: number | string | null;
    game_code: string | null;
    game_mode: number | null;
    language: string | null;
    platform: string | null;
    request_time: string;
  },
  responseTimeMs: number,
  source?: string
) => {
  if (!isDevelopment) return;

  const responseTime = new Date().toISOString();

  const logData = {
    ...requestData,
    response_time: responseTime,
    response_time_ms: responseTimeMs,
  };

  const sourceLabel = source ? ` (${source})` : "";
  console.log(`=== API RESPONSE LOG${sourceLabel} - Backend Format ===`);
  console.log(JSON.stringify(logData, null, 2));
};

