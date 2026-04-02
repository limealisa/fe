/* eslint-disable react-hooks/exhaustive-deps */
import paymentService from "@/api/services/payment.service";
import { memo, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { fNumber } from "@/utils/format-number";
import { Button, Form, Input, Radio, RadioChangeEvent, Select } from "antd";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import { useRouter } from "next/navigation";
import styles from "../BankPort/BankPort.module.css";
import isSafari from "@/utils/isSafari";
import { CheckCircleFilled, CheckCircleOutlined } from "@ant-design/icons";
import { listOptionsAgentTransfer } from "@/constant/ListOptionsAgentBank";
import { proposePriceTransfer } from "@/constant/proposePrice";
import { IInfo, IItemBankIn } from "@/type";
import { useQuery } from "@tanstack/react-query";
import listBankQR from "@/constant/ListBankQR";
import { getRandomPath } from "@/utils";
import { ridrectBankUrl } from "@/utils/check";

function TransferPort({ info }: { info: undefined | IInfo }) {
  const section = document.getElementById("boxInput");
  const router = useRouter();
  const [form] = Form.useForm();
  const [bankSelected, setBankSelected] = useState<undefined | number>(
    undefined
  );
  const [isError, setIsError] = useState(true);
  const [hasError, setHasError] = useState(true);

  const [selectedValue, setSelectedValue] = useState<undefined | number>(
    undefined
  );
  const bankValue = Form.useWatch("bank", form);

  // Danh sách ngân hàng cố định - chỉ hiển thị các ngân hàng mà FastPay hỗ trợ (giống bc88bet)
  const dataBankIn = [
    { code: "VPB", name: "NGÂN HÀNG VPBANK" },
    { code: "ACB", name: "NGÂN HÀNG Á CHÂU ACB" },
    { code: "BIDV", name: "NGÂN HÀNG ĐẦU TƯ VÀ PHÁT TRIỂN BIDV" },
    { code: "MB", name: "NGÂN HÀNG QUÂN ĐỘI MB" },
    { code: "VCB", name: "NGÂN HÀNG NGOẠI THƯƠNG VIETCOMBANK" },
    { code: "MOMO", name: "MOMO PAY" },
  ];

  const rate = info?.rate ?? 0;
  const cashoutRate = info?.cashoutRate ?? 0;
  const valueFeePoint =
    Form.useWatch("price", form) / (cashoutRate - rate) / 1000000 || 0; //điểm phí khách phải trả
  const valuePointToVnd =
    (cashoutRate - rate === 0 ? 0 : valueFeePoint) / cashoutRate || 0; //điểm phí quy đổi ra tiền
  const inputValueToVnd = Form.useWatch("price", form) / cashoutRate || 0; //điểm quy đổi ra tiền
  const realPoint = (inputValueToVnd + valuePointToVnd) * cashoutRate || 0; //số điểm thực tế khách phải chuyển khoản
  const realVND = inputValueToVnd + valuePointToVnd || 0;
  const maxMoney =
    listOptionsAgentTransfer.find((data) => data.id === bankSelected)?.max ||
    350000;

  const minMoney =
    listOptionsAgentTransfer.find((data) => data.id === bankSelected)?.min ||
    20;

  const selectOption =
    bankSelected &&
    listOptionsAgentTransfer.find((item) => item.id === bankSelected);
  const onValuesChange = (_: any, values: any) => {
    if (values.price === "" || values.bank === null) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validation: Kiểm tra số tiền
      if (!inputValueToVnd || inputValueToVnd <= 0) {
        setIsError(true);
        setIsSubmitting(false);
        alert("Vui lòng nhập số tiền cần nạp");
        return;
      }

      // Validation: Kiểm tra số tiền tối thiểu (50,000 VNĐ = 50)
      if (inputValueToVnd < 50000) {
        setIsError(true);
        setIsSubmitting(false);
        alert(`Số tiền tối thiểu là ${fNumber(50)} (tương đương 50,000 VNĐ)`);
        return;
      }

      // Validation: Kiểm tra số tiền tối đa
      if (inputValueToVnd > maxMoney * 1000) {
        setIsError(true);
        setIsSubmitting(false);
        alert(`Giới hạn 1 giao dịch không vượt quá ${fNumber(maxMoney)}`);
        return;
      }

      // Lấy bankCode từ bankValue (đã chọn trong dropdown)
      const selectedBank = dataBankIn.find((bank: any) => (bank.code || bank.bin) === bankValue);
      const bankCode = selectedBank?.code || bankValue;
      
      // Validation: Kiểm tra ngân hàng đã chọn
      if (!bankCode) {
        setIsError(true);
        setIsSubmitting(false);
        alert("Vui lòng chọn ngân hàng");
        return;
      }

      // Validation: Nếu option yêu cầu chọn ngân hàng nhưng chưa chọn
      if (selectOption && selectOption.bank && !bankValue) {
        setIsError(true);
        setIsSubmitting(false);
        alert("Vui lòng chọn ngân hàng");
        return;
      }

      // Lấy số tiền thực tế cần chuyển (đã tính phí)
      // realVND đã là số tiền VNĐ (ví dụ: 50000 = 50,000 VNĐ)
      // API FastPay nhận số tiền theo đơn vị VNĐ
      const actualAmount = Math.round(realVND);
      
      if (actualAmount <= 0 || isNaN(actualAmount)) {
        setIsError(true);
        setIsSubmitting(false);
        alert("Số tiền không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }

      // Validation: Đảm bảo số tiền tối thiểu 50,000 VNĐ
      if (actualAmount < 50000) {
        setIsError(true);
        setIsSubmitting(false);
        alert("Số tiền tối thiểu là 50,000 VNĐ");
        return;
      }

      console.log("Creating deposit request:", { 
        actualAmount, 
        bankCode, 
        inputValueToVnd, 
        realVND,
        price: values.price,
        cashoutRate,
        rate
      });
      
      // Gọi API FastPay để tạo lệnh nạp
      const response = await paymentService.createRequestAutoBank(actualAmount, bankCode);
      
      console.log("Deposit API Response:", response);
      
      // Xử lý response - có thể có format { status: true, data: {...} } hoặc trả về trực tiếp data
      const responseData = response?.data || response;
      const hasStatus = response?.status !== undefined;
      const isSuccess = hasStatus ? response.status === true : (responseData && !responseData.error);
      
      if (isSuccess && responseData) {
        // Luôn redirect đến trang transfer/bank của 789bet với dữ liệu từ FastPay
        // Lưu tất cả dữ liệu từ FastPay vào sessionStorage
        // Ưu tiên qr_data từ FastPay (URL QR code VietQR)
        const bankData = {
          bankName: responseData.bankName || selectedBank?.name || "",
          bankNumber: responseData.bankAccount || responseData.bankNumber || "",
          bankAccountName: responseData.bankAccountName || responseData.bankName || "",
          content: responseData.content || responseData.transId || "",
          qrBase64: responseData.qrBase64 || "",
          // Ưu tiên qr_data (VietQR URL) từ FastPay, sau đó mới đến qrImageUrl
          qrImageUrl: responseData.qr_data || responseData.qrImageUrl || "",
          rate: responseData.rate || cashoutRate || 0.001,
          // Lưu thêm các thông tin khác từ FastPay nếu cần
          paymentUrl: responseData.payment_url || responseData.linkWebView || responseData.linkOpenApp || "",
          bankCode: responseData.bankCode || responseData.bank || bankCode,
          amount: responseData.amount || actualAmount,
        };
        
        console.log("Saving FastPay bank data:", bankData);
        
        // Redirect đến trang transfer/bank của 789bet
        const transferUrl = `/transfer/bank?c=${bankCode}&a=${actualAmount}`;
        sessionStorage.setItem('bankTransferData', JSON.stringify(bankData));
        
        if (isSafari()) {
          router.push(transferUrl);
        } else {
          window.open(transferUrl, "_blank");
        }
      } else {
        setIsError(true);
        setIsSubmitting(false);
        const errorMsg = response?.msg || response?.message || responseData?.msg || responseData?.message || "Có lỗi xảy ra khi tạo lệnh nạp";
        alert(errorMsg);
        console.error("Deposit API error:", response);
      }
    } catch (error: any) {
      console.error("Error creating deposit request:", error);
      setIsError(true);
      setIsSubmitting(false);
      
      // Xử lý các loại lỗi khác nhau
      let errorMsg = "Có lỗi xảy ra khi tạo lệnh nạp";
      if (error?.response?.data?.msg) {
        errorMsg = error.response.data.msg;
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tự động chọn option đầu tiên khi component mount
  useEffect(() => {
    if (!bankSelected && listOptionsAgentTransfer.length > 0) {
      const firstOption = listOptionsAgentTransfer.find(item => item.bank === true);
      if (firstOption) {
        setBankSelected(firstOption.id);
      } else if (listOptionsAgentTransfer.length > 0) {
        setBankSelected(listOptionsAgentTransfer[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        if (dataBankIn && dataBankIn.length > 0) {
          // Set bankSelected thành id của option đầu tiên có sẵn nếu chưa có
          if (!bankSelected) {
            const firstOption = listOptionsAgentTransfer.find(item => item.bank === true);
            if (firstOption) {
              setBankSelected(firstOption.id);
            } else if (listOptionsAgentTransfer.length > 0) {
              setBankSelected(listOptionsAgentTransfer[0].id);
            }
          }
        }
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dataBankIn, bankSelected]);

  useEffect(() => {
    if (inputValueToVnd === 0) {
      setHasError(true);
      setIsError(true);
    } else if (
      inputValueToVnd > 0 &&
      inputValueToVnd < (minMoney * 1000 || 50000)
    ) {
      setHasError(true);
      setIsError(true);
    } else if (inputValueToVnd > maxMoney * 1000) {
      setHasError(true);
      setIsError(true);
    } else if (selectOption && selectOption.bank) {
      if (inputValueToVnd) {
        if (!bankValue) {
          setHasError(true);
          setIsError(true);
        } else {
          setHasError(false);
          setIsError(false);
        }
      }
    } else {
      setHasError(false);
      setIsError(false);
    }
  }, [inputValueToVnd, isError, hasError, bankValue, selectOption, maxMoney]);

  const validateError = () => {
    if (hasError && inputValueToVnd === 0) {
      return (
        <div className="md:text-[#a94442] text-[#ff1c4b] !font-normal text-base pb-4 ">
          <FontAwesomeIcon icon={faExclamationTriangle} fontSize={15} />
          Vui lòng điền vào số tiền gửi
        </div>
      );
    }

    if (
      hasError &&
      inputValueToVnd > 0 &&
      inputValueToVnd < (minMoney * 1000 || 20 * 1000)
    ) {
      return (
        <div className="md:text-[#a94442] text-[#ff1c4b] !font-normal text-base pb-4 ">
          <FontAwesomeIcon icon={faExclamationTriangle} fontSize={15} />
          Số tiền gửi phải trên {fNumber(minMoney)}
        </div>
      );
    }

    if (hasError && inputValueToVnd > maxMoney * 1000) {
      return (
        <div className="md:text-[#a94442] text-[#ff1c4b] !font-normal text-base  ">
          <FontAwesomeIcon icon={faExclamationTriangle} fontSize={15} />
          Giới hạn 1 giao dịch không vượt quá {fNumber(maxMoney)}
        </div>
      );
    }

    if (selectOption && selectOption.bank) {
      if (hasError && !bankValue) {
        return (
          <div className="md:text-[#a94442] text-[#ff1c4b] !font-normal text-base ">
            <FontAwesomeIcon icon={faExclamationTriangle} fontSize={15} />
            Vui lòng chọn ngân hàng
          </div>
        );
      }
    }
  };

  return (
    <div>
      {/* Giao diện màn máy tính */}
      <div className="hidden md:block font-helvetica">
        <div className={styles.container}>
          <div className={styles.listBank}>
            {listOptionsAgentTransfer.map((item, index) => (
              <div
                className={`${styles.itemBank} ${
                  bankSelected === item.id ? styles.itemActive : ""
                }`}
                onClick={() => {
                  setBankSelected(item.id);
                  section && section.scrollIntoView({ behavior: "smooth" });
                }}
                key={item.id}>
                <div className={styles.name}>{item.name}</div>
                <div className="text-white">
                  Giới hạn nạp tối thiểu{" "}
                  <span className="">{fNumber(item.min)}</span> ~{" "}
                  <span className="">{fNumber(item.max)}</span>
                </div>
                <div
                  className={`absolute bottom-4 right-4 rounded-full w-5 h-5 bg-white flex items-center justify-center`}>
                  <FontAwesomeIcon
                    icon={faCheck}
                    fontSize={14}
                    className={styles.icon}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.bb} />
          <Form
            name="basic"
            layout="vertical"
            form={form}
            onFinish={onFinish}
            style={{
              fontFamily: `"Helvetica Neue", Helvetica, Arial, sans-serif`,
            }}
            onValuesChange={onValuesChange}>
            <div
              className="grid-cols-2 py-5 px-[30px] text-white"
              id="boxInput">
              {selectOption && selectOption.bank && (
                <>
                  <span className="text-base my-[2px]">
                    Chọn ngân hàng mà bạn sử dụng :
                  </span>
                  <Form.Item name="bank" initialValue={undefined}>
                    <Select
                      value={undefined}
                      placeholder="Vui lòng chọn ngân hàng"
                      className={styles.plahover}>
                      <Select.Option value={undefined}>
                        Vui lòng chọn ngân hàng
                      </Select.Option>
                      {dataBankIn &&
                        dataBankIn.map((item: any) => (
                          <Select.Option key={item.code || item.bin} value={item.code || item.bin}>
                            {item.name}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                </>
              )}
              <div className="text-sm mb-[5px] font-h">
                Cảnh báo : Tuyệt đối không lấy thông tin ngân hàng,nội dung nạp
                từ người thứ 3 hoặc đại lý ( cẩn thận bị lừa đảo ).789BET chỉ hỗ
                trợ các thông tin hiển thị trên hệ thống ,ngoài ra tất cả là
                giả.
              </div>
              <div className=" font-h text-base">
                Số tiền được đề xuất để thanh toán：
              </div>
              <div className="flex flex-wrap ">
                {proposePriceTransfer.map((item) => (
                  <div
                    onClick={() => {
                      setSelectedValue(item);
                      form.setFieldValue("price", item);
                    }}
                    className={`${styles.itemPrice} ${item === selectedValue ? "!bg-[#ff9800] !text-white" : ""}`}
                    key={item}>
                    {fNumber(item)}
                  </div>
                ))}
              </div>
              <div>Nạp tiền :</div>

              <div className={styles.boxInput}>
                <Form.Item
                  name="price"
                  validateStatus={hasError ? "error" : ""}
                  help={validateError()}>
                  <Input
                    addonBefore={<div className="bg-gray-500" />}
                    type="number"
                    placeholder="Vui lòng nhập số tiền"
                    className={isError ? styles.input : styles.inputNotErr}
                  />
                </Form.Item>
                <div className={styles.vl}>
                  = {fNumber(inputValueToVnd)} VNĐ
                </div>
              </div>

              <div className=" font-h text-base pt-4">
                phí thủ tục:{" "}
                {fNumber((cashoutRate - rate === 0 ? 0 : valueFeePoint) || 0)}
              </div>
              <div>= {fNumber(valuePointToVnd || 0)} VNĐ</div>

              <div className="mt-1 font-h text-base">
                Thực tế chuyển khoản： {fNumber(realPoint)}
              </div>
              <div>= {fNumber(realVND)} VNĐ</div>

              <Button
                htmlType="submit"
                disabled={isError || isSubmitting}
                loading={isSubmitting}
                className={styles.btnSubmit}>
                {isSubmitting ? "Đang xử lý..." : "Thanh toán ngay bây giờ"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
      {/* Giao diện màn mobile */}
      <div className="block md:hidden font-helvetica mb-10">
        <div className="p-4 pb-8">
          {bankSelected ? (
            <>
              <Form
                name="basic"
                layout="vertical"
                form={form}
                onFinish={onFinish}
                style={{
                  fontFamily: `Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif`,
                }}
                onValuesChange={onValuesChange}>
                <div className="grid-cols-2 text-[#808080] ">
                  <div className="mb-1 break-words text-lg max-md:text-black font-bold">
                    {
                      listOptionsAgentTransfer.find(
                        (data) => data.id === bankSelected
                      )?.name
                    }
                  </div>
                  <div className="border-b border-[#ccc]">
                    <div className="mb-[12px] font-[300]">
                      Giới hạn nạp tối thiểu : &nbsp;&nbsp;&nbsp;
                      {
                        listOptionsAgentTransfer.find(
                          (data) => data.id === bankSelected
                        )?.min
                      }{" "}
                      ~
                      {
                        listOptionsAgentTransfer.find(
                          (data) => data.id === bankSelected
                        )?.max
                      }
                    </div>
                  </div>

                  <div className="text-[12px] text-black mb-[12px] font-[300]">
                    &quot; Cảnh báo : Tuyệt đối không lấy thông tin ngân
                    hàng,nội dung nạp từ người thứ 3 hoặc đại lý ( cẩn thận bị
                    lừa đảo ).789BET chỉ hỗ trợ các thông tin hiển thị trên hệ
                    thống ,ngoài ra tất cả là giả. &quot;
                  </div>
                  {selectOption && selectOption.bank && (
                    <Form.Item name="bank">
                      <div className="font-bold">
                        Chọn ngân hàng bất kì mà bạn muốn chuyển khoản
                      </div>

                      <Radio.Group
                        onChange={(e) =>
                          form.setFieldValue("bank", e.target.value)
                        }>
                        <div className="flex flex-col">
                          {dataBankIn &&
                            dataBankIn.map((item: any) => (
                              <Radio key={item.code || item.bin} value={item.code || item.bin}>
                                <span className="text-base text-[#808080] font-roHe">
                                  {item.name}
                                </span>
                              </Radio>
                            ))}
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )}

                  <div className="text-base font-bold mb-[12px] text-black">
                    Số tiền được đề xuất để thanh toán
                  </div>
                  <div className="flex flex-wrap ">
                    {proposePriceTransfer.map((item) => (
                      <div
                        onClick={() => {
                          form.setFieldValue("price", item);
                          setSelectedValue(item);
                        }}
                        className={`${selectedValue === item ? "!bg-[#ff9000]" : ""} ${styles.itemPriceMobile}`}
                        key={item}>
                        {fNumber(item)}
                      </div>
                    ))}
                  </div>
                  <div className="text-base font-bold mb-[12px] text-black">
                    Nạp tiền :
                  </div>

                  <div
                    className={styles.boxInput}
                    style={{ width: "100%", maxHeight: "70px" }}>
                    <Form.Item
                      name="price"
                      className="w-full"
                      validateStatus={hasError ? "error" : ""}
                      help={validateError()}>
                      <Input
                        addonBefore={<div className="bg-gray-500" />}
                        type="number"
                        placeholder="Vui lòng nhập số tiền"
                        className={isError ? styles.input : styles.inputNotErr}
                        style={{ width: "100%" }}
                        onClick={() => setBankSelected(bankSelected)}
                        onFocus={() => setBankSelected(bankSelected)}
                        onBlur={() => setBankSelected(bankSelected)}
                        onChange={() => setBankSelected(bankSelected)}
                      />
                    </Form.Item>

                    <div className={styles.vlMobile} style={{ fontSize: 16 }}>
                      = {fNumber(inputValueToVnd)} VNĐ
                    </div>
                  </div>
                  {inputValueToVnd ? (
                    ""
                  ) : (
                    <p className="text-[#ff1c4b] font-[400] my-2 pt-4">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        fontSize={15}
                      />
                      <span>
                        Số tiền nạp phải lớn hơn:{" "}
                        {
                          listOptionsAgentTransfer.find(
                            (data) => data.id === bankSelected
                          )?.min
                        }{" "}
                      </span>
                    </p>
                  )}
                  <div
                    className={`${inputValueToVnd ? "pt-7" : ""} text-[16px] font-[400] text-black`}>
                    {" "}
                    Phí thủ tục:{" "}
                    {fNumber(
                      (cashoutRate - rate === 0 ? 0 : valueFeePoint) || 0
                    )}
                  </div>
                  <div className="text-[16px] leading-[1] text-black font-[400]">
                    = {fNumber(valuePointToVnd || 0)} VNĐ
                  </div>

                  <div className="mt-2 text-[16px] font-[400] text-black">
                    Thực tế chuyển khoản： {fNumber(realPoint)}
                  </div>
                  <div className="text-[16px] leading-[1] text-black font-[400]">
                    = {fNumber(realVND)} VNĐ
                  </div>

                  <Button
                    htmlType="submit"
                    disabled={isError || isSubmitting}
                    loading={isSubmitting}
                    className={
                      !inputValueToVnd
                        ? styles.btnSubmitMobile
                        : hasError
                          ? styles.btnSubmitMobile
                          : styles.btnSubmitMobileSuccess
                    }>
                    {isSubmitting ? "Đang xử lý..." : "Xác Nhận Nạp Tiền"}
                  </Button>
                  <Button
                    onClick={() => setBankSelected(undefined)}
                    className={styles.buttonNextMethod}>
                    Lựa chọn kênh nạp tiền khác
                  </Button>
                </div>
              </Form>
            </>
          ) : (
            <>
              <div className="custom-deposit-tip-color text-left text-[16px] font-bold text-black mb-[12px]">
                Vui lòng nhấp vào bên dưới để chọn tài khoản thanh toán bạn muốn
                sử dụng：
              </div>
              <div className={styles.listBankMobile}>
                {listOptionsAgentTransfer.map((item) => {
                  return (
                    <div
                      className={`${styles.itemBankMobile} ${
                        bankSelected === item.id ? styles.itemActive : ""
                      }`}
                      onClick={() => {
                        setBankSelected(item.id);
                      }}
                      key={item.id}>
                      <div className={styles.itemNameMobile}>{item.name}</div>
                      <div className="text-[13px] text-gray-500">
                        Giới hạn nạp tối thiểu:&nbsp;&nbsp;&nbsp;
                        <span className="">{item.min}</span> ~{" "}
                        <span className="">{fNumber(item.max)}</span>
                      </div>
                      <i className="fas fa-check-circle custom-deposit-color-r absolute top-[15px] right-2 text-xl normal text-[#ccc]" />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default memo(TransferPort);
