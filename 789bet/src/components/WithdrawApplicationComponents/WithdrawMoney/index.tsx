/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";
import { Button, Divider, Form, Input, Modal, Radio, RadioChangeEvent } from "antd";
import { fNumberVND } from "@/utils/format-number";
import paymentService from "@/api/services/payment.service";
import { openNotification } from "@/utils/check";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useGetInfoUserBank } from "@/hooks/usePaymentService";
import { useWindowSize } from "react-use";
import { useUser } from "@/context/useUserContext";

type IBankUser = {
  id: number;
  uid: number;
  bankProvider?: string; // Có thể là bankProvide
  bankProvide?: string; // BC88BET format
  bankAccountNumber?: string; // Có thể là bankNumber
  bankNumber?: string; // BC88BET format
  bankAccountName?: string;
  bankName?: string; // BC88BET format
  bankBranch: string;
};

type IBankOfUser = {
  balance: number;
  bankUsers: IBankUser[];
  name: string;
};

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

export default function WithdrawMoney({
  listBank,
  bankOfUser,
}: {
  listBank: IItemBank[];
  bankOfUser: IBankOfUser;
}) {
  const router = useRouter();
  const { user, balance: userBalance } = useUser();
  const [bankUsing, setBankUsing] = useState<IBankUser>();
  const [form] = Form.useForm();
  const amountValue = Form.useWatch("amount", form) || 0;
  const { dataInfoUserBank, isLoading, isFetching } = useGetInfoUserBank();
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  
  // Lấy tên từ nhiều nguồn: bankOfUser > dataInfoUserBank > user context
  const userName = bankOfUser?.name || dataInfoUserBank?.name || user?.name || "";
  
  // Lấy số dư từ nhiều nguồn: userBalance (từ context) > bankOfUser.balance > user.balance
  // Ưu tiên userBalance từ context vì nó được cập nhật real-time
  const displayBalance = userBalance || bankOfUser?.balance || user?.balance || user?.coin || 0;

  const onFinish = async (values: any) => {
    try {
      if (!bankUsing) {
        openNotification({ type: "error", message: "Vui lòng chọn ngân hàng" });
        return;
      }
      
      // Tìm thông tin ngân hàng từ listBank
      const bankCode = bankUsing.bankProvider || bankUsing.bankProvide;
      const selectedBank = listBank.find((item) => 
        item.bin === bankCode ||
        item.code === bankCode ||
        item.bin?.toString() === bankCode?.toString() ||
        item.code?.toString() === bankCode?.toString()
      );
      
      // Format theo BC88BET: bankProvide, bankName, bankNumber, amount, passwd
      const bankProvide = bankCode || "";
      const bankName = selectedBank?.code || selectedBank?.short_name || selectedBank?.shortName || bankUsing.bankName || "";
      const bankNumber = bankUsing.bankAccountNumber || bankUsing.bankNumber || "";
      const amount = values.amount * 1000; // Convert từ đơn vị (100) sang VND (100,000)
      const passwd = values.withdrawPassword;
      
      console.log("WithdrawMoney - Submitting withdrawal:", {
        bankProvide,
        bankName,
        bankNumber,
        amount,
        passwd: "***",
      });
      
      const res = await paymentService.bankOutRequest({
        amount,
        withdrawPassword: passwd,
        bankProvide,
        bankName,
        bankNumber,
      });
      
      console.log("WithdrawMoney - API Response (full):", JSON.stringify(res, null, 2));
      console.log("WithdrawMoney - API Response type:", typeof res);
      console.log("WithdrawMoney - API Response status:", res?.status);
      console.log("WithdrawMoney - API Response msg:", res?.msg);
      
      // Kiểm tra nhiều format response từ BC88BET
      // BC88BET thường trả về {status: true, msg: "Success", data: [...]}
      // Hoặc có thể là {status: true, message: "Success"}
      // Hoặc có thể response trực tiếp là data nếu interceptor đã xử lý
      const responseData = res?.data || res;
      
      // Kiểm tra status từ nhiều nguồn
      const statusValue = responseData?.status ?? res?.status;
      const hasError = responseData?.error || res?.error || responseData?.status === false || res?.status === false;
      
      const isSuccess = 
        statusValue === true || 
        statusValue === "true" || 
        statusValue === 1 ||
        (res?.code === 200 || res?.code === "200") ||
        // Nếu không có error và không có status false, coi như success (trường hợp API trả về thành công nhưng không có status field)
        (!hasError && res && typeof res === "object" && statusValue !== false);
      
      console.log("WithdrawMoney - statusValue:", statusValue);
      console.log("WithdrawMoney - hasError:", hasError);
      console.log("WithdrawMoney - isSuccess:", isSuccess);
      
      const successMsg = 
        responseData?.msg || 
        responseData?.message || 
        res?.msg || 
        res?.message || 
        "Tạo lệnh rút tiền thành công. Hệ thống sẽ tự động chuyển tiền vào tài khoản của bạn";
      
      const errorMsg = 
        responseData?.msg || 
        responseData?.message || 
        res?.msg || 
        res?.message ||
        "Rút tiền thất bại";
      
      console.log("WithdrawMoney - successMsg:", successMsg);
      console.log("WithdrawMoney - errorMsg:", errorMsg);
      
      // Luôn hiển thị thông báo, không phụ thuộc vào isSuccess nếu có msg
      if (isSuccess) {
        console.log("WithdrawMoney - Showing success notification");
        // Đảm bảo thông báo luôn được hiển thị
        setTimeout(() => {
          openNotification({ type: "success", message: successMsg });
        }, 100);
        form.resetFields();
        // Refresh balance sau khi rút tiền thành công
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.log("WithdrawMoney - Showing error notification");
        // Đảm bảo thông báo lỗi luôn được hiển thị
        setTimeout(() => {
          openNotification({ type: "error", message: errorMsg });
        }, 100);
      }
    } catch (error: any) {
      console.error("WithdrawMoney error:", error);
      console.error("WithdrawMoney error response:", error?.response);
      console.error("WithdrawMoney error data:", error?.response?.data);
      
      const errorMsg = error?.response?.data?.msg || 
                      error?.response?.data?.message || 
                      error?.response?.msg ||
                      error?.message || 
                      "Có lỗi xảy ra khi rút tiền";
      
      openNotification({ type: "error", message: errorMsg });
    }
  };

  useEffect(() => {
    console.log("WithdrawMoney - bankOfUser:", bankOfUser);
    console.log("WithdrawMoney - bankUsers:", bankOfUser?.bankUsers);
    
    if (bankOfUser?.bankUsers && bankOfUser.bankUsers.length > 0) {
      const firstBank = bankOfUser.bankUsers[0];
      console.log("WithdrawMoney - Setting bankUsing:", firstBank);
      setBankUsing(firstBank);
    } else if (bankOfUser && (!bankOfUser.bankUsers || bankOfUser.bankUsers.length === 0)) {
      router.push("/account/withdraw-application?addBank=true");
    }
  }, [bankOfUser, router]);

  const onChange = (e: RadioChangeEvent) => {
    setBankUsing(e.target.value);
  };
  const { width } = useWindowSize();

  // Tìm ngân hàng từ bankProvider/bankProvide với nhiều cách so sánh
  const nameBank = React.useMemo(() => {
    if (!listBank || !bankUsing) {
      return null;
    }
    
    // Lấy bankProvider hoặc bankProvide (BC88BET format)
    const bankCode = bankUsing.bankProvider || bankUsing.bankProvide;
    
    if (!bankCode) {
      console.warn("No bankProvider or bankProvide found in bankUsing:", bankUsing);
      return null;
    }
    
    // Thử nhiều cách tìm: bin, code, short_name
    const found = listBank.find((item) => 
      item.bin === bankCode ||
      item.code === bankCode ||
      item.code?.toUpperCase() === bankCode?.toUpperCase() ||
      item.bin?.toString() === bankCode?.toString() ||
      item.bin?.toString() === bankCode ||
      item.code?.toString() === bankCode
    );
    
    console.log("Finding bank - bankCode (provider/provide):", bankCode);
    console.log("Finding bank - bankUsing:", bankUsing);
    console.log("Finding bank - found:", found);
    console.log("Finding bank - listBank sample:", listBank.slice(0, 3));
    
    return found || null;
  }, [listBank, bankUsing]);

  // Kiểm tra nếu không có bankOfUser hoặc bankUsers thì hiển thị thông báo
  if (!bankOfUser || !bankOfUser.bankUsers || bankOfUser.bankUsers.length === 0) {
    return (
      <div className="w-full bg-[#2b2b2b] p-5 rounded-[10px] max-md:p-0 max-md:bg-transparent max-md:mb-2">
        <div className="text-white text-center py-8">
          <p className="text-lg mb-4">Bạn chưa có tài khoản ngân hàng</p>
          <p className="text-sm text-gray-400">Vui lòng thêm tài khoản ngân hàng để rút tiền</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#2b2b2b] p-5 rounded-[10px] max-md:p-0 max-md:bg-transparent max-md:mb-2 max-md:h-full max-md:overflow-y-hidden">
      <Form
        className="!font-helvetica"
        name="basic"
        layout="vertical"
        form={form}
        onFinish={onFinish}>
        <div className="w-full max-w-[450px] flex flex-col !text-white  max-md:!text-black">
          <div className="bg-[#ffffff85] rounded-[6px] w-[166px] flex p-2 gap-2 items-center max-md:bg-[#ff900080] max-md:text-[20px] max-md:w-fit max-md:font-[600] max-md:py-0 max-md:mb-[16px]">
            Thông tin ngân hàng
          </div>

          <div className={`grid grid-cols-12 ${styles.itemInfo}`}>
            <div className="px-[15px] col-span-5 max-md:col-span-6">
              Họ và tên
            </div>
            <div className="px-[15px] col-span-7 text-right  max-md:col-span-6 max-h-[34px]">
              {userName ? (
                <div>{userName}</div>
              ) : (
                <Form.Item
                  name="bankAccountName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lý nhập họ và tên",
                    },
                  ]}>
                  <Input className="h-[34px]" placeholder="Nhập họ và tên" />
                </Form.Item>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-12 ${styles.itemInfo}`}>
            <div className="px-[15px] col-span-5 max-md:col-span-6">
              Ngân hàng
            </div>
            <div className="px-[15px] col-span-7 text-right max-md:col-span-6">
              {nameBank?.shortName || nameBank?.short_name || nameBank?.name || nameBank?.code || bankUsing?.bankProvider || "Chưa có thông tin"}
            </div>
          </div>

          <div className={`grid grid-cols-12 ${styles.itemInfo}`}>
            <div className="px-[15px] col-span-5 max-md:col-span-6">
              Chi nhánh ngân hàng
            </div>
            <div className="px-[15px] col-span-7 text-right max-md:col-span-6">
              {bankUsing?.bankBranch}
            </div>
          </div>

          <div className={`grid grid-cols-12 ${styles.itemInfo}`}>
            <div className="px-[15px] col-span-5  max-md:col-span-6">
              Số tài khoản
            </div>
            <div className="px-[15px] col-span-7 text-right max-md:col-span-6">
              {bankUsing?.bankAccountNumber || bankUsing?.bankNumber || "Chưa có thông tin"}
            </div>
          </div>

          <div className="px-[15px] mt-5 max-md:px-0 max-md:mt-[7px]">
            <div className="py-[10px] hover:underline cursor-pointer font-normal max-md:text-[#ff417b] max-md:py-0" onClick={() => setOpenDetail(true)}>
              Click vào đây để xem chi tiết yêu cầu
            </div>

            <div className="py-[15px] font-bold text-[16px] max-md:text-[14px]">
              Phương thức rút tiền
            </div>

            <Radio.Group
              onChange={onChange}
              value={bankUsing}
              className="flex flex-col gap-2 pb-[10px]">
              {bankOfUser?.bankUsers?.map((item) => {
                const bankCode = item.bankProvider || item.bankProvide;
                const nameBankRadio =
                  listBank &&
                  bankCode &&
                  listBank.find((itemS) => 
                    itemS.bin === bankCode ||
                    itemS.code === bankCode ||
                    itemS.code?.toUpperCase() === bankCode?.toUpperCase() ||
                    itemS.bin?.toString() === bankCode?.toString() ||
                    itemS.bin?.toString() === bankCode ||
                    itemS.code?.toString() === bankCode
                  );
                return (
                  <Radio
                    key={item.id}
                    value={item}
                    className="text-[16px] text-white max-md:text-[#808080] max-md:text-[14px]">
                    {nameBankRadio ? (nameBankRadio.shortName || nameBankRadio.short_name || nameBankRadio.name || nameBankRadio.code) : (item.bankName || bankCode || "Ngân hàng")}
                  </Radio>
                );
              })}
            </Radio.Group>

            <div className="grid grid-cols-2 pb-[10px]">
              <div className="flex flex-col">
                <div className="font-bold text-[16px] max-md:text-[#ff417b] max-md:text-[14px]">
                  Số dư tài khoản
                </div>
                <div className="max-md:text-[#ff417b]">
                  {displayBalance === 0 ? (
                    <div className="flex flex-col">
                      <p>0</p>
                      <p className="font-thin">Số dư tài khoản không đủ</p>
                    </div>
                  ) : (
                    fNumberVND(displayBalance)
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="font-bold text-[16px] max-md:text-[14px]">
                  Giới hạn rút tiền
                </div>

                <div>200 ~ 250,000</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-[16px] max-md:text-[14px]">
                Số tiền rút
              </div>
              <Form.Item
                name="amount"
                rules={[
                  {
                    required: true,
                    message: "Vui lý nhập số tiền",
                  },
                ]}>
                <Input className="h-[34px] w-1/2" type="number" />
              </Form.Item>
              <p className="-mt-[23px]">
                = {amountValue ? fNumberVND(amountValue * 1000) : 0} VND
              </p>
            </div>

            <div className="text-[16px] max-md:text-[14px] mt-2 font-bold">
              Số dư tài khoản sau khi rút tiền
            </div>

            <div className="py-[8px]">
              {amountValue ? fNumberVND(displayBalance - (amountValue * 1000)) : fNumberVND(displayBalance)}
            </div>

            <div>
              <div className="font-bold text-[16px] max-md:text-[14px]">
                Mật khẩu rút tiền
              </div>

              <Form.Item
                name="withdrawPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu rút tiền",
                  },
                ]}>
                <Input.Password
                  iconRender={(visible) =>
                    visible ? (
                      <FontAwesomeIcon
                        icon={faEye}
                        color="#888888"
                        width={22}
                        cursor="pointer"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        color="black"
                        width={22}
                        cursor="pointer"
                      />
                    )
                  }
                  className="h-[34px]"
                  placeholder="Vui lòng nhập mật khẩu rút tiền của bạn"
                />
              </Form.Item>
            </div>

            <Button
              htmlType="submit"
              className="h-[44px] w-full text-[16px] border-none bg-[#ff9800] hover:!bg-[#ff9800] text-white hover:!text-white max-md:h-fit max-md:py-2 max-md:bg-[#ffb627] max-md:text-white max-md:text-[14px] mb-[80px]">
              Rút tiền
            </Button>
          </div>
        </div>
      </Form>
      <Modal width={width < 768 ? 400 : 700} open={openDetail} footer={null} onCancel={() => setOpenDetail(false)} className={styles.modalDetail} closeIcon={<span className="text-[#337ab7] hover:underline" onClick={() => setOpenDetail(false)}>x</span>}>
        <div>
          <div className="px-4 pt-3">
            <h4 className="text-[#333333] text-base  md:text-xl"> Click vào đây để xem chi tiết yêu cầu</h4>
          </div>
          <Divider className="mb-2 mt-3" />
          <div className="alert mx-3">
            không có bất kỳ thông tin kiểm toán chi tiết nào
          </div>
          <Divider className="mt-2 mb-4" />
        </div>
        <div className="flex justify-end pr-4 pb-4">
          <Button className="btn_default" onClick={() => setOpenDetail(false)}>Đóng</Button>
        </div>
      </Modal>
    </div>
  );
}
