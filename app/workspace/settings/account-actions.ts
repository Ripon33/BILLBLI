"use server";

import { deleteCurrentAccount } from "@/lib/auth/account-deletion";

export async function deleteAccount() {
  await deleteCurrentAccount();
}
