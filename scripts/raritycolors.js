import { isEmptyObject, isItemUnidentified } from "./lib/lib.js";
import CONSTANTS from "./constants.js";
import API from "./API.js";
import Logger from "./lib/Logger.js";

export let ORIGINAL_CONFIG = {};

let rarityColorBorderEnable = false;
let rarityColorBackgroundEnable = false;
let rarityColorTextEnable = false;
let rarityFlag = false;

export const initHooks = async () => {
  // TODO Make something for multisystem here
  // Deep clone only the specific properties we need to avoid deprecated ones being accessed
  if (game.dnd5e?.config) {
    ORIGINAL_CONFIG = {};
    if (game.dnd5e.config.itemRarity) {
      ORIGINAL_CONFIG.itemRarity = foundry.utils.deepClone(game.dnd5e.config.itemRarity);
    }
    if (game.dnd5e.config.spellSchools) {
      ORIGINAL_CONFIG.spellSchools = foundry.utils.deepClone(game.dnd5e.config.spellSchools);
    }
    if (game.dnd5e.config.featureTypes) {
      ORIGINAL_CONFIG.featureTypes = foundry.utils.deepClone(game.dnd5e.config.featureTypes);
    }
  } else {
    ORIGINAL_CONFIG = {};
  }
};

export const setupHooks = async () => {
  game.modules.get(CONSTANTS.MODULE_ID).api = API;
  rarityColorBorderEnable = isBorderEnable();
  rarityColorBackgroundEnable = isBackgroundEnable();
  rarityColorTextEnable = isTextEnable();
  rarityFlag = isDisabled();
  Logger.debug(`Setup Hooks - rarityFlag: ${rarityFlag}, border: ${rarityColorBorderEnable}, bg: ${rarityColorBackgroundEnable}, text: ${rarityColorTextEnable}`);
};

export const readyHooks = () => {
  // Do nothing
  if (isEmptyObject(API.mapConfigurations)) {
    API.mapConfigurations = API.getColorMap();
  }
  Logger.debug("Rarity Colors Module READY");
};

// Tidy 5e Sheet compatibility - V13 uses renderTidy5eCharacterSheet hook
Hooks.on("renderTidy5eCharacterSheet", (app, element) => {
  if (rarityFlag) {
    Logger.debug(`renderTidy5eCharacterSheet: colors disabled, returning early`);
    return;
  }

  Logger.debug(`renderTidy5eCharacterSheet: Processing sheet ${app.object?.name}`);
  
  // Find all item rows by data-item-id attribute - works across Tidy5e versions
  const itemRows = element.querySelectorAll("[data-item-id]");
  Logger.debug(`Found ${itemRows.length} item rows with data-item-id`);
  
  // Undo any existing color overrides on all item rows
  itemRows.forEach(row => {
    row.style.backgroundColor = "";
    row.style.background = "";
    row.style.color = "";
    
    // Also reset nested elements
    const nameEls = row.querySelectorAll(".item-name, [data-tidy-field='name']");
    nameEls.forEach(el => {
      el.style.color = "";
      el.style.backgroundColor = "";
      el.style.background = "";
    });
    
    const imgEls = row.querySelectorAll(".item-image img, [data-tidy-sheet-part='item-image'] img");
    imgEls.forEach(el => {
      el.style.border = "";
    });
  });
  
  // Now apply colors
  const options = {
    itemSelector: `[data-item-id]`,
    itemNameSelector: `.item-name, [data-tidy-field="name"]`,
    itemImageNameSelector: `.item-image img, [data-tidy-sheet-part="item-image"] img`,
  };
  
  renderActorRarityColors(app, element, options);
})

Hooks.on("renderActorSheet", (actorSheet, html) => {
  if (rarityFlag) {
    return;
  }
  renderActorRarityColors(actorSheet, html, {
    itemSelector: ".items-list .item",
    itemNameSelector: ".item-name h4",
    itemImageNameSelector: ".item-image",
    itemNameSelector2: ".item-name .title", // New 3.0.0 sheet...
  });
});

