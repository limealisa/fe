/* eslint-disable react-hooks/rules-of-hooks */
import paymentService from "@/api/services/payment.service";
import { PaymentHistoryReq } from "@/api/types/payment.interface";
import { useQuery } from "@tanstack/react-query";

export const useListPaymentService = () => {
  const {
    data: dataListPaymentType,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["getListPaymentType"],
    queryFn: () => paymentService.getListPaymentType(),
    refetchOnMount: true,
  });

  return {
    dataListPaymentType,
    isLoading,
    isFetching,
  };
};

export const useGetInfoUserBank = () => {
  const {
    data: dataInfoUserBank,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["getAllBankUser"],
    queryFn: () => paymentService.getAllBankUser(),
    refetchOnMount: true,
  });
  return {
    dataInfoUserBank,
    isLoading,
    isFetching,
    refetch,
  };
};

export const useGetPaymentHistory = (data: PaymentHistoryReq) => {
  const {
    data: dataPaymentHistory,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["getPaymentHistory", data.page, data.limit, data.dateFrom, data.dateTo, data.type],
    queryFn: () => paymentService.getPaymentHistory(data),
    refetchOnMount: true,
    retry: 1,
    retryDelay: 1000,
  });
  
  // Log để debug
  if (error) {
    console.error("useGetPaymentHistory error:", error);
  }
  
  return {
    dataPaymentHistory,
    isLoading,
    isFetching,
    refetch,
    error,
  };
};
