"use client";

import authServicer from "@/api/services/auth.servicer";
import paymentService from "@/api/services/payment.service";
import AddBank from "@/components/WithdrawApplicationComponents/AddBank";
import ChangeMoneyPassword from "@/components/WithdrawApplicationComponents/ChangeMoneyPassword";
import LayoutDeposit from "@/components/WithdrawApplicationComponents/LayoutDeposit";
import WithdrawMoney from "@/components/WithdrawApplicationComponents/WithdrawMoney";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type IItemBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
};

// Danh sách ngân hàng cố định từ bc88bet
const FALLBACK_BANKS: IItemBank[] = [
  { id: 1, name: "NGÂN HÀNG VPBANK", code: "VPB", bin: "970432", shortName: "VPBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "VPBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 2, name: "NGÂN HÀNG Á CHÂU ACB", code: "ACB", bin: "970416", shortName: "ACB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "ACB", support: 1, isTransfer: 1, swift_code: "" },
  { id: 3, name: "NGÂN HÀNG ĐẦU TƯ VÀ PHÁT TRIỂN BIDV", code: "BIDV", bin: "970418", shortName: "BIDV", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "BIDV", support: 1, isTransfer: 1, swift_code: "" },
  { id: 4, name: "NGÂN HÀNG QUÂN ĐỘI MB", code: "MB", bin: "970422", shortName: "MB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "MB", support: 1, isTransfer: 1, swift_code: "" },
  { id: 5, name: "NGÂN HÀNG NGOẠI THƯƠNG VIETCOMBANK", code: "VCB", bin: "970436", shortName: "VIETCOMBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "VIETCOMBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 6, name: "NGÂN HÀNG CÔNG THƯƠNG VIETINBANK", code: "VTB", bin: "970415", shortName: "VIETINBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "VIETINBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 7, name: "NGÂN HÀNG NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN AGRIBANK", code: "AGB", bin: "970405", shortName: "AGRIBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "AGRIBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 8, name: "NGÂN HÀNG SÀI GÒN THƯƠNG TÍN SACOMBANK", code: "STB", bin: "970403", shortName: "SACOMBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "SACOMBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 9, name: "NGÂN HÀNG TIÊN PHONG TP BANK", code: "TPB", bin: "970423", shortName: "TPBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "TPBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 10, name: "NGÂN HÀNG ĐÔNG Á EAB", code: "EAB", bin: "970431", shortName: "EAB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "EAB", support: 1, isTransfer: 1, swift_code: "" },
  { id: 11, name: "NGÂN HÀNG KỸ THƯƠNG TECHCOMBANK", code: "TCB", bin: "970407", shortName: "TECHCOMBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "TECHCOMBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 12, name: "NGÂN HÀNG QUỐC DÂN NCB", code: "NCB", bin: "970419", shortName: "NCB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "NCB", support: 1, isTransfer: 1, swift_code: "" },
  { id: 13, name: "NGÂN HÀNG PHÁT TRIỂN THÀNH PHỐ HỒ CHÍ MINH HDBANK", code: "HDB", bin: "970437", shortName: "HDBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "HDBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 14, name: "NGÂN HÀNG PHƯƠNG ĐÔNG OCB", code: "OCB", bin: "970448", shortName: "OCB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "OCB", support: 1, isTransfer: 1, swift_code: "" },
  { id: 15, name: "NGÂN HÀNG VIỆT NAM THỊNH VƯỢNG VP BANK", code: "VPB", bin: "970432", shortName: "VPBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "VPBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 16, name: "NGÂN HÀNG XUẤT NHẬP KHẨU EXIMBANK", code: "EIB", bin: "970431", shortName: "EXIMBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "EXIMBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 17, name: "NGÂN HÀNG BẢO VIỆT BAOVIET BANK", code: "BVB", bin: "970438", shortName: "BAOVIET BANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "BAOVIET BANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 18, name: "NGÂN HÀNG VIỆT Á VIETABANK", code: "VAB", bin: "970427", shortName: "VIETABANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "VIETABANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 19, name: "NGÂN HÀNG LIÊN VIỆT POST LIENVIETBANK", code: "LPB", bin: "970449", shortName: "LIENVIETBANK", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "LIENVIETBANK", support: 1, isTransfer: 1, swift_code: "" },
  { id: 20, name: "NGÂN HÀNG SÀI GÒN SCB", code: "SCB", bin: "970429", shortName: "SCB", logo: "", transferSupported: 1, lookupSupported: 1, short_name: "SCB", support: 1, isTransfer: 1, swift_code: "" },
];

type IBankUser = {
  id: number;
  uid: number;
  bankProvider: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankBranch: string;
};

type IBankOfUser = {
  balance: number;
  bankUsers: IBankUser[];
  name: string;
};

export default function RutTien() {
  const [statusWithDraw, setStatusWithDraw] = useState({
    hasBankUserInfo: false,
    hasWithdrawPassword: false,
  });

  const [listBank, setListBank] = useState<IItemBank[]>(FALLBACK_BANKS);

  const [pageIndex, setPageIndex] = useState<"addBank" | "transaction">(
    "addBank"
  );

  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout sau 5 giây để tránh loading vô hạn
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   if (!statusWithDraw.hasBankUserInfo &&
  //     bankOfUser.bankUsers.length < 2) {

  //   }
  // }, [pageIndex]);

  const { data, isLoading, isError: isErrorCondition } = useQuery({
    queryFn: () => {
      return authServicer.getWithdrawalCondition();
    },
    queryKey: ["getWithdrawalCondition"],
    retry: 1,
    retryDelay: 1000,
  });

  // Tắt query API vì đang lỗi, chỉ sử dụng FALLBACK_BANKS
  // const { data: allBank, isError: isErrorBank, isLoading: isLoadingAllBank, error: errorBank } = useQuery({
  //   queryFn: async () => {
  //     try {
  //       const result = await paymentService.getAllVNBanks();
  //       return result;
  //     } catch (error) {
  //       console.error("getAllVNBanks failed, trying getListBankOut as fallback:", error);
  //       try {
  //         const fallbackResult = await paymentService.getListBankOut();
  //         console.log("getListBankOut fallback result:", fallbackResult);
  //         return fallbackResult;
  //       } catch (fallbackError) {
  //         console.error("getListBankOut fallback also failed:", fallbackError);
  //         throw error;
  //       }
  //     }
  //   },
  //   queryKey: ["getAllVNBanks"],
  //   retry: 1,
  //   retryDelay: 1000,
  // });
  
  // Sử dụng FALLBACK_BANKS trực tiếp, không cần gọi API
  const allBank = null;
  const isErrorBank = false;
  const isLoadingAllBank = false;
  const errorBank = null;

  const { data: userInfoBank, refetch, isLoading: isLoadingBank, isError: isErrorUserBank } = useQuery({
    queryFn: () => {
      return paymentService.getAllBankUser();
    },
    queryKey: ["getAllBankUser"],
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (data) {
      setStatusWithDraw(data);
    } else if (loadingTimeout && !isLoading && !data) {
      // Nếu đã timeout và không có data, giả định người dùng đã có mật khẩu để tránh kẹt
      setStatusWithDraw(prev => ({
        ...prev,
        hasWithdrawPassword: true,
      }));
    }
  }, [data, loadingTimeout, isLoading]);

  // Sử dụng FALLBACK_BANKS trực tiếp, không cần useEffect
  // useEffect(() => {
  //   if (allBank) {
  //     if (Array.isArray(allBank)) {
  //       if (allBank.length > 0) {
  //         setListBank(allBank);
  //       } else {
  //         setListBank(FALLBACK_BANKS);
  //       }
  //     } else if (allBank && typeof allBank === 'object' && 'data' in allBank && Array.isArray((allBank as any).data)) {
  //       const bankData = (allBank as any).data;
  //       if (bankData.length > 0) {
  //         setListBank(bankData);
  //       } else {
  //         setListBank(FALLBACK_BANKS);
  //       }
  //     } else {
  //       setListBank(FALLBACK_BANKS);
  //     }
  //   } else {
  //     setListBank(FALLBACK_BANKS);
  //   }
  // }, [allBank, isErrorBank, isLoadingAllBank, errorBank]);
  
  // Đảm bảo listBank luôn có giá trị
  useEffect(() => {
    if (listBank.length === 0) {
      setListBank(FALLBACK_BANKS);
    }
  }, []);

  useEffect(() => {
    if (userInfoBank && userInfoBank.bankUsers) {
      setPageIndex(
        userInfoBank.bankUsers.length > 0 ? "transaction" : "addBank"
      );
    }
  }, [userInfoBank]);

  // Default bankOfUser để tránh lỗi undefined
  const defaultBankOfUser: IBankOfUser = {
    balance: 0,
    bankUsers: [],
    name: "",
  };

  // Chỉ hiển thị loading khi thực sự đang loading lần đầu và chưa có data
  // Nếu có lỗi, đã có data, hoặc đã timeout thì không chặn render
  // Bỏ isLoadingAllBank vì không còn gọi API banks nữa
  const isInitialLoading = !loadingTimeout && 
                          ((isLoading && !data && !isErrorCondition) || 
                          (isLoadingBank && !userInfoBank && !isErrorUserBank));

  if (isInitialLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center min-h-[400px]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  } else if (!statusWithDraw.hasWithdrawPassword) {
    return (
      <ChangeMoneyPassword />
    );
  } else {
    const bankOfUserData = userInfoBank || defaultBankOfUser;
    return (
      <LayoutDeposit
        bankOfUser={bankOfUserData}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}>
        {pageIndex === "addBank" ? (
          <AddBank
            listBank={listBank}
            refetch={refetch}
            setPageIndex={setPageIndex}
          />
        ) : (
          <WithdrawMoney listBank={listBank} bankOfUser={bankOfUserData} />
        )}
      </LayoutDeposit>
    );
  }
}
