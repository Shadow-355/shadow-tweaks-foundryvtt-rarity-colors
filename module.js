import { registerSettings } from "./scripts/settings.js";
import { initHooks, readyHooks, setupHooks } from "./scripts/raritycolors.js";
import CONSTANTS from "./scripts/constants.js";
import Logger from "./scripts/lib/Logger.js";

console.log("🎨 Rarity Colors Module: Loading...");

/* ------------------------------------ */
/* Initialize module */
/* ------------------------------------ */
Hooks.once("init", () => {
  console.log("🎨 Rarity Colors Module: init hook firing");
  // Do anything once the module is ready
  // if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
  //     let word = "install and activate";
  //     if (game.modules.get("lib-wrapper"))
  //         word = "activate";
  //     throw Logger.error(`Requires the 'libWrapper' module. Please ${word} it.`);
  // }
  if (!game.modules.get("colorsettings")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("colorsettings")) word = "activate";
    throw Logger.error(`Requires the 'colorsettings' module. Please ${word} it.`);
  }
  // Register custom module settings
  registerSettings();

  initHooks();
  // readyHooks();
  // Assign custom classes and constants here
  // Register custom module settings
  // registerSettings();
  // fetchParams();
  // Preload Handlebars templates
  // await preloadTemplates();
  // Register custom sheets (if any)
});
/* ------------------------------------ */
/* Setup module */
/* ------------------------------------ */
Hooks.once("setup", () => {
  console.log("🎨 Rarity Colors Module: setup hook firing");
  try {
    setupHooks();
    console.log("🎨 Rarity Colors Module: setupHooks() completed successfully");
  } catch (e) {
    console.error("🎨 Rarity Colors Module: Error in setupHooks():", e);
  }
  // Do anything after initialization but before ready
  // setupModules();
  // registerSettings();
});
/* ------------------------------------ */
/* When ready */
/* ------------------------------------ */
Hooks.once("ready", () => {
  // if (!game.modules.get("socketLib")?.active && game.user?.isGM) {
  // 	let word = "install and activate";
  // 	if (game.modules.get("socketLib")) word = "activate";
  // 	    throw Logger.error(`Requires the 'socketLib' module. Please ${word} it.`);
  // }
  // Do anything once the module is ready
  // prepareConfigurations();
  readyHooks();
});

/* ------------------------------------ */
/* Other Hooks */
/* ------------------------------------ */

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});
