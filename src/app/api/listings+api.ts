import { createClerkClient } from "@clerk/backend";
import { createListing, getAllListings } from "@/lib/server/db-actions";

const categories = ["Housing", "Electronics", "Fashion", "Other"] as const;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

type ListingRequest = Record<string, unknown>;

/** Returns public, active listings for the browse feed. */
export async function GET() {
  try {
    const listings = await getAllListings();
    return Response.json({ listings });
  } catch {
    return Response.json(
      { error: "Unable to load listings" },
      { status: 500 },
    );
  }
}

function requiredText(value: unknown, field: string, maximumLength: number) {
  if (typeof value !== "string") {
    throw new Error(`${field} is required`);
  }

  const text = value.trim();
  if (!text || text.length > maximumLength) {
    throw new Error(`${field} must be between 1 and ${maximumLength} characters`);
  }

  return text;
}

function coordinate(value: unknown, field: "Latitude" | "Longitude") {
  const text = requiredText(value, field, 20);
  const numericValue = Number(text);
  const limit = field === "Latitude" ? 90 : 180;

  if (!Number.isFinite(numericValue) || Math.abs(numericValue) > limit) {
    throw new Error(`${field} is invalid`);
  }

  return text;
}

function phoneNumber(value: unknown, field: string) {
  const phone = requiredText(value, field, 20).replace(/[\s-]/g, "");

  if (!/^(?:\+234|0)[789]\d{9}$/.test(phone)) {
    throw new Error(`${field} must be a valid Nigerian mobile number`);
  }

  return phone;
}

function imageUrls(value: unknown, clerkUserId: string, currentCloudName: string) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6) {
    throw new Error("Add between 1 and 6 listing images");
  }

  return value.map((imageUrl) => {
    if (typeof imageUrl !== "string") {
      throw new Error("Each image URL is invalid");
    }

    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      throw new Error("Each image URL is invalid");
    }

    const uploadPath = `/flick-mart/listings/${clerkUserId}/`;
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith(`/${currentCloudName}/image/upload/`) ||
      !url.pathname.includes(uploadPath)
    ) {
      throw new Error("Images must be uploaded to your FlickMart folder");
    }

    return url.toString();
  });
}

export async function POST(request: Request) {
  if (!clerkSecretKey || !clerkPublishableKey || !cloudName) {
    return Response.json(
      { error: "Listing server configuration is missing" },
      { status: 500 },
    );
  }

  const clerk = createClerkClient({
    secretKey: clerkSecretKey,
    publishableKey: clerkPublishableKey,
  });
  const requestState = await clerk.authenticateRequest(request);

  if (!requestState.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ListingRequest;
  try {
    body = (await request.json()) as ListingRequest;
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  try {
    const category = requiredText(body.category, "Category", 50);
    if (!categories.includes(category as (typeof categories)[number])) {
      throw new Error("Category is invalid");
    }

    const price = requiredText(body.price, "Price", 20);
    if (!/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) <= 0) {
      throw new Error("Price must be a positive amount");
    }

    if (body.isFeatured !== undefined && typeof body.isFeatured !== "boolean") {
      throw new Error("Featured selection is invalid");
    }

    const { userId } = requestState.toAuth();
    const listing = await createListing(userId, {
      category,
      title: requiredText(body.title, "Title", 160),
      imageUrls: imageUrls(body.imageUrls, userId, cloudName),
      isFeatured: body.isFeatured === true,
      description: requiredText(body.description, "Description", 5_000),
      price,
      address: requiredText(body.address, "Address", 500),
      city: requiredText(body.city, "City", 120),
      latitude: coordinate(body.latitude, "Latitude"),
      longitude: coordinate(body.longitude, "Longitude"),
      contactPhone: phoneNumber(body.contactPhone, "Mobile number"),
      contactWhatsapp: phoneNumber(body.contactWhatsapp, "WhatsApp number"),
    });

    return Response.json({ listing }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Only sellers can create listings") {
      return Response.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "Unable to create listing";
    return Response.json({ error: message }, { status: 400 });
  }
}
