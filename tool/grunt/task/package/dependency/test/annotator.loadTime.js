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
        '    myStaticMethod: function() {\n'+                          // 5
        '      a.b.foo("abc");\n'+                                     // 6
        '    },\n'+                                                    // 7
        '    myStaticMethod2: function() {\n'+                         // 8
        '      a.b.foo("abc");\n'+                                     // 9
        '    }\n'+                                                     // 10
        '  },\n'+                                                      // 11
        '  defer: function(statics) {\n'+                              // 12
        '    var x = 1;\n'+                                            // 13
        '    a.b.foo("abc");\n'+                                       // 14
        '    statics.myStaticMethod();\n'+                             // 15
        '  }\n'+                                                       // 16
        '});';                                                         // 17

      var esprima = require('esprima');
      var tree = esprima.parse(qxFooMyClass);
      this.pAnnotator.annotate(tree);

      var escope = require('escope');
      var scopes = escope.analyze(tree).scopes;
      var scope1_global = scopes[0];
      var scope2_myStaticMethod = scopes[1];
      var scope3_myStaticMethod2 = scopes[2];
      var scope4_defer = scopes[3];

      this.ltAnnotator.annotate(scope1_global, true);
      this.ltAnnotator.annotate(scope2_myStaticMethod, true);
      this.ltAnnotator.annotate(scope3_myStaticMethod2, true);
      this.ltAnnotator.annotate(scope4_defer, true);

      // should be load time because is global scope
      test.deepEqual(scope1_global.isLoadTime, true);
      // should be load time because of defer which uses this and therefore pulls it 'into' load time
      test.deepEqual(scope2_myStaticMethod.isLoadTime, true);
      // should be run time
      test.deepEqual(scope3_myStaticMethod2.isLoadTime, false);
      // should be load time because is defer scope
      test.deepEqual(scope4_defer.isLoadTime, true);

      test.done();
    }
  }
};
