/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

/**
 * @module translation
 *
 * @desc
 * Wrapper for po files which exposes tailored data for qooxdoo translation.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// native
var fs = require('fs');
var path = require('path');

// third party
var PO = require('pofile');


//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Tries to read <code>{locale}.po</code> files under the given translation paths.
   *
   * @param {string} locale - e.g. <code>en</code> or <code>de</code>
   * @param {string[]} translationPaths
   * @returns {Object[]} translations <code>{{msgid}: {msgstr}}</code>
   */
  getTranslationFor: function(locale, translationPaths) {
    var contents = '';
    var po = {};
    var i = 0;
    var j = 0;
    var l = translationPaths.length;
    var l2 = 0;
    var curPath = '';
    var curPathToPoFile = '';
    var poExt = '.po';
    var translationMap = {};
    var result = {};
    var item;

    for (; i<l; i++) {
      curPath = translationPaths[i];
      curPathToPoFile = path.join(curPath, locale) + poExt;
      if (!fs.existsSync(curPathToPoFile)) {
        // throw Error('Can't read *.po file at: ' + curPathToPoFile);
        continue;
      }

      contents = fs.readFileSync(curPathToPoFile, {encoding: 'utf8'});
      // currently we just read the file and use it in its entirety
      // the Gernerator only uses the matching trx() calls of the pofiles
      // belonging to the framework, which is pretty expensive -
      // a compromise (if needed) could be to add references
      // to the po files ('#: reference')
      po = PO.parse(contents);

      l2 = po.items.length;
      for (j=0; j<l2; j++) {
        item = po.items[j];
        if (item.msgstr[0] === "") {
          continue;
        }
        result[item.msgid] = item.msgstr[0];
        if (item.msgid_plural !== null) {
          // this could fail for languages having more than one plural form
          result[item.msgid_plural] = item.msgstr[1];
        }
      }
    }

    return result;
  }
};