Hooks.on("renderSidebarTab", (tab) => {
  if (rarityFlag) {
    return;
  }
  if (tab instanceof CompendiumDirectory) {
    // Nothing here
  }
  if (tab instanceof Compendium) {
    applyChangesCompendiumRarityColor(tab);
  }
});

Hooks.on("activateAbstractSidebarTab", (tab) => {
  if (rarityFlag) {
    return;
  }
  
  // Check if this is the items directory
  if (!tab?.constructor?.name?.includes("ItemDirectory")) {
    return;
  }
  
  Logger.debug(`activateAbstractSidebarTab: Processing items sidebar`);
  if (isEmptyObject(API.mapConfigurations)) {
    API.mapConfigurations = API.getColorMap();
  }

  // Try multiple selector approaches to find the items directory
  let htmlElement = null;
  
  // Approach 1: Check if tab has a method to get its element
  if (typeof tab?.element === 'function') {
    htmlElement = tab.element();
  } else if (tab?.element) {
    htmlElement = tab.element;
  }
  
  // Approach 2: Try DOM selectors
  if (!htmlElement) {
    htmlElement = document.querySelector(".sidebar-tab.items");
  }
  if (!htmlElement) {
    htmlElement = document.querySelector("div[data-tab='items']");
  }
  if (!htmlElement) {
    htmlElement = document.querySelector("#items");
  }
  
  // Approach 3: Look for all directory items in the sidebar
  if (!htmlElement) {
    htmlElement = document.querySelector(".sidebar-tab");
  }
  
  if (!htmlElement) {
    Logger.warn(`Could not find items sidebar element`);
    return;
  }
  
  let items = htmlElement.querySelectorAll(".directory-item.document.item");
  Logger.debug(`Found ${items.length} items in sidebar`);
  
  for (let itemElement of items) {
    let item = null;
    
    // In V13, sidebar items use data-entry-id
    let entryId = itemElement.dataset.entryId;
    if (!entryId) {
      continue;
    }
    
    // Try multiple approaches to find the item
    // First try as direct document ID
    item = game.items.get(entryId);
    
    // If not found, try as UUID
    if (!item) {
      try {
        item = fromUuidSync(entryId);
      } catch (e) {
        // UUID resolution failed
      }
    }
    
    if (!item) {
      continue;
    }
    
    // TODO make multisystem only dnd5e supported
    if (isItemUnidentified(item)) {
      continue;
    }

    let itemNameElement = null;
    if (rarityColorBackgroundEnable) {
      itemNameElement = itemElement.querySelector(".document-name");
      const thumbnail = itemElement.querySelector(".thumbnail");
      if (thumbnail) {
        thumbnail.style.zIndex = "1"; // stupid display flex
      }
    } else if (rarityColorTextEnable) {
      itemNameElement = itemElement.querySelector(".document-name");
    }
    let itemImageNameElement = null;
    if (itemElement.querySelector("img.thumbnail")) {
      itemImageNameElement = itemElement.querySelector("img.thumbnail");
    }

    const color = API.getColorFromItem(item);
    if (!colorIsDefault(color)) {
      if (itemNameElement) {
        if (rarityColorBackgroundEnable) {
          const backgroundColor = API.getRarityTextBackgroundColor(color);
          itemNameElement.style.backgroundColor = backgroundColor;
          if (game.modules.get("colorsettings")?.api) {
            const textColor = API.getRarityTextColor(color);
            itemNameElement.style.color = textColor;
          }
        } else if (rarityColorTextEnable) {
          itemNameElement.style.color = color;
        }
      }
      if (rarityColorBorderEnable) {
        if (itemImageNameElement) {
          // itemImageNameElement.style.borderColor = color+"!important";
          itemImageNameElement.style.border = "solid " + color;
          // itemImageNameElement.style.borderWidth = "thick";
        }
      }
    }
  }
});

// Hooks.on("updateItem", (item, diff, options, userID) => {
//     if (!rarityFlag) {
//         return;
//     }
//     if (item.actor) {
//         return;
//     }
//     ui.sidebar.render();
// });

