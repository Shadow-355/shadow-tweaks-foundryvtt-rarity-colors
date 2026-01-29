import CONSTANTS from "./constants.js";
import { RarityColorsApp } from "./apps/rarity-colors-app.js";
import Logger from "./lib/Logger.js";
export const registerSettings = function () {
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "resetAllSettings", {
    name: `${CONSTANTS.MODULE_ID}.setting.reset.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.reset.hint`,
    icon: "fas fa-coins",
    type: ResetSettingsDialog,
    restricted: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "rarityFlag", {
    name: `${CONSTANTS.MODULE_ID}.setting.rarityFlag.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.rarityFlag.hint`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "spellFlag", {
    name: `${CONSTANTS.MODULE_ID}.setting.spellFlag.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.spellFlag.hint`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "featFlag", {
    name: `${CONSTANTS.MODULE_ID}.setting.featFlag.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.featFlag.hint`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "configurations", {
    scope: "world",
    config: false,
    type: Object,
    default: {
      spellSchools: {
        custom: {},
        defaults: {},
      },
      itemRarity: {
        custom: {},
        defaults: {},
      },
      classFeatureTypes: {
        custom: {},
        defaults: {},
      },
    },
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "rarityColorsAppMenu", {
    name: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.menu.name`),
    label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.menu.label`),
    hint: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.menu.hint`),
    icon: "fas fa-cogs",
    scope: "world",
    restricted: true,
    type: RarityColorsApp,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "rarityColorMode", {
    name: `${CONSTANTS.MODULE_ID}.setting.rarityColorMode.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.rarityColorMode.hint`,
    scope: "client",
    config: true,
    requiresReload: true,
    type: String,
    choices: {
      None: "None",
      TextAndBorder: "Text and Border",
      BackgroundAndBorder: "Background and Border",
      OnlyBackground: "Only Background",
      OnlyText: "Only Text",
      OnlyBorder: "Only Border",
    },
    default: "TextAndBorder",
  });

  game.settings.register(CONSTANTS.MODULE_ID, "disableRarityColorOnCompendium", {
    name: `${CONSTANTS.MODULE_ID}.setting.disableRarityColorOnCompendium.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.disableRarityColorOnCompendium.hint`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  });

  /*
    game.settings.register(CONSTANTS.MODULE_ID, "enableBackgroundColorInsteadText", {
        name: `${CONSTANTS.MODULE_ID}.setting.enableBackgroundColorInsteadText.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.enableBackgroundColorInsteadText.hint`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "enableBorderColor", {
        name: `${CONSTANTS.MODULE_ID}.setting.enableBorderColor.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.enableBorderColor.hint`,
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        requiresReload: true,
    });
    */

  game.settings.register(CONSTANTS.MODULE_ID, "thresholdBackgroundColorInsteadText", {
    name: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.thresholdBackgroundColorInsteadText.name`),
    hint: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.thresholdBackgroundColorInsteadText.hint`),
    scope: "client",
    config: true,
    default: 0.5,
    type: Number,
    range: { min: 0, max: 1, step: 0.1 },
    requiresReload: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "forceThresholdBackgroundColorInsteadText", {
    name: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.forceThresholdBackgroundColorInsteadText.name`),
    hint: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.forceThresholdBackgroundColorInsteadText.hint`),
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "forceAlphaBackgroundColorInsteadText", {
    name: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.forceAlphaBackgroundColorInsteadText.name`),
    hint: Logger.i18n(`${CONSTANTS.MODULE_ID}.setting.forceAlphaBackgroundColorInsteadText.hint`),
    scope: "client",
    config: true,
    default: 0.25,
    type: Number,
    range: { min: 0, max: 1, step: 0.01 },
    requiresReload: true,
  });

  // ========================================================================
  game.settings.register(CONSTANTS.MODULE_ID, "debug", {
    name: `${CONSTANTS.MODULE_ID}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.debug.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });
};
class ResetSettingsDialog extends FormApplication {
  constructor(...args) {
    //@ts-ignore
    super(...args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
      content:
        '<p style="margin-bottom:1rem;">' +
        game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) +
        "</p>",
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
          callback: async () => {
            const worldSettings = game.settings.storage
              ?.get("world")
              ?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
            for (let setting of worldSettings) {
              Logger.log(`Reset setting '${setting.key}'`);
              await setting.delete();
            }
            //window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`),
        },
      },
      default: "cancel",
    });
  }
  async _updateObject(event, formData) {
    // do nothing
  }
}
