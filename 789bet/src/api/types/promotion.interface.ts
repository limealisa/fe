/**
 * BC88BET style: Promotion Interface
 */
export interface IpromotionResponse {
  id: string;
  title: string;
  thumbnail: string;
  isRegister: boolean;
  status: boolean;
  updatedAt: Date | string;
}

export interface PromotionDetailResponse {
  id: string;
  title: string;
  thumbnail: string;
  content?: string;
  description?: string;
  isRegister: boolean;
  status: boolean;
  updatedAt: Date | string;
  createdAt?: Date | string;
  [key: string]: any; // Cho phép các field khác từ API
}



