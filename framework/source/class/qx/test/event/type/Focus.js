/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */


qx.Class.define("qx.test.event.type.Focus",
{
  extend : qx.test.ui.LayoutTestCase,
  include : [qx.dev.unit.MRequirements],

  members :
  {
    hasBrowserSupport : function() {
      // Opera (pre-Blink) does not support relatedTarget on
      // focus/blur events
      return qx.core.Environment.get("engine.name") !== "opera";
    },

    testRelatedTarget : function() {
      this.require(["browserSupport"]);
      var doc = this.getRoot();
      var text1 = new qx.ui.form.TextField();
      var text2 = new qx.ui.form.TextField();

      doc.add(text1, {left : 10, top  : 10});
      doc.add(text2, {left : 10, top  : 50});

      text1.focus();

      text2.addListener("focus", function(e) {
          this.resume(function() {
            this.assertEquals(text1, e.getRelatedTarget());
          }, this);
        }, this);

      setTimeout(function() {
        text2.focus();
      }, 100);

      this.wait(200);
    }
  }
});
