import { createClerkClient } from "@clerk/backend";
import { syncUser } from "@/lib/server/db-actions";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function getDisplayName(firstName: string | null, lastName: string | null) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return displayName || null;
}

export async function POST(request: Request) {
  if (!clerkSecretKey || !clerkPublishableKey) {
    return Response.json(
      { error: "Clerk server configuration is missing" },
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
  const clerkUser = await clerk.users.getUser(userId);
  const user = await syncUser({
    clerkUserId: userId,
    displayName: getDisplayName(clerkUser.firstName, clerkUser.lastName),
    profileImageUrl: clerkUser.imageUrl ?? null,
  });

  return Response.json({
    id: user.id,
    isSeller: user.isSeller,
  });
}
