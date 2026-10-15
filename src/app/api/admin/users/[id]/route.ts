import { ApiError, idParam, ok, route } from "@/lib/server/http";
import { adminCount, deleteUser, listUsers } from "@/lib/server/repos/users";

export const DELETE = route<{ id: string }>(
  async ({ params, user }) => {
    const id = idParam(params.id);
    if (id === user!.id) throw new ApiError(400, "You can't delete your own account.");
    const target = (await listUsers()).find((u) => u.id === id);
    if (!target) throw new ApiError(404, "User not found.");
    if (target.role === "admin" && (await adminCount()) <= 1) throw new ApiError(400, "Keep at least one administrator.");
    await deleteUser(id);
    return ok({ deleted: true });
  },
  { auth: "admin" },
);
