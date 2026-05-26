import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

import {
  cropProducts,
  crops,
  expences,
  expencesType,
  harvestings,
  orderLines,
  orders,
  plantings,
  products,
  sprayings,
  users,
  wastes,
} from "./schema";

dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const LOAD_SIZE = {
  users: 600,
  crops: 160,
  products: 900,
  cropProducts: 1800,
  plantings: 2200,
  sprayings: 1800,
  harvestings: 2200,
  wastes: 1200,
  expences: 1200,
  orders: 3000,
  orderLines: 7500,
};

const firstNames = [
  "Иван",
  "Мария",
  "Георги",
  "Елена",
  "Петър",
  "Анна",
  "Николай",
  "Десислава",
  "Стоян",
  "Радостина",
  "Димитър",
  "Калина",
  "Борис",
  "Силвия",
  "Тодор",
  "Виктория",
];

const lastNames = [
  "Петров",
  "Иванова",
  "Георгиев",
  "Стоянова",
  "Димитров",
  "Николова",
  "Тодоров",
  "Костова",
  "Маринов",
  "Ангелова",
  "Христов",
  "Павлова",
];

const cities = [
  "София",
  "Пловдив",
  "Стара Загора",
  "Варна",
  "Бургас",
  "Русе",
  "Плевен",
  "Добрич",
  "Хасково",
  "Сливен",
  "Ямбол",
  "Пазарджик",
];

const streets = [
  "ул. Зеленчукова градина",
  "ул. Розова долина",
  "бул. България",
  "ул. Слънчоглед",
  "ул. Овощна",
  "ул. Тракия",
  "ул. Изворна",
  "ул. Пазарна",
];

const cropNames = [
  "Домати",
  "Краставици",
  "Пипер",
  "Картофи",
  "Лук",
  "Моркови",
  "Зеле",
  "Тиквички",
  "Патладжан",
  "Маруля",
  "Спанак",
  "Фасул",
  "Грах",
  "Чесън",
  "Царевица",
  "Тиква",
];

const varieties = [
  "Розово сърце",
  "Рома",
  "Гергана",
  "Куртовска капия",
  "Самоковски",
  "Балкан",
  "Ранен сорт",
  "Късен сорт",
  "Био селекция",
  "Семеен сорт",
];

const productNames = [
  "Лютеница",
  "Доматен сок",
  "Туршия",
  "Кисели краставички",
  "Печен пипер",
  "Сушени домати",
  "Зеленчуков микс",
  "Консервиран фасул",
  "Замразена царевица",
  "Пюре от тиква",
];

const expenseTypes = [
  "Гориво",
  "Семена",
  "Разсад",
  "Торове",
  "Препарати",
  "Вода",
  "Опаковки",
  "Транспорт",
  "Ремонт",
  "Електричество",
  "Инструменти",
  "Работна ръка",
];

const orderStatuses = ["Pending", "Accepted", "Completed", "Cancelled"] as const;

type UserInsert = typeof users.$inferInsert;
type CropInsert = typeof crops.$inferInsert;
type ProductInsert = typeof products.$inferInsert;
type CropProductInsert = typeof cropProducts.$inferInsert;
type PlantingInsert = typeof plantings.$inferInsert;
type SprayingInsert = typeof sprayings.$inferInsert;
type HarvestingInsert = typeof harvestings.$inferInsert;
type WasteInsert = typeof wastes.$inferInsert;
type ExpenceTypeInsert = typeof expencesType.$inferInsert;
type ExpenceInsert = typeof expences.$inferInsert;
type OrderInsert = typeof orders.$inferInsert;
type OrderLineInsert = typeof orderLines.$inferInsert;

function dateString(monthOffset: number, dayOffset: number) {
  const date = new Date(Date.UTC(2026, monthOffset, 1 + dayOffset));
  return date.toISOString().slice(0, 10);
}

function dateTime(monthOffset: number, dayOffset: number) {
  return new Date(Date.UTC(2026, monthOffset, 1 + dayOffset, 8 + (dayOffset % 10), dayOffset % 60));
}

function money(value: number) {
  return value.toFixed(2);
}

function quantity(value: number) {
  return value.toFixed(3);
}

async function insertInChunks<T>(
  label: string,
  rows: T[],
  insertChunk: (chunk: T[]) => Promise<unknown>,
  chunkSize = 500
) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    await insertChunk(rows.slice(index, index + chunkSize));
  }

  console.log(`${label}: ${rows.length} records`);
}

