import { createClerkClient } from "@clerk/backend";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

async function createCloudinarySignature(
  signaturePayload: string,
  apiSecret: string,
) {
  const bytes = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(`${signaturePayload}${apiSecret}`),
  );

  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * Returns the short-lived, signed fields needed for a direct image upload to
 * Cloudinary. The API secret is used only here and is never returned.
 */
export async function POST(request: Request) {
  if (
    !clerkSecretKey ||
    !clerkPublishableKey ||
    !cloudName ||
    !cloudinaryApiKey ||
    !cloudinaryApiSecret
  ) {
    return Response.json(
      { error: "Upload server configuration is missing" },
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

  const { userId } = requestState.toAuth();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `flick-mart/listings/${userId}`;
  const tags = `flick-mart-listing,owner-${userId}`;
  const signaturePayload = `folder=${folder}&tags=${tags}&timestamp=${timestamp}`;
  const signature = await createCloudinarySignature(
    signaturePayload,
    cloudinaryApiSecret,
  );

  return Response.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    apiKey: cloudinaryApiKey,
    timestamp,
    signature,
    folder,
    tags,
  });
}
