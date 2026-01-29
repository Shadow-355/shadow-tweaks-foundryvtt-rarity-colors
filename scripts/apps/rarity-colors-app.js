import { ORIGINAL_CONFIG, prepareConfigurations, prepareMapConfigurations } from "../raritycolors.js";
import CONSTANTS from "../constants.js";
import { isEmptyObject } from "../lib/lib.js";
import Logger from "../lib/Logger.js";

export class RarityColorsApp extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.RarityColorsApp.title`),
      template: `modules/${CONSTANTS.MODULE_ID}/templates/rarityColorsApp.hbs`,
      id: `${CONSTANTS.MODULE_ID}-config-app`,
      width: 620,
      height: "auto",
      resizable: true,
      closeOnSubmit: true,
      submitOnClose: true,
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "canvas" }],
      filepickers: [],
    });
  }

  getData() {
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }

    let mapDefaults = prepareMapConfigurations();

    // Item Rarity
    configurations.itemRarity ??= {};
    const configurationsItemRarityDefaultsTmp = foundry.utils.duplicate(configurations.itemRarity.defaults);
    for (const [key, value] of Object.entries(configurationsItemRarityDefaultsTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.itemRarity.defaults[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#000000";
      }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.itemRarity[key];
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.itemRarity[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.itemRarity[key]);
      }
      configurations.itemRarity.defaults[key] = value;
    }

    configurations.itemRarity.custom ??= {};
    const configurationsItemRarityCustomTmp = foundry.utils.duplicate(configurations.itemRarity.custom);
    for (const [key, value] of Object.entries(configurationsItemRarityCustomTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.itemRarity.custom[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#000000";
      }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.itemRarity[key];
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.itemRarity[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.itemRarity[key]);
      }
      configurations.itemRarity.custom[key] = value;
    }

    // Spells School
    configurations.spellSchools ??= {};
    const configurationsSpellSchoolsDefaultsTmp = foundry.utils.duplicate(configurations.spellSchools.defaults);
    for (const [key, value] of Object.entries(configurationsSpellSchoolsDefaultsTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.spellSchools.defaults[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#4a8396";
      }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.spellSchools[key];
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.spellSchools[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.spellSchools[key]);
      }
      configurations.spellSchools.defaults[key] = value;
    }

    configurations.spellSchools.custom ??= {};
    const configurationsSpellSchoolsCustomTmp = foundry.utils.duplicate(configurations.spellSchools.custom);
    for (const [key, value] of Object.entries(configurationsSpellSchoolsCustomTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.spellSchools.custom[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#4a8396";
      }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.spellSchools[key];
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.spellSchools[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.spellSchools[key]);
      }
      configurations.spellSchools.custom[key] = value;
    }

    // Class feature Types
    configurations.classFeatureTypes ??= {};
    const configurationsClassFeatureTypesDefaultsTmp = foundry.utils.duplicate(
      configurations.classFeatureTypes.defaults,
    );
    for (const [key, value] of Object.entries(configurationsClassFeatureTypesDefaultsTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.classFeatureTypes.defaults[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#48d1cc";
      }
      // if (value.label) {
      //   value.name = value.label;
      // }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.featureTypes[key]?.label ?? "";
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.featureTypes[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.featureTypes[key]);
      }
      configurations.classFeatureTypes.defaults[key] = value;
    }

    configurations.classFeatureTypes.custom ??= {};
    const configurationsClassFeatureTypesCustomTmp = foundry.utils.duplicate(configurations.classFeatureTypes.custom);
    for (const [key, value] of Object.entries(configurationsClassFeatureTypesCustomTmp)) {
      if (typeof value === "string" || value instanceof String || key === "undefined" || key === "null") {
        delete configurations.classFeatureTypes.custom[key];
        continue;
      }
      if (!value) {
        Logger.warn(`Cannot find color for rarity '${key}'`, false, value);
        continue;
      }
      if (!value.color || value.color === "#000000") {
        value.color = mapDefaults[key]?.color || "#48d1cc";
      }
      if (value.label) {
        value.name = value.label;
      }
      // if (!value.name) {
      //   value.name = ORIGINAL_CONFIG.featureTypes[key]?.label ?? "";
      // }
      if (!value.name || this._tryToRetrieveName(ORIGINAL_CONFIG.featureTypes[key])) {
        value.name = this._tryToRetrieveName(ORIGINAL_CONFIG.featureTypes[key]);
      }
      configurations.classFeatureTypes.custom[key] = value;
    }
    return { configurations, ORIGINAL_CONFIG };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("change", "input", this._onChangeInput.bind(this));
    html.on("click", "#add-item-rarity", this._addItemRarity.bind(this));
    html.on("click", ".delete-item-rarity", this._deleteItemRarity.bind(this));
    html.on("click", "#add-spell-school", this._addSpellSchool.bind(this));
    html.on("click", ".delete-spell-school", this._deleteSpellSchool.bind(this));
    html.on("click", "#add-class-feature", this._addClassFeature.bind(this));
    html.on("click", ".delete-class-feature", this._deleteClassFeature.bind(this));
  }

  async _onChangeInput(event) {
    await this._updateObject(event, this._getSubmitData());
    this.render(true);
  }

  async _addItemRarity(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const newItemRarity = {
      name: "New Item Rarity",
      key: "new",
      color: "#000000",
    };
    configurations.itemRarity ??= {};
    configurations.itemRarity.custom ??= {};
    configurations.itemRarity.custom[foundry.utils.randomID()] = newItemRarity;
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _deleteItemRarity(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const itemRarity = event.currentTarget.closest("tr").dataset.itemRarityId;
    delete configurations.itemRarity.custom[itemRarity];
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _addSpellSchool(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const newSpellSchool = {
      name: "New Spell School",
      key: "new",
      color: "#000000",
    };
    configurations.spellSchools ??= {};
    configurations.spellSchools.custom ??= {};
    configurations.spellSchools.custom[foundry.utils.randomID()] = newSpellSchool;
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _deleteSpellSchool(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const spellSchool = event.currentTarget.closest("tr").dataset.spellSchoolId;
    delete configurations.spellSchools.custom[spellSchool];
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _addClassFeature(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const newClassFeature = {
      name: "New Class Feature",
      key: "new",
      color: "#000000",
    };
    configurations.classFeatureTypes ??= {};
    configurations.classFeatureTypes.custom ??= {};
    configurations.classFeatureTypes.custom[foundry.utils.randomID()] = newClassFeature;
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _deleteClassFeature(event) {
    event.preventDefault();
    let configurations = game.settings.get(CONSTANTS.MODULE_ID, "configurations");
    if (
      isEmptyObject(configurations) ||
      isEmptyObject(configurations.itemRarity) ||
      isEmptyObject(configurations.itemRarity.defaults)
    ) {
      configurations = prepareConfigurations();
    }
    const classFeature = event.currentTarget.closest("tr").dataset.classFeatureId;
    delete configurations.classFeatureTypes.custom[classFeature];
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", configurations);
    this.render(true);
  }

  async _updateObject(event, formData) {
    Logger.log("RarityColorsApp | _updateObject | formData", formData);
    const expanded = expandObject(formData);
    await game.settings.set(CONSTANTS.MODULE_ID, "configurations", expanded);
  }

  async close(...args) {
    await super.close(...args);
    SettingsConfig.reloadConfirm();
  }

  _tryToRetrieveName(value) {
    if (!value) {
      return "";
    }
    if (typeof value === "string" || value instanceof String) {
      return Logger.i18n(value);
    } else {
      if (value.label) {
        if (typeof value.label === "string" || value.label instanceof String) {
          return Logger.i18n(value.label);
        }
      }
      if (value.name) {
        if (typeof value.name === "string" || value.name instanceof String) {
          return Logger.i18n(value.name);
        }
      }
    }
    return "";
  }
}
