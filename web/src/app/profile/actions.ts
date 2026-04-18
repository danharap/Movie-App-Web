"use server";

import { saveUserPreferences } from "@/app/actions/library";

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
