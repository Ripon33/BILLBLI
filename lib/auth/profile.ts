type ProfileInput = {
  userId: string;
  fullName: string;
  email: string;
  photoUrl?: string | null;
  company?: string | null;
  role?: string | null;
  country?: string | null;
};

export function buildProfile({
  userId,
  fullName,
  email,
  photoUrl = null,
  company = null,
  role = null,
  country = null,
}: ProfileInput) {
  if (!userId.trim()) {
    throw new Error("Authenticated user is required");
  }

  if (!fullName.trim()) {
    throw new Error("Full name is required");
  }

  if (!email.trim()) {
    throw new Error("Email is required");
  }

  return {
    user_id: userId,
    full_name: fullName,
    email,
    photo_url: photoUrl,
    company,
    role,
    country,
  };
}

type UpdateProfileFunction = (
  profile: ReturnType<typeof buildProfile>,
) => Promise<{
  data: unknown;
  error: Error | null;
}>;

type SaveProfileInput = ProfileInput & {
  update: UpdateProfileFunction;
};

export async function saveProfile({
  update,
  ...profileInput
}: SaveProfileInput) {
  const profile = buildProfile(profileInput);
  const { data, error } = await update(profile);

  if (error) {
    throw error;
  }

  return data;
}
