/**
 * BC88BET style: Format DateTime utility
 * Format: "DD/MM/YYYY HH:mm:ss"
 */
export function formatDateTime(dateInput: string | number | Date): string {
  const date = new Date(dateInput);

  // Tính giờ UTC+7 (chênh lệch 7 * 60 phút = 420 phút)
  const utc7Offset = 7 * 60; // phút
  const localOffset = date.getTimezoneOffset(); // phút
  const totalOffset = utc7Offset + localOffset;

  const utc7Date = new Date(date.getTime() + totalOffset * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const day = pad(utc7Date.getDate());
  const month = pad(utc7Date.getMonth() + 1);
  const year = utc7Date.getFullYear();

  const hours = pad(utc7Date.getHours());
  const minutes = pad(utc7Date.getMinutes());
  const seconds = pad(utc7Date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}



