import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./db/client";
import { favorites, listings, users } from "./db/schema";

const listingOwner = alias(users, "listing_owner");

const visibleListing = () => and(
  inArray(listings.status, ["active", "sold"]),
  gt(listings.expiresAt, new Date()),
);

const listingWithOwner = {
  id: listings.id,
  category: listings.category,
  title: listings.title,
  imageUrls: listings.imageUrls,
  isFeatured: listings.isFeatured,
  description: listings.description,
  price: listings.price,
  address: listings.address,
  city: listings.city,
  latitude: listings.latitude,
  longitude: listings.longitude,
  contactPhone: listings.contactPhone,
  contactWhatsapp: listings.contactWhatsapp,
  status: listings.status,
  expiresAt: listings.expiresAt,
  createdAt: listings.createdAt,
  updatedAt: listings.updatedAt,
  owner: {
    id: listingOwner.id,
    displayName: listingOwner.displayName,
    profileImageUrl: listingOwner.profileImageUrl,
  },
};

export type CreateListingInput = Pick<
  typeof listings.$inferInsert,
  | "category"
  | "title"
  | "imageUrls"
  | "isFeatured"
  | "description"
  | "price"
  | "address"
  | "city"
  | "latitude"
  | "longitude"
  | "contactPhone"
  | "contactWhatsapp"
>;

export type SyncUserInput = {
  clerkUserId: string;
  displayName: string | null;
  profileImageUrl: string | null;
};

/**
 * Creates the application profile for a verified Clerk user if it is missing.
 * Existing profile data is never overwritten by a later authentication sync.
 */
export async function syncUser(input: SyncUserInput) {
  const [createdUser] = await db
    .insert(users)
    .values(input)
    .onConflictDoNothing({ target: users.clerkUserId })
    .returning();

  if (createdUser) {
    return createdUser;
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, input.clerkUserId))
    .limit(1);

  if (!existingUser) {
    throw new Error("User sync failed");
  }

  return existingUser;
}

/** Permanently deletes a user and all records that reference them with cascade rules. */
export async function deleteUserByClerkId(clerkUserId: string) {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .returning({ id: users.id });

  return deletedUser ?? null;
}

/**
 * Creates a listing for the authenticated Clerk user.
 * Validate the input and obtain the Clerk user ID from the server-side session
 * before calling this action.
 */
export async function createListing(
  clerkUserId: string,
  input: CreateListingInput,
) {
  const [owner] = await db
    .select({ id: users.id, isSeller: users.isSeller })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!owner?.isSeller) {
    throw new Error("Only sellers can create listings");
  }

  const [listing] = await db
    .insert(listings)
    .values({ ...input, ownerId: owner.id })
    .returning();

  return listing;
}

async function updateOwnedListingStatus(
  clerkUserId: string,
  listingId: string,
  status: "sold" | "deleted",
) {
  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  if (!owner) {
    throw new Error("User profile was not found");
  }

  const [listing] = await db
    .update(listings)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(listings.id, listingId), eq(listings.ownerId, owner.id)))
    .returning();

  return listing ?? null;
}

/** Marks an authenticated user's listing as sold. */
export function markListingAsSold(clerkUserId: string, listingId: string) {
  return updateOwnedListingStatus(clerkUserId, listingId, "sold");
}

/** Hides an authenticated user's listing from public discovery. */
export function deleteListing(clerkUserId: string, listingId: string) {
  return updateOwnedListingStatus(clerkUserId, listingId, "deleted");
}

/** Returns visible, unexpired listings for public discovery, newest first. */
export async function getAllListings() {
  return db
    .select(listingWithOwner)
    .from(listings)
    .innerJoin(listingOwner, eq(listings.ownerId, listingOwner.id))
    .where(visibleListing())
    .orderBy(desc(listings.createdAt));
}

/** Returns one visible, unexpired listing for public display. */
export async function getListingById(listingId: string) {
  const [listing] = await db
    .select(listingWithOwner)
    .from(listings)
    .innerJoin(listingOwner, eq(listings.ownerId, listingOwner.id))
    .where(and(eq(listings.id, listingId), visibleListing()));

  return listing ?? null;
}

/** Returns every listing owned by the authenticated Clerk user. */
export async function getListingsByUser(clerkUserId: string) {
  return db
    .select({ listing: listings, owner: listingOwner })
    .from(listings)
    .innerJoin(listingOwner, eq(listings.ownerId, listingOwner.id))
    .where(eq(listingOwner.clerkUserId, clerkUserId))
    .orderBy(desc(listings.createdAt));
}

/** Returns visible, unexpired listings saved by the authenticated Clerk user. */
export async function getAllFavorites(clerkUserId: string) {
  return db
    .select({
      ...listingWithOwner,
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(users, eq(favorites.userId, users.id))
    .innerJoin(listings, eq(favorites.listingId, listings.id))
    .innerJoin(listingOwner, eq(listings.ownerId, listingOwner.id))
    .where(and(eq(users.clerkUserId, clerkUserId), visibleListing()))
    .orderBy(desc(favorites.createdAt));
}
