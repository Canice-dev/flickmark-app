import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const listingStatus = pgEnum("listing_status", [
  "active",
  "paused",
  "sold",
  "expired",
  "deleted",
]);
export const reportStatus = pgEnum("report_status", ["pending", "reviewed"]);

/**
 * Application-owned user data. Clerk remains the identity provider; its user ID
 * is stored here so marketplace data is never keyed directly to client input.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 100 }),
    profileImageUrl: text("profile_image_url"),
    isSeller: boolean("is_seller").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_clerk_user_id_unique").on(table.clerkUserId),
  ],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    imageUrl: text("image_url").notNull(),
    description: text("description").notNull(),
    price: numeric("price").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    contactPhone: text("contact_phone").notNull(),
    contactWhatsapp: text("contact_whatsapp").notNull(),
    status: listingStatus("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '30 days'`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("listings_discovery_idx").on(
      table.status,
      table.category,
      table.createdAt,
    ),
    index("listings_owner_status_idx").on(table.ownerId, table.status),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.listingId] })],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 100 }).notNull(),
    detail: text("detail"),
    status: reportStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [index("reports_status_created_at_idx").on(table.status, table.createdAt)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 255 }),
    listingId: uuid("listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    category: text("category"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("analytics_events_name_created_at_idx").on(table.name, table.createdAt)],
);