Hooks.on("renderTidy5eItemSheet", (app, element, data) => {
  if (rarityFlag) {
    return;
  }
  const options = {
    itemNameSelector: `[data-tidy-field="name"]`,
    itemImageNameSelector: `[data-tidy-sheet-part='item-image']`,
    raritySelectSelector: `select[data-tidy-field="system.rarity"]`,
  };

  // Undo any existing color overrides
  if (element.querySelector(options.itemNameSelector)) {
    element.querySelector(options.itemNameSelector).style.backgroundColor = "";
    element.querySelector(options.itemNameSelector).style.color = "";
  }
  if (element.querySelector(options.itemNameSelector2)) {
    element.querySelector(options.itemNameSelector2).style.backgroundColor = "";
    element.querySelector(options.itemNameSelector2).style.color = "";
  }
  if (element.querySelector(options.itemImageNameSelector)) {
    element.querySelector(options.itemImageNameSelector).style.border = "";
  }
  element.querySelectorAll(`${options.raritySelectSelector} option`).forEach(opt => {
    opt.style.backgroundColor = "";
    opt.style.color = "";
  });

  renderItemSheetRarityColors(app, element, data, options);
});

Hooks.on("renderItemSheet", (app, html, appData) => {
  if (rarityFlag) {
    return;
  }
  const htmlElement = html instanceof jQuery ? html[0] : html;
  const options = {
    itemNameSelector: 'input[name="name"]',
    itemImageNameSelector: "img.profile",
    raritySelectSelector: 'select[name="system.rarity"]',
  };
  renderItemSheetRarityColors(app, htmlElement, appData, options);
});

Hooks.on("renderContainerSheet", () => {
  document.querySelectorAll("li.item.flexrow").forEach((el) => {
    const itemId = el.getAttribute("data-item-id");
    if (!itemId) {
      return;
    }
    let foundItem = null;
    for (const actor of game.actors.contents) {
      foundItem = actor.items.get(itemId);
      if (foundItem) {
        break;
      }
    }
    if (!foundItem) {
      return;
    }
    let color = API.getColorFromItem(foundItem);
    if (!color?.startsWith("#")) {
      return;
    }
    let [r, g, b] = color.match(/\w\w/g).map((hex) => parseInt(hex, 16));
    el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
  });
});

// =================================================
// UTILITY
// ===================================================

async function applyChangesCompendiumRarityColor(tab) {
  if (game.settings.get(CONSTANTS.MODULE_ID, "disableRarityColorOnCompendium")) {
    return;
  }
  document.querySelectorAll(`.directory.compendium`).forEach(async (h) => {
    const dataPack = h.dataset.pack;
    const items = document.querySelectorAll(`.directory.compendium[data-pack='${dataPack}'] .directory-item`);
    for (let itemElement of items) {
      // let id = itemElement.outerHTML.match(/data-document-id="(.*?)"/);
      let item = null;
      if (!itemElement.dataset.uuid) {
        let id = itemElement.dataset.documentId;
        if (!id) {
          continue;
        }
        item = await fromUuid(`Compendium.${dataPack}.${id}`);
      } else {
        item = await fromUuid(itemElement.dataset.uuid);
      }

      if (!item) {
        continue;
      }
      // TODO make multisystem only dnd5e supported
      if (isItemUnidentified(item)) {
        Logger.debug(`Item is not identified no color is applied`, item);
        continue;
      }

      let itemNameElement = null;
      let itemImageNameElement = null;
      if (rarityColorBackgroundEnable) {
        itemNameElement = itemElement.querySelector(".document-name");
        itemImageNameElement = itemElement.querySelector("img.thumbnail");
        // const thumbnail = itemElement.querySelector(".thumbnail");
        // thumbnail.style.zIndex = "1"; // stupid display flex
      } else if (rarityColorTextEnable) {
        itemNameElement = itemElement.querySelector(".document-name");
        itemImageNameElement = itemElement.querySelector("img.thumbnail");
      }

      const color = API.getColorFromItem(item);
      if (!colorIsDefault(color)) {
        if (itemNameElement) {
          if (rarityColorBackgroundEnable) {
            const backgroundColor = API.getRarityTextBackgroundColor(color);
            itemNameElement.style.backgroundColor = backgroundColor;
            if (game.modules.get("colorsettings")?.api) {
              const textColor = API.getRarityTextColor(color);
              itemNameElement.style.color = textColor;
            }
          } else if (rarityColorTextEnable) {
            itemNameElement.style.color = color;
          }
        }
        if (rarityColorBorderEnable) {
          if (itemImageNameElement) {
            // itemImageNameElement.style.borderColor = color+"!important";
            itemImageNameElement.style.border = "solid " + color;
            // itemImageNameElement.style.borderWidth = "thick";
          }
        }
      }
    }
  });
}

