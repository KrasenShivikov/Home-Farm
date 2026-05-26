import {
  boolean,
  date,
  integer,
  index,
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
import { ACTIVITY_TYPE_VALUES } from "@/lib/activity-types";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);
export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPE_VALUES);

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
}, (table) => ({
  cropsForSaleNameIdx: index("crops_for_sale_name_idx").on(table.forSale, table.name),
}));

export const wastes = pgTable("wastes", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  type: activityTypeEnum("type").notNull().default("корен"),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
}, (table) => ({
  wastesCropDateIdx: index("wastes_crop_date_idx").on(table.cropId, table.date),
  wastesDateIdx: index("wastes_date_idx").on(table.date),
  wastesTypeIdx: index("wastes_type_idx").on(table.type),
}));

export const plantings = pgTable("plantings", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  type: activityTypeEnum("type").notNull().default("корен"),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id, { onDelete: "cascade" }),
  createdFrom: text("created_from"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  description: text("description"),
}, (table) => ({
  plantingsCropDateIdx: index("plantings_crop_date_idx").on(table.cropId, table.date),
  plantingsDateIdx: index("plantings_date_idx").on(table.date),
}));

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
}, (table) => ({
  sprayingsCropDateIdx: index("sprayings_crop_date_idx").on(table.cropId, table.date),
  sprayingsDateIdx: index("sprayings_date_idx").on(table.date),
}));

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
}, (table) => ({
  harvestingsCropDateIdx: index("harvestings_crop_date_idx").on(table.cropId, table.date),
  harvestingsDateIdx: index("harvestings_date_idx").on(table.date),
}));

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull().default("1.000"),
  price: numeric("price", { precision: 10, scale: 2 }),
}, (table) => ({
  productsDateIdx: index("products_date_idx").on(table.date),
  productsNameIdx: index("products_name_idx").on(table.name),
}));

export const expencesType = pgTable("expences_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const expences = pgTable("expences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  expencesTypeId: integer("expences_type_id")
    .notNull()
    .references(() => expencesType.id, { onDelete: "restrict" }),
  description: text("description"),
  date: date("date").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }),
}, (table) => ({
  expencesDateIdx: index("expences_date_idx").on(table.date),
  expencesTypeDateIdx: index("expences_type_date_idx").on(table.expencesTypeId, table.date),
}));

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
    cropProductsProductIdx: index("crop_products_product_idx").on(table.productId),
  })
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  shippingCity: text("shipping_city"),
  shippingStreet: text("shipping_street"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
}, (table) => ({
  ordersUserStatusIdIdx: index("orders_user_status_id_idx").on(table.userId, table.status, table.id),
  ordersStatusCreatedIdx: index("orders_status_created_idx").on(table.status, table.createdAt),
  ordersCreatedIdx: index("orders_created_idx").on(table.createdAt),
}));

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
}, (table) => ({
  orderLinesOrderCropIdx: index("order_lines_order_crop_idx").on(table.orderId, table.cropId),
  orderLinesCropIdx: index("order_lines_crop_idx").on(table.cropId),
}));
