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

exports.dependencies = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  // TODO: don't hardwire paths and resolve dep to needed app
  getClassListLoadOrder : function (test) {
    var depAnalyzer = require('../lib/depAnalyzer.js');
    var classListLoadOrder = [];
    var classListPaths = [];
    var classesDeps = {};
    var atHintIndex = {};

    classesDeps = depAnalyzer.collectDepsRecursive(
      ['./test/data/myapp/source/class/',
       '../../../../../framework/source/class/'],
      ['myapp.Application', 'myapp.theme.Theme']
    );

    /*
    classesDeps = depAnalyzer.collectDepsRecursive(
      ['../../../../../framework/source/class/'],
      ['qx.Class',
       'qx.Mixin',
       'qx.Interface',
       'qx.data.marshal.Json',
       'qx.bom.client.Runtime'],
      {}
    );
    */

    classListLoadOrder = depAnalyzer.sortDepsTopologically(classesDeps, "load");
    classListPaths = depAnalyzer.translateClassIdsToPaths(classListLoadOrder);
    atHintIndex = depAnalyzer.createAtHintsIndex(classesDeps);

    console.log(JSON.stringify(classesDeps, null, 2));
    console.log(classListLoadOrder, classListLoadOrder.length);
    console.log(classListPaths);
    console.log(atHintIndex);

    test.ok(true);
    test.done();
  }
};
