import authServicer, { getBalance } from "@/api/services/auth.servicer";
import { useQuery } from "@tanstack/react-query";

export const useGetMailBoxes = (data: {
  page: number;
  size: number;
  mailTypes: string[];
}) => {
  const {
    data: dataMailBoxes,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["getMailBoxes"],
    queryFn: () => authServicer.getMailBoxes(data),
    refetchOnMount: true,
  });
  return {
    dataMailBoxes,
    isLoading,
    isFetching,
    refetch,
  };
};
export const useGeBalance = () => {
const token=localStorage?.getItem('token')
  const {
    data: dataBalance,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["getBalance"],
    queryFn: () => getBalance(),
    enabled:!!token,
    staleTime: 30000, // Cache 30 giây - không fetch lại nếu data còn fresh
    gcTime: 5 * 60 * 1000, // Giữ cache 5 phút (trước đây là cacheTime)
    refetchOnMount: false, // Không fetch lại khi component mount nếu data đã có
    refetchOnWindowFocus: false, // Không fetch lại khi focus window
  });
  return {
    dataBalance,
    isLoading,
    isFetching,
    refetch,
  };
};