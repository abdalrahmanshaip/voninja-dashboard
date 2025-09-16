import { Timestamp } from "firebase/firestore";


export function normalizeToDate(value) {
  if (!value) return null;

  if (value.seconds && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1e6);
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return null;
}


export function normalizeToFirestoreTimestamp(value) {
  if (!value) return null;

  const date = normalizeToDate(value);
  if (!date) return null;

  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = (date.getTime() % 1000) * 1e6;

  return { seconds, nanoseconds };
}


export function formatDateLocal(date) {
  if (!date) return "";
  const pad = (n) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); 
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