function renderActorRarityColors(actorSheet, html, options) {
  if (isEmptyObject(API.mapConfigurations)) {
    Logger.debug(`renderActorRarityColors: Loading color map`);
    API.mapConfigurations = API.getColorMap();
  }

  // Handle both jQuery elements and native DOM elements
  const htmlElement = html instanceof jQuery ? html[0] : html;
  
  // Find all items by data-item-id attribute
  let items = htmlElement.querySelectorAll(options.itemSelector);
  Logger.debug(`renderActorRarityColors: Found ${items.length} items, rarityColorBackgroundEnable=${rarityColorBackgroundEnable}, rarityColorTextEnable=${rarityColorTextEnable}, rarityColorBorderEnable=${rarityColorBorderEnable}`);
  
  for (let itemElement of items) {
    // Get the item ID from the element
    let id = itemElement.getAttribute("data-item-id") || 
             itemElement.dataset?.itemId;
             
    if (!id) {
      continue;
    }
    
    let actor = actorSheet.object;
    let item = actor.items.get(id);
    if (!item) {
      Logger.debug(`Item ${id} not found in actor`);
      continue;
    }
    
    // TODO make multisystem only dnd5e supported
    if (isItemUnidentified(item)) {
      Logger.debug(`Item is not identified no color is applied`, item);
      continue;
    }

    // Get color for this item
    const color = API.getColorFromItem(item);
    Logger.debug(`Item "${item.name}" - color: ${color}`);
    
    if (colorIsDefault(color)) {
      Logger.debug(`Item "${item.name}" - color is default, skipping`);
      continue;
    }

    // Apply background color to entire row
    if (rarityColorBackgroundEnable) {
      const backgroundColor = API.getRarityTextBackgroundColor(color);
      itemElement.style.backgroundColor = backgroundColor;
      itemElement.style.background = backgroundColor;
      Logger.debug(`Applied background color ${backgroundColor} to ${item.name}`);
      
      if (game.modules.get("colorsettings")?.api) {
        const textColor = API.getRarityTextColor(color);
        itemElement.style.color = textColor;
      }
    }
    
    // Apply text color to item name
    if (rarityColorTextEnable) {
      const nameEl = itemElement.querySelector(options.itemNameSelector);
      if (nameEl) {
        nameEl.style.color = color;
        Logger.debug(`Applied text color ${color} to ${item.name}`);
      }
    }
    
    // Apply border to item image
    if (rarityColorBorderEnable) {
      const imageEl = itemElement.querySelector(options.itemImageNameSelector);
      if (imageEl) {
        imageEl.style.border = "solid " + color;
        Logger.debug(`Applied border color ${color} to ${item.name}`);
      }
    }
  }
}