async function insertReturningIds<T>(
  label: string,
  rows: T[],
  insertChunk: (chunk: T[]) => Promise<{ id: number }[]>,
  chunkSize = 500
) {
  const ids: number[] = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    const inserted = await insertChunk(rows.slice(index, index + chunkSize));
    ids.push(...inserted.map((row) => row.id));
  }

  console.log(`${label}: ${rows.length} records`);
  return ids;
}

async function clearTables() {
  await db.execute(sql`
    truncate table
      "order_lines",
      "orders",
      "crop_products",
      "products",
      "expences",
      "expences_type",
      "wastes",
      "plantings",
      "sprayings",
      "harvestings",
      "crops",
      "users"
    restart identity cascade
  `);
}

async function seed() {
  console.log("Clearing tables...");
  await clearTables();

  const passwordHash = await bcrypt.hash("password123", 10);

  const userRows: UserInsert[] = Array.from({ length: LOAD_SIZE.users }, (_, index) => {
    const city = cities[index % cities.length];
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];

    return {
      name: `${firstName} ${lastName}`,
      email: `klient.${String(index + 1).padStart(4, "0")}@example.bg`,
      passwordHash,
      role: index === 0 ? "admin" : "user",
      shippingCity: city,
      shippingStreet: `${streets[index % streets.length]} ${12 + index}`,
      shippingPostalCode: String(1000 + (index % 8000)),
      shippingCountry: "България",
    };
  });

  const userIds = await insertReturningIds("Потребители", userRows, (chunk) =>
    db.insert(users).values(chunk).returning({ id: users.id })
  );

  const cropRows: CropInsert[] = Array.from({ length: LOAD_SIZE.crops }, (_, index) => {
    const name = cropNames[index % cropNames.length];
    const variety = varieties[index % varieties.length];
    const price = 1.4 + (index % 28) * 0.35;

    return {
      name: `${name} ${Math.floor(index / cropNames.length) + 1}`,
      variety,
      forSale: index % 4 !== 0,
      price: money(price),
      description: `${name} сорт ${variety}, отгледани в семейната ферма с редовна грижа и сезонна реколта.`,
    };
  });

  const cropIds = await insertReturningIds("Култури", cropRows, (chunk) =>
    db.insert(crops).values(chunk).returning({ id: crops.id })
  );

  const productRows: ProductInsert[] = Array.from({ length: LOAD_SIZE.products }, (_, index) => ({
    name: `${productNames[index % productNames.length]} партида ${index + 1}`,
    date: dateString(4 + (index % 5), index % 27),
    quantity: quantity(12 + (index % 80) * 1.75),
    price: money(3.5 + (index % 35) * 0.55),
  }));

  const productIds = await insertReturningIds("Продукти", productRows, (chunk) =>
    db.insert(products).values(chunk).returning({ id: products.id })
  );

  const cropProductRows: CropProductInsert[] = [];
  const cropProductKeys = new Set<string>();
  let cropProductCursor = 0;

  while (cropProductRows.length < LOAD_SIZE.cropProducts) {
    const cropId = cropIds[(cropProductCursor * 7) % cropIds.length];
    const productId = productIds[(cropProductCursor * 11) % productIds.length];
    const key = `${cropId}:${productId}`;

    if (!cropProductKeys.has(key)) {
      cropProductKeys.add(key);
      cropProductRows.push({
        cropId,
        productId,
        quantity: quantity(1 + (cropProductCursor % 25) * 0.8),
      });
    }

    cropProductCursor += 1;
  }

  await insertInChunks("Състав на продукти", cropProductRows, (chunk) =>
    db.insert(cropProducts).values(chunk)
  );

  const plantingRows: PlantingInsert[] = Array.from({ length: LOAD_SIZE.plantings }, (_, index) => ({
    cropId: cropIds[index % cropIds.length],
    date: dateString(2 + (index % 2), index % 28),
    quantity: quantity(40 + (index % 120) * 1.5),
    type: index % 5 === 0 ? "кг" : "корен",
    createdFrom: "seed-load",
    description: `Посев на леха ${index + 1} с контролирано поливане и отбелязана партида разсад.`,
  }));

  await insertInChunks("Посеви", plantingRows, (chunk) => db.insert(plantings).values(chunk));

  const sprayingRows: SprayingInsert[] = Array.from({ length: LOAD_SIZE.sprayings }, (_, index) => ({
    cropId: cropIds[(index * 3) % cropIds.length],
    date: dateString(3 + (index % 4), index % 28),
    quantity: quantity(0.5 + (index % 12) * 0.25),
    createdFrom: "seed-load",
    description: `Пръскане с биологичен препарат срещу болести, обход ${index + 1}.`,
  }));

  await insertInChunks("Пръскания", sprayingRows, (chunk) => db.insert(sprayings).values(chunk));

  const harvestingRows: HarvestingInsert[] = Array.from({ length: LOAD_SIZE.harvestings }, (_, index) => ({
    cropId: cropIds[(index * 5) % cropIds.length],
    date: dateString(4 + (index % 5), index % 28),
    quantity: quantity(18 + (index % 160) * 2.25),
    createdFrom: "seed-load",
    description: `Реколта от ред ${index + 1}, сортирана за директна продажба и преработка.`,
  }));

  await insertInChunks("Реколти", harvestingRows, (chunk) => db.insert(harvestings).values(chunk));

  const wasteRows: WasteInsert[] = Array.from({ length: LOAD_SIZE.wastes }, (_, index) => ({
    cropId: cropIds[(index * 9) % cropIds.length],
    date: dateString(4 + (index % 5), index % 28),
    quantity: quantity(0.8 + (index % 35) * 0.45),
    type: index % 3 === 0 ? "корен" : "кг",
    createdFrom: "seed-load",
    description: `Загуби при сортиране и транспорт за партида ${index + 1}.`,
  }));

  await insertInChunks("Загуби", wasteRows, (chunk) => db.insert(wastes).values(chunk));

  const expenseTypeRows: ExpenceTypeInsert[] = expenseTypes.map((name) => ({ name }));
  const expenseTypeIds = await insertReturningIds("Типове разходи", expenseTypeRows, (chunk) =>
    db.insert(expencesType).values(chunk).returning({ id: expencesType.id })
  );

  const expenseRows: ExpenceInsert[] = Array.from({ length: LOAD_SIZE.expences }, (_, index) => ({
    name: `${expenseTypes[index % expenseTypes.length]} ${index + 1}`,
    expencesTypeId: expenseTypeIds[index % expenseTypeIds.length],
    date: dateString(index % 10, index % 28),
    value: money(15 + (index % 140) * 2.75),
    description: `Разход за ${expenseTypes[index % expenseTypes.length].toLowerCase()} по сезонна дейност ${index + 1}.`,
  }));

  await insertInChunks("Разходи", expenseRows, (chunk) => db.insert(expences).values(chunk));

  const orderRows: OrderInsert[] = Array.from({ length: LOAD_SIZE.orders }, (_, index) => {
    const userIndex = index % userIds.length;
    const user = userRows[userIndex];

    return {
      userId: userIds[userIndex],
      status: orderStatuses[index % orderStatuses.length],
      createdAt: dateTime(4 + (index % 5), index % 28),
      shippingCity: user.shippingCity,
      shippingStreet: user.shippingStreet,
      shippingPostalCode: user.shippingPostalCode,
      shippingCountry: user.shippingCountry,
    };
  });

  const orderIds = await insertReturningIds("Поръчки", orderRows, (chunk) =>
    db.insert(orders).values(chunk).returning({ id: orders.id })
  );

  const saleCropIds = cropIds.filter((_, index) => cropRows[index].forSale);
  const orderLineRows: OrderLineInsert[] = Array.from({ length: LOAD_SIZE.orderLines }, (_, index) => {
    const cropIndex = (index * 13) % saleCropIds.length;
    const cropId = saleCropIds[cropIndex];
    const originalCropIndex = cropIds.indexOf(cropId);

    return {
      orderId: orderIds[index % orderIds.length],
      cropId,
      quantity: quantity(1 + (index % 24) * 0.75),
      price: cropRows[originalCropIndex].price ?? "2.00",
    };
  });

  await insertInChunks("Редове в поръчки", orderLineRows, (chunk) =>
    db.insert(orderLines).values(chunk)
  );

  const totalRecords =
    LOAD_SIZE.users +
    LOAD_SIZE.crops +
    LOAD_SIZE.products +
    LOAD_SIZE.cropProducts +
    LOAD_SIZE.plantings +
    LOAD_SIZE.sprayings +
    LOAD_SIZE.harvestings +
    LOAD_SIZE.wastes +
    expenseTypeRows.length +
    LOAD_SIZE.expences +
    LOAD_SIZE.orders +
    LOAD_SIZE.orderLines;

  console.log(`Seed completed successfully with ${totalRecords} records.`);
  console.log("Test login: klient.0001@example.bg / password123");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
