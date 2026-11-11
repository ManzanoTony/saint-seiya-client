const customSaintImages = {
  male: "/Male-character.png",
  female: "/Female-character.png",
  other: "/Other-character.png",
};

export function getCustomSaintImage(gender) {
  const normalizedGender =
    typeof gender === "string" ? gender.trim().toLowerCase() : "";
  return customSaintImages[normalizedGender] || "/Male-character.png";
}

export function getSaintImage(saint) {
  const normalizedGender =
    typeof saint.gender === "string" ? saint.gender.trim().toLowerCase() : "";
  const image = saint.isCustom
    ? customSaintImages[normalizedGender] || saint.image
    : saint.image;

  return image?.startsWith("http") || image?.startsWith("/")
    ? image
    : `/${image || "Generic-Warrior-1.jpg"}`;
}
