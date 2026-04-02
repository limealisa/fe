/* eslint-disable import/no-anonymous-default-export */
import { contentInstance } from "@/configs/CustomizeAxios";
import { ConfigPromotionEndPoint } from "./contants";

/**
 * BC88BET style: Promotion Service
 */

/**
 * Lấy tất cả chương trình khuyến mãi
 * Endpoint: /api/promotion
 * Response: { data: IpromotionResponse[] }
 */
const getAllPromotion = async () => {
  try {
    const res = await contentInstance.get(ConfigPromotionEndPoint.GET_ALL_PROMOTION);
    // BC88BET response: { data: IpromotionResponse[] } hoặc trực tiếp là array
    // Nếu res.data là array, return { data: res.data }
    // Nếu res.data.data là array, return res.data
    if (Array.isArray(res?.data)) {
      return { data: res.data };
    }
    return res?.data || { data: [] };
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return { data: [] };
  }
};

/**
 * Lấy thông tin khuyến mãi theo ID
 * Endpoint: /api/promotion/promotion-info/{id}
 */
const getPromotionById = async (id: string) => {
  try {
    const res = await contentInstance.get(`${ConfigPromotionEndPoint.GET_PROMOTION_BY_ID}/${id}`);
    return res?.data;
  } catch (error) {
    console.error("Error fetching promotion detail:", error);
    throw error;
  }
};

/**
 * Đăng ký khuyến mãi
 * Endpoint: /api/promotion/promotion-register/{id}
 * Theo BC88BET: POST với empty object {} hoặc không có body
 * Backend có thể cần empty object {} để đảm bảo request có body
 */
const registerPromotion = async (id: string) => {
  try {
    console.log("Calling register promotion API with ID:", id);
    
    // Theo BC88BET: POST với empty object {} hoặc không có body
    // Thử với empty object {} trước (axios POST cần body)
    const res = await contentInstance.post(
      `${ConfigPromotionEndPoint.REGISTER_PROMOTION}/${id}`,
      {} // Empty object như body
    );
    
    console.log("Register promotion API response:", res);
    
    // Kiểm tra nếu status: false và msg: "Missing Params"
    if (res?.status === false && res?.msg?.includes("Missing Params")) {
      // Có thể backend không cần body, thử không gửi body
      console.log("Empty body failed, trying without body...");
      // Không thể không gửi body với axios.post, nên throw error
      throw { response: { data: res } };
    }
    
    // contentInstance interceptor đã trả về response.data, nên res đã là data rồi
    return res?.data || res;
  } catch (error: any) {
    console.error("Error registering promotion:", error);
    console.error("Error response:", error?.response);
    console.error("Error data:", error?.response?.data);
    
    const errorMsg = error?.response?.data?.msg || error?.msg || error?.message || "";
    
    // Nếu lỗi là "Missing Params", có thể backend cần tham số khác
    // Nhưng vì endpoint cần id trong URL và đã thử empty body, có thể là vấn đề backend
    if (errorMsg.includes("Missing Params") || errorMsg.includes("missing")) {
      console.error("Backend requires additional parameters. Please check backend API documentation.");
    }
    
    throw error;
  }
};

export default {
  getAllPromotion,
  getPromotionById,
  registerPromotion,
};

// Export named để dễ import
export { getAllPromotion, getPromotionById, registerPromotion };

