import path from "path";
import dotenv from "dotenv";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/node-postgres";

import {
  cropProducts,
  crops,
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function clearTables() {
  await db.delete(orderLines);
  await db.delete(orders);
  await db.delete(cropProducts);
  await db.delete(products);
  await db.delete(wastes);
  await db.delete(plantings);
  await db.delete(sprayings);
  await db.delete(harvestings);
  await db.delete(crops);
  await db.delete(users);
}

async function seed() {
  await clearTables();

  const [userIvan] = await db
    .insert(users)
    .values({
      name: "Ivan Petro",
      email: "ivan@example.com",
      passwordHash: "seeded_hash_ivan",
      shippingCity: "Sofia",
      shippingStreet: "12 Cherry Lane",
      shippingPostalCode: "1000",
      shippingCountry: "Bulgaria",
    })
    .returning({ id: users.id });

  const [userMaria] = await db
    .insert(users)
    .values({
      name: "Maria Stoyanova",
      email: "maria@example.com",
      passwordHash: "seeded_hash_maria",
      shippingCity: "Plovdiv",
      shippingStreet: "8 Garden St",
      shippingPostalCode: "4000",
      shippingCountry: "Bulgaria",
    })
    .returning({ id: users.id });

  const [tomato] = await db
    .insert(crops)
    .values({
      name: "Tomato",
      variety: "Roma",
      forSale: true,
      price: "3.50",
      description: "Rich flavor, ideal for sauces.",
    })
    .returning({ id: crops.id });

  const [cucumber] = await db
    .insert(crops)
    .values({
      name: "Cucumber",
      variety: "Gherkin",
      forSale: true,
      price: "2.20",
      description: "Crisp and fresh.",
    })
    .returning({ id: crops.id });

  const [cannedTomatoes] = await db
    .insert(products)
    .values({
      name: "Canned Tomatoes",
      date: "2026-05-10",
    })
    .returning({ id: products.id });

  const [pickles] = await db
    .insert(products)
    .values({
      name: "Pickled Cucumbers",
      date: "2026-05-12",
    })
    .returning({ id: products.id });

  await db.insert(cropProducts).values([
    {
      cropId: tomato.id,
      productId: cannedTomatoes.id,
      quantity: "18.000",
    },
    {
      cropId: cucumber.id,
      productId: pickles.id,
      quantity: "12.500",
    },
  ]);

  await db.insert(plantings).values([
    {
      date: "2026-03-12",
      quantity: "120.000",
      cropId: tomato.id,
      createdFrom: "seed",
      description: "Spring planting batch.",
    },
    {
      date: "2026-03-15",
      quantity: "80.000",
      cropId: cucumber.id,
      createdFrom: "seed",
      description: "Early cucumber beds.",
    },
  ]);

  await db.insert(sprayings).values([
    {
      date: "2026-04-01",
      quantity: "6.500",
      cropId: tomato.id,
      createdFrom: "seed",
      description: "Organic pest control.",
    },
    {
      date: "2026-04-03",
      quantity: "4.250",
      cropId: cucumber.id,
      createdFrom: "seed",
      description: "Preventive mildew treatment.",
    },
  ]);

  await db.insert(harvestings).values([
    {
      date: "2026-05-05",
      quantity: "210.000",
      cropId: tomato.id,
      createdFrom: "seed",
      description: "First harvest run.",
    },
    {
      date: "2026-05-08",
      quantity: "140.000",
      cropId: cucumber.id,
      createdFrom: "seed",
      description: "Peak cucumber harvest.",
    },
  ]);

  await db.insert(wastes).values([
    {
      date: "2026-05-09",
      quantity: "6.000",
      cropId: tomato.id,
      createdFrom: "seed",
      description: "Sorting losses.",
    },
  ]);

  const [orderIvan] = await db
    .insert(orders)
    .values({
      userId: userIvan.id,
      status: "Pending",
    })
    .returning({ id: orders.id });

  const [orderMaria] = await db
    .insert(orders)
    .values({
      userId: userMaria.id,
      status: "Accepted",
    })
    .returning({ id: orders.id });

  await db.insert(orderLines).values([
    {
      orderId: orderIvan.id,
      cropId: tomato.id,
      quantity: "8.000",
      price: "3.50",
    },
    {
      orderId: orderMaria.id,
      cropId: cucumber.id,
      quantity: "5.000",
      price: "2.20",
    },
  ]);
}

seed()
  .then(() => {
    console.log("Seed completed successfully.");
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
