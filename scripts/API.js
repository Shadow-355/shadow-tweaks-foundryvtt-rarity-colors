import CONSTANTS from "./constants.js";
import { isEmptyObject, isItemUnidentified, isRealNumber } from "./lib/lib.js";
import { fontColorContrast } from "./libs/font-color-contrast-11.1.0/FontColorContrast.js";
import { colorIsDefault, prepareMapConfigurations } from "./raritycolors.js";
import Logger from "./lib/Logger.js";
import { RetrieveHelpers } from "./lib/retrieve-helpers.js";

/**
 * Create a new API class and export it as default
 */
const API = {
  mapConfigurations: null,

  /**
   * Method to recover the color from a item object
   * @param {string|Item} item
   * @param {boolean} applyModuleSettings if true it will apply the 'rarity-colors' module settings
   * @returns {string|null} the hex string of the color or the null value if not founded
   */
  getColorFromItem(item, applyModuleSettings = true) {
    if (!item) {
      Logger.warn(`getColorFromItem | No item reference is been passed`, true);
      return;
    }
    // Error: fromUuidSync was invoked on UUID
    // 'Compendium.mon-compendium-partager.monstres-partager.Actor.WrDj95t16BTLQUGT.Item.vowp2kgd28v1VwqG'
    // which references an Embedded Document and cannot be retrieved synchronously.
    try {
      item = RetrieveHelpers.getItemSync(item, true);
    } catch (e) {
      Logger.debug(e.message);
      item = null;
    }
    if (!item) {
      Logger.error(`getColorFromItem | No item found with reference`, false, item);
      return null;
    }
    // TODO make multisystem only dnd5e supported
    if (isItemUnidentified(item)) {
      Logger.debug(`Item is not identified no color is applied`, item);
      return null;
    }

    const spellFlag = game.settings.get(CONSTANTS.MODULE_ID, "spellFlag");
    const featFlag = game.settings.get(CONSTANTS.MODULE_ID, "featFlag");
    let type = item?.type;
    const isSpell = type === "spell";
    const isFeat = type === "feat";

    // let rarity = item.getRollData()?.item.rarity || item?.system?.rarity || undefined;
    let rarity = item?.system?.rarity || undefined;
    rarity = rarity ? rarity.replaceAll(/\s/g, "").toLowerCase().trim() : undefined;
    // if (rarity && rarity === "common") {
    //   continue;
    // }

    let rarityOrType = rarity || (isSpell || isFeat ? type : undefined);
    let doColor = false;
    if (rarityOrType !== "" && rarityOrType !== undefined) {
      doColor = true;
    }
    if (isSpell) {
      rarityOrType = item?.system.school ?? "spell";
      if (!this.mapConfigurations[rarityOrType]) {
        rarityOrType = "spell";
      }
      if (spellFlag) {
        doColor = true;
      } else {
        doColor = false;
      }
    }
    if (isFeat) {
      rarityOrType = item?.system.type?.value ? item?.system.type?.value ?? "feat" : item?.system.type ?? "feat";
      if (!this.mapConfigurations[rarityOrType]) {
        rarityOrType = "feat";
      }
      if (featFlag) {
        doColor = true;
      } else {
        doColor = false;
      }
    }

    if (applyModuleSettings) {
      if (rarityOrType !== "" && rarityOrType !== undefined && doColor) {
        Logger.debug(`getColorFromItem | Try to get color with settings : ${rarityOrType}`);
        if (!this.mapConfigurations[rarityOrType]) {
          Logger.warn(
            `getColorFromItem | Cannot find color for rarity '${rarityOrType}'`,
            false,
            this.mapConfigurations,
          );
          return null;
        }
        const color = this.mapConfigurations[rarityOrType].color;
        if (!colorIsDefault(color)) {
          return color;
        }
      }
      return null;
    } else {
      if (rarityOrType !== "" && rarityOrType !== undefined) {
        Logger.debug(`getColorFromItem | Try to get color without settings : ${rarityOrType}`);
        if (!this.mapConfigurations[rarityOrType]) {
          Logger.warn(
            `getColorFromItem | Cannot find color for rarity '${rarityOrType}'`,
            false,
            this.mapConfigurations,
          );
          return null;
        }
        const color = this.mapConfigurations[rarityOrType].color;
        if (!colorIsDefault(color)) {
          return color;
        }
      }
      return null;
    }
  },

  /**
   * Retrieve the full color map of 'rarity-color' for you own use ?
   * @returns {Object.<string, {color: string}>}
   */
  getColorMap() {
    if (isEmptyObject(this.mapConfigurations)) {
      this.mapConfigurations = prepareMapConfigurations();
    }
    return this.mapConfigurations;
  },

  /**
   * Makes the background color with a specific opacity
   * @href https://wunnle.com/dynamic-text-color-based-on-background
   * @href https://stackoverflow.com/questions/54230440/how-to-change-text-color-based-on-rgb-and-rgba-background-color
   * @param {String} rgbaHex 8 long hex value in string form, eg: "#123456ff"
   * @return rgba as string e.g. rgba('xxx','xxx','xxx','xxx')
   */
  getRarityTextBackgroundColor(rgbaHex, alpha = 0.25) {
    const forceAlphaBackgroundColorInsteadText = game.settings.get(
      CONSTANTS.MODULE_ID,
      "forceAlphaBackgroundColorInsteadText",
    );

    let realAlpha = alpha;
    if (forceAlphaBackgroundColorInsteadText > 0) {
      realAlpha = forceAlphaBackgroundColorInsteadText;
    }

    const rgba = this.hexToRGBA(rgbaHex);
    const newRgba = this.RGBAToHex(rgba.r, rgba.g, rgba.b, realAlpha);
    // const newRgbaS = "rgba(" + newRgba.r + ", " + newRgba.g + ", " + newRgba.b + ", " + realAlpha + ")"
    return newRgba;
  },

  /**
   * Makes text white or black according to background color
   * @href https://wunnle.com/dynamic-text-color-based-on-background
   * @href https://stackoverflow.com/questions/54230440/how-to-change-text-color-based-on-rgb-and-rgba-background-color
   * @param {String} rgbaHex 8 long hex value in string form, eg: "#123456ff"
   * @param {number} threshold Contrast threshold to control the resulting font color, float values from 0 to 1. Default is 0.5.
   * @returns {String} "black" or "white"
   */
  getRarityTextColor(rgbaHex, threshold = 0.5) {
    const forceThresholdBackgroundColorInsteadText = game.settings.get(
      CONSTANTS.MODULE_ID,
      "forceThresholdBackgroundColorInsteadText",
    );
    const thresholdBackgroundColorInsteadText = game.settings.get(
      CONSTANTS.MODULE_ID,
      "thresholdBackgroundColorInsteadText",
    );

    const rgba = this.hexToRGBA(rgbaHex);
    let newThreshold = threshold;
    if (isRealNumber(rgba.a)) {
      newThreshold = forceThresholdBackgroundColorInsteadText ? thresholdBackgroundColorInsteadText : 1 - rgba.a;
    }
    return this.getTextColor(rgbaHex, newThreshold);
  },

  // ============================
  // COLOR SETTINGS MIRROR API
  // ============================

  /**
   * Turn hex rgba into rgba object
   * @param {String} hex 8 long hex value in string form, eg: "#123456ff"
   * @returns object of {r, g, b, a}
   */
  hexToRGBA(hex) {
    // return game.modules.get("colorsettings").api.hexToRGBA(hex);

    const hexArr = hex.slice(1).match(new RegExp(".{2}", "g"));
    const [r, g, b, a] = hexArr.map((hexStr) => {
      return parseInt(hexStr.repeat(2 / hexStr.length), 16);
    });
    const realAlpha = isRealNumber(a) ? a : 1;
    const rgba = [r, g, b, Math.round((realAlpha / 256 + Number.EPSILON) * 100) / 100];
    return {
      r: rgba[0] ?? 255,
      g: rgba[1] ?? 255,
      b: rgba[2] ?? 255,
      a: rgba[3] ?? 255,
    };
  },

  /**
   * Makes text white or black according to background color
   * @href https://wunnle.com/dynamic-text-color-based-on-background
   * @href https://stackoverflow.com/questions/54230440/how-to-change-text-color-based-on-rgb-and-rgba-background-color
   * @param {String} rgbaHex 8 long hex value in string form, eg: "#123456ff"
   * @param {number} threshold Contrast threshold to control the resulting font color, float values from 0 to 1. Default is 0.5.
   * @returns {String} "black" or "white"
   */
  getTextColor(rgbaHex, threshold = 0.5) {
    // return game.modules.get("colorsettings").api.getTextColor(rgbaHex);

    const rgba = this.hexToRGBA(rgbaHex);
    // OLD METHOD
    /*
    //const realAlpha = isRealNumber(rgba.a) ? rgba.a : 1;
    const brightness = Math.round((rgba.r * 299 + rgba.g * 587 + rgba.b * 114) / 1000);
    // const realAlpha = isRealNumber(rgba.a) ? rgba.a : 1;
    if (isRealNumber(rgba.a) && rgba.a > 0.5) {
      return brightness > 125 ? "black" : "white";
    } else {
      //return 'black';
      return brightness > 125 ? "black" : "white";
    }
    */
    const hexTextColor = fontColorContrast(rgba.r, rgba.g, rgba.b, threshold);
    return hexTextColor;
  },

  /**
   * Convert a Array of rgba[r, g, b, a] in string format to a hex string
   * @param {String} rgba as string e.g. rgba('xxx','xxx','xxx','xxx')
   * @param {boolean} forceRemoveAlpha
   * @returns turns the hex string
   */
  RGBAToHexFromString(rgba, forceRemoveAlpha = false) {
    // return game.modules.get("colorsettings").api.RGBAToHexFromString(rgba, forceRemoveAlpha);

    return (
      "#" +
      rgba
        .replace(/^rgba?\(|\s+|\)$/g, "") // Get's rgba / rgb string values
        .split(",") // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map((string) => parseFloat(string)) // Converts them to numbers
        .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
        .map((number) => number.toString(16)) // Converts numbers to hex
        .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
        .join("")
    ); // Puts the array to together to a string
  },

  /**
   * Convert a Array of rgba[r, g, b, a] in to a hex string
   * @param {*} r
   * @param {*} g
   * @param {*} b
   * @param {*} a
   * @returns the hex string
   */
  RGBAToHex(r, g, b, a) {
    // return game.modules.get("colorsettings").api.RGBAToHex(r, g, b, a);

    let r2 = r.toString(16);
    let g2 = g.toString(16);
    let b2 = b.toString(16);
    let a2 = Math.round(a * 255).toString(16);

    if (r2.length == 1) {
      r2 = "0" + r2;
    }
    if (g2.length == 1) {
      g2 = "0" + g2;
    }
    if (b2.length == 1) {
      b2 = "0" + b2;
    }
    if (a2.length == 1) {
      a2 = "0" + a2;
    }
    return "#" + r2 + g2 + b2 + a2;
  },

  /**
   * Turn hex rgba into rgba string
   * @href https://stackoverflow.com/questions/19799777/how-to-add-transparency-information-to-a-hex-color-code
   * @href https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
   * @param colorHex
   * @param alpha
   * @return rgba as string e.g. rgba('xxx','xxx','xxx','xxx')
   */
  hexToRGBAString(colorHex, alpha = 1) {
    // return game.modules.get("colorsettings").api.hexToRGBAString(colorHex, alpha);

    let rgba = Color.from(colorHex);
    // return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + ")";
    if (colorHex.length > 7) {
      rgba = this.hexToRGBA(colorHex);
    } else {
      const colorHex2 = `${colorHex}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`;
      rgba = this.hexToRGBA(colorHex2);
      // const c = Color.from(colorHex);
      // rgba = c.toRGBA();
    }
    const realAlpha = isRealNumber(rgba.a) ? rgba.a : alpha;
    return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + realAlpha + ")";
  },

  /**
   * Calculate brightness value by RGB or HEX color.
   * @param color (String) The color value in RGB or HEX (for example: #000000 || #000 || rgb(0,0,0) || rgba(0,0,0,0))
   * @returns (Number) The brightness value (dark) 0 ... 255 (light)
   * @return {number} brigthness
   */
  brightnessByColor(colorHexOrRgb) {
    let color = "" + colorHexOrRgb;
    let isHEX = color.indexOf("#") == 0;
    let isRGB = color.indexOf("rgb") == 0;
    let r = 0;
    let g = 0;
    let b = 0;
    if (isHEX) {
      const rgba = this.hexToRGBA(color);
      r = rgba.r;
      g = rgba.g;
      b = rgba.b;
    }
    if (isRGB) {
      var m = color.match(/(\d+){3}/g);
      if (m) {
        r = m[0];
        g = m[1];
        b = m[2];
      }
    }
    if (typeof r != "undefined") {
      return (r * 299 + g * 587 + b * 114) / 1000;
    } else {
      return undefined;
    }
  },
};

export default API;
