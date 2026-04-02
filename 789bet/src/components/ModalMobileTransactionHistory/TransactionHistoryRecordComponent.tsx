/* eslint-disable @next/next/no-img-element */
"use client";

import { Button, Col, Modal, Row } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

import { useState } from "react";
import { dayNamesType2, TRANSACTION_TYPE_ENUM } from "@/constant";
import renderTypePayment from "@/constant/renderTypePayment";
import { DataExport } from "@/type";

export default function TransactionHistoryRecordComponent({
  transactionRecords,
}: any) {
  // constant
  const [openModal, setOpenModal] = useState(false);
  const [dataSelected, setDataSelected] = useState<any>();

  const handleSelected = (data: any) => {
    setOpenModal(true);
    setDataSelected(data);
  };

  const handleClose = () => {
    setOpenModal(false);
    setDataSelected(undefined);
  };

  const nowDayjs = dayjs();

  const getDayLeft = (time: any) =>
    [
      [nowDayjs.diff(time, "days"), "ngày trước"],
      [nowDayjs.diff(time, "hours"), "giờ trước"],
      [nowDayjs.diff(time, "minutes"), "phút trước"],
      [nowDayjs.diff(time, "seconds"), "giây trước"],
    ]
      .find((v) => (v[0] as number) > 0)
      ?.join(" ") ?? "vài giây trước";

  const typeKey: keyof typeof TRANSACTION_TYPE_ENUM =
    dataSelected && (dataSelected.type as keyof typeof TRANSACTION_TYPE_ENUM);

  const createdAtSelected =
    dataSelected && dayjs(dataSelected.createdAt).locale("vi");

  const createdAtSelectedText =
    dataSelected &&
    `${createdAtSelected.format(`YYYY/MM/DD`)}(${dayNamesType2[dayjs(dataSelected.createdAt).day()]}) ${createdAtSelected.format(`HH:mm:ss`)}`;

  const Record = ({ label, value, spanLabel = 4 }: any) => (
    <Row className="">
      <Col span={spanLabel} className="border p-1.5">
        <b>{label}</b>
      </Col>
      <Col span={24 - spanLabel} className="border p-1.5">
        {value}
      </Col>
    </Row>
  );

  // Hàm xác định loại giao dịch (giống logic trong transaction/page.tsx)
  const getTransactionType = (transaction: DataExport) => {
    // Kiểm tra description trước (thường chính xác nhất)
    const desc = (transaction.description || transaction.info || '').toUpperCase();
    const isWithdrawFromDesc = desc.includes('WITHDRAW') || desc.includes('RÚT');
    const isDepositFromDesc = desc.includes('DEPOSIT') || desc.includes('NẠP') || desc.includes('ADMIN') || desc.includes('TẠO LỆNH');
    
    // Kiểm tra type field từ API - transaction.type là keyof typeof TRANSACTION_TYPE_ENUM
    let typeLabel = '';
    let typeValue: string = '';
    let isWithdrawByType = false;
    let isDepositByType = false;
    
    if (transaction.type) {
      // transaction.type có thể là string key của enum hoặc object
      if (typeof transaction.type === 'string') {
        typeValue = transaction.type;
      } else if (typeof transaction.type === 'object' && transaction.type !== null) {
        typeValue = (transaction.type as any)?.defaultValue || (transaction.type as any)?.type || '';
      } else {
        typeValue = String(transaction.type);
      }
      
      // Kiểm tra trực tiếp các key enum rút tiền
      const typeUpper = typeValue.toUpperCase();
      
      // Kiểm tra các enum key rút tiền
      if (typeValue === 'ONLINE_OUT' || 
          typeValue === 'ONLINE_OUT_REFUND' ||
          typeUpper === 'ONLINE_OUT' || 
          typeUpper === 'ONLINE_OUT_REFUND' ||
          typeUpper.includes('ONLINE_OUT') || 
          (typeUpper.includes('OUT') && !typeUpper.includes('IN')) || 
          typeUpper.includes('RÚT') || 
          typeUpper.includes('WITHDRAW')) {
        isWithdrawByType = true;
        // Thử render bằng renderTypePayment
        try {
          const typeKey = typeValue as keyof typeof TRANSACTION_TYPE_ENUM;
          if (TRANSACTION_TYPE_ENUM[typeKey]) {
            typeLabel = renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey]);
          } else {
            typeLabel = 'Rút tiền trực tuyến';
          }
        } catch (e) {
          typeLabel = 'Rút tiền trực tuyến';
        }
      } 
      // Kiểm tra các enum key nạp tiền
      else if (typeValue === 'ONLINE_IN' || 
               typeValue === 'ONLINE_IN_PROMOTION' ||
               typeUpper === 'ONLINE_IN' || 
               typeUpper === 'ONLINE_IN_PROMOTION' ||
               typeUpper.includes('ONLINE_IN') || 
               (typeUpper.includes('IN') && !typeUpper.includes('OUT')) || 
               typeUpper.includes('NẠP') || 
               typeUpper.includes('DEPOSIT') || 
               typeUpper.includes('THANH TOÁN')) {
        isDepositByType = true;
        // Thử render bằng renderTypePayment
        try {
          const typeKey = typeValue as keyof typeof TRANSACTION_TYPE_ENUM;
          if (TRANSACTION_TYPE_ENUM[typeKey]) {
            typeLabel = renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey]);
          } else {
            typeLabel = 'Thanh toán trực tuyến';
          }
        } catch (e) {
          typeLabel = 'Thanh toán trực tuyến';
        }
      } 
      // Thử render bằng renderTypePayment cho các type khác
      else {
        try {
          const typeKey = typeValue as keyof typeof TRANSACTION_TYPE_ENUM;
          if (TRANSACTION_TYPE_ENUM[typeKey]) {
            typeLabel = renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey]);
            // Kiểm tra xem typeLabel có chứa "Rút" không
            if (typeLabel && typeLabel.includes('Rút')) {
              isWithdrawByType = true;
            } else if (typeLabel && (typeLabel.includes('Nạp') || typeLabel.includes('Thanh toán'))) {
              isDepositByType = true;
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    
    // Ưu tiên: description > type > amount
    let isWithdraw = false;
    let isDeposit = false;
    
    if (isWithdrawFromDesc) {
      isWithdraw = true;
      typeLabel = typeLabel || 'Rút tiền';
    } else if (isDepositFromDesc) {
      isDeposit = true;
      typeLabel = typeLabel || 'Nạp tiền';
    } else if (isWithdrawByType || (typeLabel && typeLabel.includes('Rút'))) {
      isWithdraw = true;
      typeLabel = typeLabel || 'Rút tiền';
    } else if (isDepositByType || (typeLabel && (typeLabel.includes('Nạp') || typeLabel.includes('Thanh toán')))) {
      isDeposit = true;
      typeLabel = typeLabel || 'Nạp tiền';
    } else {
      // Fallback cuối cùng: dựa vào amount
      // Nếu amount âm, chắc chắn là rút
      if (transaction.amount < 0) {
        isWithdraw = true;
        typeLabel = 'Rút tiền';
      } else {
        // Với amount dương, cần kiểm tra kỹ hơn
        // Nếu description có "Withdraw" thì là rút (dù amount dương)
        if (desc.includes('WITHDRAW')) {
          isWithdraw = true;
          typeLabel = 'Rút tiền';
        } else {
          isDeposit = true;
          typeLabel = 'Nạp tiền';
        }
      }
    }
    
    return { 
      isWithdraw, 
      isDeposit,
      label: typeLabel || (isWithdraw ? 'Rút tiền' : 'Nạp tiền')
    };
  };

  return (
    <div>
      {transactionRecords && transactionRecords?.dataExport.length > 0 ? (
        transactionRecords?.dataExport.map(
          (transaction: DataExport, index: number) => {
            const createdAt = dayjs(transaction.createdAt).locale("vi");

            const createdAtText = `${createdAt.format(`YYYY/MM/DD`)}(${dayNamesType2[dayjs(transaction.createdAt).day()]}) ${createdAt.format(`HH:mm:ss`)}`;
            const createdAtDayAgo = getDayLeft(createdAt);
            
            // Xác định loại giao dịch
            const transactionType = getTransactionType(transaction);

            return (
              <div key={transaction.id} className="border mb-8">
                <Record
                  label="ngày"
                  spanLabel={5}
                  value={
                    <p>
                      {createdAtText} -{" "}
                      <span className="text-gray-500">{createdAtDayAgo}</span>
                    </p>
                  }
                />
                <Record
                  label="số tiền"
                  spanLabel={5}
                  value={
                    <div
                      className={
                        transactionType.isWithdraw
                          ? "text-red-600"
                          : "text-green-600"
                      }>
                      {transactionType.isWithdraw ? '-' : '+'}{Math.abs(transaction.amount || 0).toLocaleString('vi-VN')}{" "}
                      <span
                        className="ps-3 text-sky-500 cursor-pointer"
                        onClick={() => handleSelected(transaction)}>
                        chi tiết
                      </span>
                    </div>
                  }
                />
                <Record
                  label="loại"
                  spanLabel={5}
                  value={
                    renderTypePayment(
                      TRANSACTION_TYPE_ENUM[transaction.type]
                    ) || transactionType.label || "Thanh toán trực tuyến"
                  }
                />
              </div>
            );
          }
        )
      ) : (
        <div className="mb-5 rounded border p-4 text-center warning">
          <FontAwesomeIcon className="mr-1" icon={faExclamationTriangle} />
          <span>Không có bất kì thông tin nào</span>
        </div>
      )}
      {dataSelected && (
        <Modal
          open={openModal}
          zIndex={10000}
          onCancel={handleClose}
          footer={<></>}
          closeIcon={<></>}>
          <div className="mb-[15px]">Chi tiết lịch sử giao dịch</div>
          <Record
            label="Số tiền giao dịch"
            spanLabel={8}
            value={
              (() => {
                const selectedType = getTransactionType(dataSelected);
                return (
                  <div
                    className={
                      selectedType.isWithdraw ? "text-red-600" : "text-green-600"
                    }>
                    {selectedType.isWithdraw ? '-' : '+'}{Math.abs(dataSelected.amount || 0).toLocaleString('vi-VN')}
                  </div>
                );
              })()
            }
          />{" "}
          <Record
            label="thời gian giao dịch"
            spanLabel={8}
            value={
              <div>
                {createdAtSelectedText} -{" "}
                <span className="text-gray-500">
                  {" "}
                  {getDayLeft(createdAtSelected)}
                </span>
              </div>
            }
          />{" "}
          <Record
            label="loại"
            spanLabel={8}
            value={
              <div> {renderTypePayment(TRANSACTION_TYPE_ENUM[typeKey])}</div>
            }
          />
          <div className="flex justify-end mt-[30px]">
            <Button onClick={handleClose}>đóng</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
