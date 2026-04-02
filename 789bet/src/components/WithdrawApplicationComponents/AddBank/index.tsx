import paymentService from "@/api/services/payment.service";
import { openNotification } from "@/utils/check";
import { Button, Form, Input, Modal, Select } from "antd";

import styles from "./AddBank.module.css";
import { useState } from "react";
/* eslint-disable @next/next/no-img-element */

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
export default function AddBank({
  listBank,
  refetch,
  setPageIndex,
}: {
  listBank: IItemBank[];
  refetch: () => void;
  setPageIndex: (value: "addBank" | "transaction") => void;
}) {
  const [errorModal, setErrorModal] = useState(false);
  const [form] = Form.useForm();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log listBank để kiểm tra
  console.log("AddBank - listBank:", listBank, "length:", listBank?.length);
  const handleDropdownVisibleChange = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const filteredBanks =
    listBank &&
    Array.isArray(listBank) &&
    listBank.filter((bank) => {
      if (!bank) return false;
      const searchLower = searchText.toLowerCase();
      const shortName = (bank?.short_name || bank?.shortName || bank?.name || "").toLowerCase();
      return shortName.includes(searchLower);
    });

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      // Tìm bank từ bankCode (bin hoặc code)
      const selectedBank = listBank.find(
        (bank) => (bank?.bin || bank?.code) === values.bankCode
      );
      
      if (!selectedBank) {
        openNotification({ type: "error", message: "Vui lòng chọn ngân hàng hợp lệ" });
        setIsSubmitting(false);
        return;
      }
      
      // Format theo BC88BET: bankProvide, bankName, bankNumber, bankBranch
      // Trong bc88bet: addBankUser(bank.code, bank.code, bankNumber, bank.name)
      const bankProvide = values.bankCode; // bin code
      const bankName = selectedBank?.code || selectedBank?.short_name || selectedBank?.shortName || values.bankCode; // code hoặc short name
      const bankNumber = values.bankAccountNumber; // Số tài khoản
      const bankBranch = values.bankBranch; // Chi nhánh (user nhập)
      
      const requestData = {
        bankCode: bankProvide, // bin code
        bankBranch: bankBranch,
        bankAccountName: bankName, // Tên ngân hàng (code)
        bankAccountNumber: bankNumber, // Số tài khoản
      };
      
      console.log("AddBank - Submitting data:", requestData);
      console.log("Selected bank:", selectedBank);
      
      const res = await paymentService.addBankUserInfo(requestData);
      console.log("AddBank - API Response:", res);
      console.log("AddBank - API Response type:", typeof res);
      console.log("AddBank - API Response keys:", res ? Object.keys(res) : "null");
      
      // Kiểm tra nhiều format response khác nhau
      const isSuccess = res?.status === true || 
                       res?.status === "true" || 
                       res?.status === 1 ||
                       (res?.data && (res.data.status === true || res.data.status === "true")) ||
                       (res?.code === 200 || res?.code === "200") ||
                       (typeof res === "object" && res !== null && !res.status && !res.msg && !res.message); // Nếu response là object rỗng hoặc không có status, coi như success
      
      const successMsg = res?.msg || 
                        res?.message || 
                        res?.data?.msg || 
                        res?.data?.message ||
                        "Thêm ngân hàng thành công";
      
      const errorMsg = res?.msg || 
                      res?.message || 
                      res?.data?.msg || 
                      res?.data?.message ||
                      "Thêm ngân hàng thất bại";
      
      if (isSuccess) {
        openNotification({ type: "success", message: successMsg });
        form.resetFields();
        // Refetch danh sách ngân hàng của user, nhưng không throw error nếu lỗi
        setTimeout(async () => {
          try {
            await refetch();
            setPageIndex("transaction");
          } catch (refetchError) {
            console.warn("Refetch bank list error (non-critical):", refetchError);
            // Vẫn chuyển sang trang transaction dù refetch lỗi
            setPageIndex("transaction");
          }
        }, 500);
      } else {
        openNotification({ type: "error", message: errorMsg });
      }
    } catch (error: any) {
      console.error("AddBank error:", error);
      console.error("AddBank error response:", error?.response);
      console.error("AddBank error data:", error?.response?.data);
      
      const errorMsg = error?.response?.data?.msg || 
                      error?.response?.data?.message || 
                      error?.response?.msg ||
                      error?.message || 
                      "Có lỗi xảy ra khi thêm ngân hàng";
      
      openNotification({ type: "error", message: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankCodeValue = Form.useWatch("bankCode", form) || 0;
  const bankBranchValue = Form.useWatch("bankBranch", form) || 0;
  const bankAccountNumberValue = Form.useWatch("bankAccountNumber", form) || 0;

  return (
    <div className="w-full bg-[#2b2b2b] p-5 rounded-[10px] flex flex-col max-md:bg-transparent max-md:text-[#808080] max-md:p-0 max-md:pb-[50px]">
      <div className="flex gap-2">
        <div className="bg-[#ff9800] rounded-[10px] flex w-[146px] p-2 gap-2 items-center max-md:p-0 max-md:h-9 max-md:w-[120px] max-md:justify-center max-md:text-[14px]">
          <i className={`${styles.iconBankdk} block`} />
          <span className="text-white">Ngân hàng</span>
        </div>
        <div
          onClick={() => setErrorModal(true)}
          className="bg-[#ff9800] rounded-[10px] flex w-[146px] p-2 gap-2 items-center max-md:p-0 max-md:h-9 max-md:w-[120px] max-md:justify-center justify-center max-md:text-[14px]">
          <i className={styles.iconUSDT} />
          <span className="text-white">USDT</span>
        </div>
      </div>
      <div className="w-full max-w-[450px] mt-8 max-md:mt-1">
        <Form name="basic" layout="vertical" form={form} onFinish={onFinish}>
          <div className="font-bold text-white mb-[5px] text-[16px] max-md:text-[#808080] max-md:text-[14px]">
            Ngân hàng
          </div>
          <Form.Item
            name="bankCode"
            rules={[
              {
                required: true,
              },
            ]}>
            <Select
              showSearch
              open={isDropdownOpen}
              onClick={handleDropdownVisibleChange}
              placeholder={
                <div className={styles.optionsBankPlaceholder}>
                  Vui lòng chọn ngân hàng
                </div>
              }
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0
              }
              dropdownStyle={{ padding: 0, borderRadius: 4 }}
              // options={
              //   listBank &&
              //   listBank.map((item) => ({
              //     label: item?.short_name,
              //     value: item?.bin,
              //   }))
              // }
              dropdownRender={(menu) => (
                <div>
                  <div
                    className={styles.search}
                    onClick={(event) => event.stopPropagation()}>
                    <Input
                      type="search"
                      placeholder="Vui lòng chọn ngân hàng"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      suffix={<i className="fas fa-search" />}
                    />
                  </div>
                  {menu}
                </div>
              )}>
              {filteredBanks && filteredBanks.length > 0 ? (
                filteredBanks.map((item, index) => (
                  <Select.Option value={item?.bin || item?.code} key={item?.id || index}>
                    {item?.short_name || item?.shortName || item?.name || ""}
                  </Select.Option>
                ))
              ) : (
                <Select.Option value="" disabled>
                  {listBank && listBank.length > 0 
                    ? "Không tìm thấy ngân hàng" 
                    : "Không có dữ liệu ngân hàng"}
                </Select.Option>
              )}
            </Select>
          </Form.Item>

          <div className="font-bold text-white mb-[5px] text-[16px] max-md:text-[#808080] max-md:text-[14px]">
            Chi nhánh ngân hàng
          </div>
          <Form.Item
            name="bankBranch"
            className={styles.styledInput}
            rules={[
              {
                required: true,
              },
            ]}>
            <Input placeholder="ví dụ : thành phố hồ chí minh" />
          </Form.Item>

          <div className="font-bold text-white mb-[5px] text-[16px] max-md:text-[#808080] max-md:text-[14px]">
            Số tài khoản
          </div>
          <Form.Item
            name="bankAccountNumber"
            className={styles.styledInput}
            rules={[
              {
                required: true,
              },
            ]}>
            <Input placeholder="ví dụ : 043423423423423475575" />
          </Form.Item>

          <Button
            disabled={
              (bankCodeValue && bankBranchValue && bankAccountNumberValue && !isSubmitting)
                ? false
                : true
            }
            loading={isSubmitting}
            className="h-[44px] w-full text-[16px] border-none disabled:!bg-[#ff9800] disabled:!text-white bg-[#ff9800] hover:!bg-[#ff9800] text-white hover:!text-white max-md:h-fit max-md:py-2 max-md:bg-[#7bbfd4] max-md:text-white max-md:text-[14px]"
            htmlType="submit">
            {isSubmitting ? "Đang xử lý..." : "gửi đi"}
          </Button>
        </Form>
      </div>

      <Modal
        open={errorModal}
        onCancel={() => setErrorModal(false)}
        onOk={() => setErrorModal(false)}
        title="Thông báo"
        footer={null}>
        <div>Chức năng đang bảo trì, vui lòng quay lại sau!</div>
      </Modal>
    </div>
  );
}
