### 13.0.0 - Overhaul: Updated to FoundryV13

- Summary: Adds initialization and robust UI hooks to apply rarity-based colors across actor sheets, item sheets, containers, sidebars, and compendia.

- Key additions:
  - Initialization: `initHooks`, `setupHooks`, `readyHooks` and module `API` wiring.
  - Rendering hooks: support for Tidy5e character/item sheets, standard actor/item sheets, container rendering, sidebar and compendium listings.
  - Color application modes: background, text, and border (switchable via settings); integration with `colorsettings` for readable text color.
  - Configuration handling: `prepareConfigurations`, `prepareMapConfigurations`, per-type preparation helpers, and sensible defaults for rarities/spell schools/feature types.
  - Safety & compatibility: clears previous inline styles before reapplying; resilient DOM selectors and jQuery/native handling; UUID resolution fallbacks; skips unidentified items.

- Utilities & helpers:
  - `renderActorRarityColors`, `renderItemSheetRarityColors`, `applyChangesCompendiumRarityColor`.
  - Default maps: `_retrieveMapItemRarityDefaults`, `_retrieveMapSpellSchoolsRarityDefaults`, `_retrieveMapClassFeatureTypesRarityDefaults`.
  - `colorIsDefault` helper and multiple `is*Enable` helpers for mode checks.

- Notes / TODO:
  - Multi-system (non-dnd5e) support is noted but not implemented.
  - `updateItem` hook is present but commented out. 

### 12.0.2

- quick fix: adding Tidy v7.5.0 compatibility https://github.com/p4535992/foundryvtt-rarity-colors/pull/27 ty to @kgar

### 12.0.1

- Fix https://github.com/p4535992/foundryvtt-rarity-colors/issues/24
- Fix https://github.com/p4535992/foundryvtt-rarity-colors/issues/21
- Set minimum version to 11

### 12.0.0

- Manage error https://github.com/p4535992/foundryvtt-rarity-colors/issues/20
- Manage error https://github.com/p4535992/foundryvtt-rarity-colors/issues/21
- Manage error https://github.com/p4535992/foundryvtt-rarity-colors/issues/19
- Add feature for Dnd5e https://github.com/p4535992/foundryvtt-rarity-colors/issues/22

### 0.3.21

- Try to fix again  https://github.com/p4535992/foundryvtt-rarity-colors/issues/10

### 0.3.20

- Add maximum compatibility to v12

### 0.3.19

- BUg fix: https://github.com/p4535992/foundryvtt-rarity-colors/issues/17

### 0.3.18

- Add better module settings for choose the mode styling
- Fix: https://github.com/p4535992/foundryvtt-rarity-colors/issues/16

### 0.3.17

- Add new feature : Border color on itme images
- Add compatbility with tidy5e shett ty to kgar effort

### 0.3.16

- Add some better check


### 0.3.14-15

- Add support for compendiums

### 0.3.13

- Bug fixing again https://github.com/p4535992/foundryvtt-rarity-colors/issues/12
- Bug fix add new voice on the rarity application

### 0.3.12

- Many bug fixing on the rendering app...
- Bug fix: https://github.com/p4535992/foundryvtt-rarity-colors/issues/13
- Bug fix: https://github.com/p4535992/foundryvtt-rarity-colors/issues/12

### 0.3.11

- Add double check for https://github.com/p4535992/foundryvtt-rarity-colors/issues/10 ?

### 0.3.10

- Add library [font-color-contrast](https://github.com/russoedu/font-color-contrast) for support the text color calculation
- Add module setting 'thresholdBackgroundColorInsteadText'
- Add module setting 'forceThresholdBackgroundColorInsteadText'
- Add module setting 'forceAlphaBackgroundColorInsteadText'
- Add api method brightnessByColor
- Bug fix again https://github.com/p4535992/foundryvtt-rarity-colors/issues/6

### 0.3.9

- Add some null pointer check

### 0.3.8

- Better integration with tidy5e sheet ty to @kgar https://github.com/p4535992/foundryvtt-rarity-colors/pull/8, https://github.com/p4535992/foundryvtt-rarity-colors/pull/9
- Bug fix https://github.com/p4535992/foundryvtt-rarity-colors/issues/6

### 0.3.7

- Try to fix : https://discord.com/channels/170995199584108546/722566083499786352/1168493224738959360

### 0.3.6

- Fixed not read the module settings...

### 0.3.5

- Add new feature: https://github.com/p4535992/foundryvtt-rarity-colors/issues/5
- Add API support and documentation

### 0.3.4

- Try to fix again: https://github.com/p4535992/foundryvtt-rarity-colors/issues/3

### 0.3.3

- Bug fix: https://github.com/p4535992/foundryvtt-rarity-colors/issues/3, removed colorsettings picker in favor of standard input color

### 0.3.0-1-2

- Upgrade for fvt1t1

### 0.2.4

- First new rewrited release
