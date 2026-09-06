type BuildOwnedRecordInput<T extends Record<string, unknown>> = {
  authenticatedUserId: string;
  clientUserId?: string | null;
  data: T;
};

export function buildOwnedRecord<T extends Record<string, unknown>>({
  authenticatedUserId,
  data,
}: BuildOwnedRecordInput<T>) {
  if (!authenticatedUserId.trim()) {
    throw new Error("Authenticated user is required");
  }

  return {
    ...data,
    user_id: authenticatedUserId,
  };
}
