const COSMOS_AWAKENING_CHANCE = 0.2;
const MIN_BATTLE_WIN_CHANCE = 0.1;
const MAX_BATTLE_WIN_CHANCE = 0.85;

export function getEstimatedVictoryChance(cosmosPower, requiredCosmos) {
  const difference = Number(cosmosPower) - Number(requiredCosmos);
  const baseChance = Math.min(
    MAX_BATTLE_WIN_CHANCE,
    Math.max(MIN_BATTLE_WIN_CHANCE, 0.5 + difference * 0.003)
  );
  const totalChance = difference < 0
    ? COSMOS_AWAKENING_CHANCE + (1 - COSMOS_AWAKENING_CHANCE) * baseChance
    : baseChance;

  return Math.round(totalChance * 100);
}
