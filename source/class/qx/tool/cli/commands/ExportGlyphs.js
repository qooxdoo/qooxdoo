/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (@johnspackman)

************************************************************************ */

const fs = require("fs");
const path = require("upath");
const fontkit = require("fontkit");
const tmp = require("tmp");

/**
 * Exports font ligatures as a map
 */
qx.Class.define("qx.tool.cli.commands.ExportGlyphs", {
  extend: qx.tool.cli.commands.Command,

  statics: {
    getYargsCommand() {
      return {
        command: "export-glyphs font-file glyph-file",
        describe: "export font glyphs & ligatures"
      };
    }
  },

  members: {
    /**
     * @override
     */
    async process() {
      let filename = this.argv.fontFile;
      if (filename.match(/^https?:\/\//)) {
        filename = await qx.tool.utils.Http.downloadToTempFile(
          filename,
          /^font\/(ttf|svg|eot|woff|woff2)$/
        );
      }
      let font = await fontkit.open(filename);

      if (!font.GSUB?.lookupList?.toArray()?.length) {
        qx.tool.compiler.Console.error(
          `The webfont in ${filename} does not have any ligatures`
        );

        return;
      }

      let glyphs = {};

      // some IconFonts (MaterialIcons for example) use ligatures
      // to name their icons. This code extracts the ligatures
      // hat tip to Jossef Harush https://stackoverflow.com/questions/54721774/extracting-ttf-font-ligature-mappings/54728584
      let ligatureName = {};
      let lookupList = font.GSUB.lookupList.toArray();
      let lookupListIndexes =
        font.GSUB.featureList[0].feature.lookupListIndexes;
      lookupListIndexes.forEach(index => {
        let subTable = lookupList[index].subTables[0];
        let leadingCharacters = [];
        if (subTable?.coverage?.rangeRecords) {
          subTable.coverage.rangeRecords.forEach(coverage => {
            for (let i = coverage.start; i <= coverage.end; i++) {
              let character = font.stringsForGlyph(i)[0];
              leadingCharacters.push(character);
            }
          });
        }
        let ligatureSets = subTable?.ligatureSets?.toArray() || [];
        ligatureSets.forEach((ligatureSet, ligatureSetIndex) => {
          let leadingCharacter = leadingCharacters[ligatureSetIndex];
          ligatureSet.forEach(ligature => {
            let character = font.stringsForGlyph(ligature.glyph)[0];
            if (!character) {
              // qx.tool.compiler.Console.log(`WARN: ${this.getName()} no character ${ligature}`);
              return;
            }
            let ligatureText =
              leadingCharacter +
              ligature.components.map(x => font.stringsForGlyph(x)[0]).join("");
            var hexId = character.charCodeAt(0).toString(16);
            if (ligatureName[hexId] == undefined) {
              ligatureName[hexId] = [ligatureText];
            } else {
              ligatureName[hexId].push(ligatureText);
            }
          });
        });
      });

      font.characterSet.forEach(codePoint => {
        let glyph = font.glyphForCodePoint(codePoint);
        let commands = null;
        try {
          // This can throw an exception if the font does not support ligatures
          commands = glyph?.path?.commands;
        } catch (ex) {
          commands = null;
        }
        if (!commands?.length && !glyph.layers) {
          return;
        }

        const found = gName => {
          glyphs[gName] = {
            advanceWidth: glyph.advanceWidth,
            advanceHeight: glyph.advanceHeight,
            codePoint
          };
        };
        if (glyph.name) {
          found(glyph.name);
        }
        var names = ligatureName[codePoint.toString(16)];
        if (names) {
          names.forEach(found);
        }
      });

      await fs.promises.writeFile(
        this.argv.glyphFile,
        JSON.stringify(glyphs, null, 2),
        "utf8"
      );
    }
  }
});
