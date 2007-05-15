/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.test.core.Target", {

  extend: qxunit.TestCase,

  members: {
    testEvents: function() {

      qx.Class.define("qxunit.Event", {
        extend: qx.core.Target,
        events: {"click": "qx.event.type.Event"}
      });

      var target = new qxunit.Event();
      target.addEventListener("click", function() {});

      // this will only issue a warning!
      /*
      this.assertException(function() {
        target.addEventListener("blur", function() {});
      }, Error, "JUHU");
      */
    }
  }

});