function renderItemSheetRarityColors(app, html, appData, options) {
  let item = appData;
  if (!item) {
    return;
  }
  if (isEmptyObject(API.mapConfigurations)) {
    API.mapConfigurations = API.getColorMap();
  }
  
  // Handle both jQuery elements and native DOM elements
  const htmlElement = html instanceof jQuery ? html[0] : html;
  
  // Color item name
  let itemNameElement = null;
  const nameEl = htmlElement.querySelector(options.itemNameSelector);
  if (nameEl) {
    itemNameElement = nameEl;
  } else {
    const nameEl2 = htmlElement.querySelector(options.itemNameSelector2);
    if (nameEl2) {
      itemNameElement = nameEl2;
    }
  }
  // if (!itemNameElement) {
  //     return;
  // }
  let itemImageNameElement = null;
  const imgEl = htmlElement.querySelector(options.itemImageNameSelector);
  if (imgEl) {
    itemImageNameElement = imgEl;
  }

  const color = API.getColorFromItem(item);
  if (!colorIsDefault(color)) {
    if (itemNameElement) {
      if (rarityColorBackgroundEnable) {
        const backgroundColor = API.getRarityTextBackgroundColor(color);
        itemNameElement.style.backgroundColor = backgroundColor;
        if (game.modules.get("colorsettings")?.api) {
          const textColor = API.getRarityTextColor(color);
          itemNameElement.style.color = textColor;
        }
      } else if (rarityColorTextEnable) {
        itemNameElement.style.color = color;
      }
    }
    if (rarityColorBorderEnable) {
      if (itemImageNameElement && color) {
        // itemImageNameElement.style.borderColor = color+"!important";
        itemImageNameElement.style.border = "solid " + color;
        // itemImageNameElement.style.borderWidth = "thick";
      }
    }
  }

  // Change rarity select element
  const raritySelectElement = htmlElement.querySelector(options.raritySelectSelector);
  if (!raritySelectElement) {
    return;
  }
  // const customRarities = game.settings.get(CONSTANTS.MODULE_ID, "rarityNames");
  raritySelectElement.querySelectorAll(`option`).forEach((optionEl) => {
    let rarityOrType = optionEl.value?.replaceAll(/\s/g, "").toLowerCase().trim() ?? undefined;
    if (!rarityOrType) {
      return;
    }
    // if (rarityOrType === "common") {
    //   return;
    // }
    if (!API.mapConfigurations[rarityOrType]) {
      Logger.warn(`Cannot find color for rarity '${rarityOrType}'`, false, API.mapConfigurations);
      return;
    }
    const color = API.mapConfigurations[rarityOrType].color;

    optionEl.style.color = color;
    // Color selected option
    if (optionEl.selected) {
      const backgroundColor = API.getRarityTextBackgroundColor(color);
      optionEl.style.backgroundColor = backgroundColor;
      if (game.modules.get("colorsettings")?.api) {
        const textColor = API.getRarityTextColor(color);
        optionEl.style.color = textColor;
      } else {
        optionEl.style.color = "white";
      }
    }
  });
}

function _retrieveMapItemRarityDefaults() {
  let mapItemRarityDefaults = {};
  mapItemRarityDefaults["common"] = { color: "#000000" };
  mapItemRarityDefaults["uncommon"] = { color: "#4bff4aff" };
  mapItemRarityDefaults["rare"] = { color: "#0000ffff" };
  mapItemRarityDefaults["veryrare"] = { color: "#800080ff" };
  mapItemRarityDefaults["legendary"] = { color: "#ffa500ff" };
  mapItemRarityDefaults["artifact"] = { color: "#d2691eff" };
  mapItemRarityDefaults["spell"] = { color: "#4a8396ff" };
  mapItemRarityDefaults["feat"] = { color: "#48d1ccff" };
  return mapItemRarityDefaults;
}

function _retrieveMapSpellSchoolsRarityDefaults() {
  let mapSpellSchool = {};
  mapSpellSchool["abj"] = { color: "#4bff4aff" };
  mapSpellSchool["con"] = { color: "#d14848ff" };
  mapSpellSchool["div"] = { color: "#4a8396ff" };
  mapSpellSchool["enc"] = { color: "#d557ffff" };
  mapSpellSchool["evo"] = { color: "#48d1ccff" };
  mapSpellSchool["ill"] = { color: "#fffc66ff" };
  mapSpellSchool["nec"] = { color: "#800080ff" };
  mapSpellSchool["trs"] = { color: "#d2691eff" };
  return mapSpellSchool;
}

function _retrieveMapClassFeatureTypesRarityDefaults() {
  let mapClassFeatureTypes = {};
  mapClassFeatureTypes["background"] = { color: "#d557ffff" };
  mapClassFeatureTypes["class"] = { color: "#5e9effff" };
  mapClassFeatureTypes["feat"] = { color: "#d14848ff" };
  mapClassFeatureTypes["monster"] = { color: "#4bff4aff" };
  mapClassFeatureTypes["race"] = { color: "#fffc66ff" };
  mapClassFeatureTypes["supernaturalGift"] = { color: "#ffbc44ff" };
  return mapClassFeatureTypes;
}

