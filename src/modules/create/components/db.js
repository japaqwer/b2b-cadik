import Dexie from "dexie";

export const db = new Dexie("EditorDB");

db.version(2).stores({
  images: "++id, uuid, src, order",
  intro: "++id, data", // отдельная таблица для intro
});
