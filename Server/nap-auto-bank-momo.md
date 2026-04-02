## Tích Hợp Nạp Tự Động Bank/MoMo (FastPay)

### 1. Tổng quan
- **Mục đích**: hướng dẫn kết nối hệ thống FastPay với dịch vụ đối tác qua webhook JSON POST.
- **Phạm vi**: dùng cho mọi nền tảng (Website, Mobile App, hệ thống TMĐT) cần nhận thông tin chuyển khoản tự động.
- Hệ thống dùng JSON cho cả request và response; đối tác cần tự xây callback để nhận kết quả.

### 2. Lấy danh sách ngân hàng (`/bankin/info.ashx`)
- **Method**: `POST`.
- **Body**: `{ "PartnerCode": "<mã đối tác>" }`.
- **Trả về** `ResponseCode`, `Description`, `ResponseContent` (list ngân hàng), `Signature`.
- `ResponseContent` gồm các object `{ "BankName": "<mã>", "Name": "<tên hiển thị>" }`.
- `Signature = MD5(ResponseCode + Description + ResponseContent + partnerKey)`.

### 3. Tạo order chuyển khoản (`/bankin/Order.ashx`)
- **Method**: `POST`.
- **Body**:
  - `PartnerCode`: mã kết nối.
  - `BankCode`: mã ngân hàng người dùng chọn (hoặc `MOMO`).
  - `RefCode`: mã tham chiếu giao dịch nội bộ.
  - `Amount`: số tiền yêu cầu nạp.
  - `CallbackUrl`: URL nhận webhook (tùy chọn).
  - `Signature = MD5(PartnerCode + BankCode + Amount + RefCode + CallbackUrl + partnerKey)`.
- **ResponseContent** trả về thông tin hiển thị cho người dùng:
  - `BankName`, `BankAccountNumber`, `BankAccountName`.
  - `Amount`, `LinkOpenApp`, `LinkWebView`.
  - `QRCode`, `RefCode`, `OrderNo`.

### 4. Webhook Callback từ FastPay
- FastPay `POST` tới `CallbackUrl`.
- Payload gồm `ResponseCode`, `Description`, `ResponseContent`, `Signature`.
- `ResponseContent` chứa `RefCode`, `OrderNo`, `Amount`, `OrderInfo`.
- Kiểm `Signature = MD5(ResponseCode + Description + ResponseContent + partnerKey)` trước khi ghi nhận kết quả.
- Sau khi xử lý, phản hồi chuỗi: `1|success` nếu thành công, `-1|failed` nếu lỗi.

### 5. Bảng mã ResponseCode tiêu biểu
- `1`: Transaction Successful.
- `-1`: Transaction Failed.
- `-323`: Parameter Invalid.
- `-313`: Signature Invalid.
- `-317`: Service Not Exists.
- `-312`: Partner Not Exists/Not Active.
- `-301`: System Error.
- `-310`: Access Denied.
- `-326`: Transaction Timeout.
- `-327`: Provider Not Found.
- `-329`: Transaction Processing.
- `-356`: Bank Amount Invalid (số tiền < 50.000).
- `-300`: System Maintain.

> Chỉ mã `1` được xem là thành công; tất cả mã khác phải xử lý như thất bại và hiển thị mô tả tương ứng cho người dùng.