export function prepareMapConfigurations() {
  let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
  let mapAll = {};
  if (
    isEmptyObject(configurations) ||
    isEmptyObject(configurations.itemRarity) ||
    isEmptyObject(configurations.itemRarity.defaults)
  ) {
    Logger.warn(`No configurations is been setted yet`);
    let mapItemRarityDefaults = _retrieveMapItemRarityDefaults();
    foundry.utils.mergeObject(mapAll, mapItemRarityDefaults);
  } else {
    prepareMapItemRarity(mapAll, configurations.itemRarity);
  }

  if (
    isEmptyObject(configurations) ||
    isEmptyObject(configurations.spellSchools) ||
    isEmptyObject(configurations.spellSchools.defaults)
  ) {
    let mapSpellSchoolsRarityDefaults = _retrieveMapSpellSchoolsRarityDefaults();
    foundry.utils.mergeObject(mapAll, mapSpellSchoolsRarityDefaults);
  } else {
    prepareMapSpellSchools(mapAll, configurations.spellSchools);
  }

  if (
    isEmptyObject(configurations) ||
    isEmptyObject(configurations.classFeatureTypes) ||
    isEmptyObject(configurations.classFeatureTypes.defaults)
  ) {
    let mapClassFeatureTypesRarityDefaults = _retrieveMapClassFeatureTypesRarityDefaults();
    foundry.utils.mergeObject(mapAll, mapClassFeatureTypesRarityDefaults);
  } else {
    prepareMapClassFeatureTypes(mapAll, configurations.classFeatureTypes);
  }

  // just for retro compatibility
  if (!mapAll["spell"]?.color) {
    mapAll["spell"] = {
      color: "#4a8396ff",
      name: "Spell",
    };
  }
  if (!mapAll["feat"]?.color) {
    mapAll["feat"] = {
      color: "#48d1ccff",
      name: "Feature",
    };
  }
  return mapAll;
}

function prepareMapItemRarity(mapAll, customItemRarity) {
  const custom = customItemRarity.custom ?? {};
  const defaultItemRarity = customItemRarity.defaults;
  for (const [key, value] of Object.entries(defaultItemRarity)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
}

function prepareMapSpellSchools(mapAll, customSpellSchools) {
  const custom = customSpellSchools.custom ?? {};
  const defaultSpellSchools = customSpellSchools.defaults;
  for (const [key, value] of Object.entries(defaultSpellSchools)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
}

function prepareMapClassFeatureTypes(mapAll, customClassFeatureTypes) {
  const custom = customClassFeatureTypes.custom ?? {};
  const defaultClassFeatureTypes = customClassFeatureTypes.defaults;
  for (const [key, value] of Object.entries(defaultClassFeatureTypes)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key !== "undefined") {
      mapAll[key.toLowerCase().trim()] = value;
    }
  }
}

export function prepareConfigurations() {
  let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
  if (
    isEmptyObject(configurations) ||
    isEmptyObject(configurations.itemRarity) ||
    isEmptyObject(configurations.itemRarity.defaults)
  ) {
    configurations = {
      spellSchools: {
        custom: configurations?.spellSchools?.custom || {},
        defaults: {},
      },
      itemRarity: {
        custom: configurations?.itemRarity?.custom || {},
        defaults: {},
      },
      classFeatureTypes: {
        custom: configurations?.classFeatureTypes?.custom || {},
        defaults: {},
      },
    };
    //await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
  }
  configurations ??= {
    spellSchools: {
      custom: configurations?.spellSchools?.custom || {},
      defaults: {},
    },
    itemRarity: {
      custom: configurations?.itemRarity?.custom || {},
      defaults: {},
    },
    classFeatureTypes: {
      custom: configurations?.classFeatureTypes?.custom || {},
      defaults: {},
    },
  };
  configurations.itemRarity ??= {
    custom: {},
    defaults: {},
  };
  configurations.spellSchools ??= {
    custom: {},
    defaults: {},
  };
  configurations.classFeatureTypes ??= {
    custom: {},
    defaults: {},
  };

  prepareItemRarity(configurations.itemRarity);
  prepareSpellSchools(configurations.spellSchools);
  prepareClassFeatureTypes(configurations.classFeatureTypes);
  return configurations;
}

function prepareItemRarity(customItemRarity) {
  // TODO Make something for multisystem here
  const itemRarity = foundry.utils.deepClone(game.dnd5e?.config?.itemRarity || {});
  const custom = customItemRarity.custom ?? {};
  if (isEmptyObject(customItemRarity.defaults)) {
    customItemRarity.defaults = itemRarity;
  }
  const defaultItemRarity = customItemRarity.defaults;
  for (const [key, value] of Object.entries(defaultItemRarity)) {
    if (key === "undefined" || key === "null") {
      delete itemRarity[key];
    } else if (typeof value === "string" || value instanceof String) {
      itemRarity[key] = {
        color: "#000000",
        name: value,
      };
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key === "undefined" || key === "null") {
      continue;
    } else {
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${value.key}'`, false, value);
        continue;
      }
      itemRarity[value.key] = {
        color: value.color ?? "#000000",
        name: value.name ? value.name : value.label,
      };
    }
  }
}

