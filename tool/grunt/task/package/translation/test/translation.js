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

module.exports = {
  setUp: function(done) {
    this.translation = require('../lib/translation.js');
    done();
  },

  getTranslationFor: function (test) {
    var locale = 'de';
    var transPaths = [
      '../../../../../framework/source/translation',
      './test/data',
      'i/dont/exist'
    ];
    var translations = this.translation.getTranslationFor(locale, transPaths);

    test.ok('Hello world' in translations);
    test.ok('Hello worlds' in translations);
    test.ok('Hello another world' in translations);
    test.ok('key_full_Escape' in translations);

    test.done();
  }
};
