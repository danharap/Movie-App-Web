"use server";

import {
  saveUserPreferences,
  setFavouriteMovie,
  removeFavouriteMovie,
} from "@/app/actions/library";

export async function saveProfileFromForm(formData: FormData) {
  const minRaw = formData.get("default_runtime_min");
  const maxRaw = formData.get("default_runtime_max");
  await saveUserPreferences({
    default_runtime_min:
      minRaw && String(minRaw).length ? Number(minRaw) : null,
    default_runtime_max:
      maxRaw && String(maxRaw).length ? Number(maxRaw) : null,
  });
}

export async function setFavouriteAction(
  tmdbId: number,
  position: 1 | 2 | 3 | 4,
) {
  await setFavouriteMovie(tmdbId, position);
}

export async function removeFavouriteAction(position: 1 | 2 | 3 | 4) {
  await removeFavouriteMovie(position);
}
