import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("user"),
    shippingCity: text("shipping_city").notNull(),
    shippingStreet: text("shipping_street").notNull(),
    shippingPostalCode: text("shipping_postal_code"),
    shippingCountry: text("shipping_country"),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  })
);

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  variety: text("variety"),
  forSale: boolean("for_sale").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  description: text("description"),
});

export const wastes = pgTable("wastes", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
});

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
});

export const sprayings = pgTable("sprayings", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
});

export const harvestings = pgTable("harvestings", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: date("date").notNull(),
});

export const cropProducts = pgTable(
  "crop_products",
  {
    cropId: integer("crop_id")
      .notNull()
      .references(() => crops.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.cropId, table.productId] }),
  })
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderLines = pgTable("order_lines", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});
