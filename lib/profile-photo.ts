export const PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024;

export const PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProfilePhotoValidationInput = {
  name: string;
  type: string;
  size: number;
};

export function validateProfilePhoto(
  input: ProfilePhotoValidationInput,
): ProfilePhotoValidationInput {
  if (!PROFILE_PHOTO_TYPES.includes(
    input.type as (typeof PROFILE_PHOTO_TYPES)[number],
  )) {
    throw new Error("Profile photo type is not supported.");
  }

  if (input.size > PROFILE_PHOTO_MAX_SIZE) {
    throw new Error("Profile photo is too large.");
  }

  if (input.size <= 0) {
    throw new Error("Profile photo is empty.");
  }

  return input;
}