function prepareSpellSchools(customSpellSchools) {
  // TODO Make something for multisystem here
  const spellSchools = foundry.utils.deepClone(game.dnd5e?.config?.spellSchools || {});
  const custom = customSpellSchools.custom ?? {};
  if (isEmptyObject(customSpellSchools.defaults)) {
    customSpellSchools.defaults = spellSchools;
  }
  const defaultSpellSchools = customSpellSchools.defaults;
  for (const [key, value] of Object.entries(defaultSpellSchools)) {
    if (key === "undefined" || key === "null") {
      delete spellSchools[key];
    } else if (typeof value === "string" || value instanceof String) {
      spellSchools[key] = {
        color: "#4a8396ff",
        name: value,
      };
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key === "undefined" || key === "null") {
      continue;
    } else {
      spellSchools[value.key] = {
        color: value.color ?? "#4a8396ff",
        name: value.name ? value.name : value.label,
      };
    }
  }
}

function prepareClassFeatureTypes(customClassFeatureTypes) {
  // TODO Make something for multisystem here
  // const classFeatureTypes = foundry.utils.deepClone(game.dnd5e?.config?.featureTypes?.class?.subtypes || {});
  const classFeatureTypes = foundry.utils.deepClone(game.dnd5e?.config?.featureTypes || {});
  const custom = customClassFeatureTypes.custom ?? {};
  if (isEmptyObject(customClassFeatureTypes.defaults)) {
    customClassFeatureTypes.defaults = classFeatureTypes;
  }
  const defaultClassFeatureTypes = customClassFeatureTypes.defaults;
  for (const [key, value] of Object.entries(defaultClassFeatureTypes)) {
    if (key === "undefined" || key === "null") {
      delete classFeatureTypes[key];
    } else if (typeof value === "string" || value instanceof String) {
      classFeatureTypes[key] = {
        color: "#48d1ccff",
        name: value,
      };
    }
  }
  for (const [key, value] of Object.entries(custom)) {
    if (key === "undefined" || key === "null") {
      continue;
    } else {
      classFeatureTypes[value.key] = {
        color: value.color ?? "#48d1ccff",
        name: value.name ? value.name : value.label,
      };
    }
  }
}

export function colorIsDefault(color) {
  if (!color) {
    return true;
  }
  if (color !== "#000000" && color !== "#000000ff") {
    return false;
  }
  return true;
}

function isDisabled() {
  return (
    !game.settings.get(CONSTANTS.MODULE_ID, "rarityFlag") ||
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.NONE
  );
}

function isBackgroundEnable() {
  return (
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.BACKGROUND_AND_BORDER ||
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.ONLY_BACKGROUND
  );
}

function isBorderEnable() {
  return (
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.BACKGROUND_AND_BORDER ||
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.TEXT_AND_BORDER ||
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.ONLY_BORDER
  );
}

function isTextEnable() {
  return (
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.TEXT_AND_BORDER ||
    game.settings.get(CONSTANTS.MODULE_ID, "rarityColorMode") === CONSTANTS.SETTINGS.MODE.ONLY_TEXT
  );
}
