const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

async function postToApi(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server returned HTTP ${response.status}.`);
  }

  return data;
}

export async function fetchSanctuaryAlert() {
  return postToApi("/api/sanctuary-alert");
}

export async function generateSaintLore(saintName, rank, constellation) {
  const data = await postToApi("/api/generate-lore", {
    saintName,
    rank,
    constellation,
    isCustom: true,
  });
  return data.lore;
}
