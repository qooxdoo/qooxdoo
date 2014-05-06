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

  // test exported functions
  external: {
    setUp: function(done) {
      this.ltAnnotator = require('../lib/annotator/loadTime.js');
      this.pAnnotator = require('../lib/annotator/parent.js');
      done();
    },

    annotate: function(test) {
      var tree = {
      };

      var qxFooMyClass = 'qx.Bootstrap.define("qx.foo.MyClass",\n'+    // 1
        '{\n'+                                                         // 2
        '  statics:\n'+                                                // 3
        '  {\n'+                                                       // 4
        '    addEnvCallToLoad: function() {\n'+                        // 5
        '      qx.core.Environment.get("engine.name");\n'+             // 6
        '    }\n'+                                                     // 7
        '  },\n'+                                                      // 8
        '  defer: function(statics) {\n'+                              // 9
        '    qx.core.Environment.get("engine.name");\n'+               // 10
        '  }\n'+                                                       // 11
        '});';                                                         // 12

      var esprima = require('esprima');
      var tree = esprima.parse(qxFooMyClass);
      this.pAnnotator.annotate(tree);

      var escope = require('escope');
      var scopes = escope.analyze(tree).scopes;
      var scope1_global = scopes[0];
      var scope2_addEnvCallToLoad = scopes[1];
      var scope3_defer = scopes[2];

      this.ltAnnotator.annotate(scope1_global, true);
      this.ltAnnotator.annotate(scope2_addEnvCallToLoad, true);
      this.ltAnnotator.annotate(scope3_defer, true);

      test.deepEqual(scope1_global.isLoadTime, true);
      test.deepEqual(scope2_addEnvCallToLoad.isLoadTime, false);
      test.deepEqual(scope3_defer.isLoadTime, true);

      test.done();
    }
  }
};
