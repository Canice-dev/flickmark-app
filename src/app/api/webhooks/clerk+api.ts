import { verifyWebhook } from "@clerk/backend/webhooks";
import { deleteUserByClerkId, syncUser } from "@/lib/server/db-actions";

function getDisplayName(firstName: string | null, lastName: string | null) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return displayName || null;
}

export async function POST(request: Request) {
  try {
    const event = await verifyWebhook(request);

    if (event.type === "user.created") {
      await syncUser({
        clerkUserId: event.data.id,
        displayName: getDisplayName(event.data.first_name, event.data.last_name),
        profileImageUrl: event.data.image_url ?? null,
      });
    }

    if (event.type === "user.deleted" && event.data.id) {
      await deleteUserByClerkId(event.data.id);
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
