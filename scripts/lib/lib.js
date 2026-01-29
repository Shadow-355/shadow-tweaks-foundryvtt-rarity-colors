import CONSTANTS from "../constants.js";

export function isEmptyObject(obj) {
  // because Object.keys(new Date()).length === 0;
  // we have to do some additional check
  if (obj === null || obj === undefined) {
    return true;
  }
  const result =
    obj && // null and undefined check
    Object.keys(obj).length === 0; // || Object.getPrototypeOf(obj) === Object.prototype);
  return result;
}

export function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

// TODO Multisystem
export function isItemUnidentified(item) {
  if (game.system.id === "dnd5e" && item) {
    let type = item?.type;
    const isSpell = type === "spell";
    const isFeat = type === "feat";
    const isIdentified = item.system?.identified;
    return !isSpell && !isFeat && !isIdentified;
  } else {
    return false;
  }
}
