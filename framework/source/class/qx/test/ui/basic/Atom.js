/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016- Oetiker+Partner AG, Switzerland, http://www.oetiker.ch

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fritz Zaucker (fritz.zaucker@oetiker.ch)

************************************************************************ */

qx.Class.define("qx.test.ui.basic.Atom",
{
  extend : qx.test.ui.LayoutTestCase,

  include : [qx.dev.unit.MMock],

  members :
  {
    tearDown : function()
    {
      this.getSandbox().restore();
    },

    testSelectableSetOnCreation : function() {
      var a = new qx.ui.basic.Atom().set({selectable: true});
      var l = a.getChildControl('label');	
      this.assert(l.getContentElement().getAttribute("qxselectable"));
      l.dispose();
    },

    testSelectableUnSetOnCreation : function() {
      var a = new qx.ui.basic.Atom().set({selectable: false});
      var l = a.getChildControl('label');	
      this.assert(! l.getContentElement().getAttribute("qxselectable"));
      l.dispose();
    },

    testSelectableSet : function() {
      var a = new qx.ui.basic.Atom();
      var l = a.getChildControl('label');	
      a.setSelectable(true);
      this.assert(l.getContentElement().getAttribute("qxselectable"));
      l.dispose();
    },

    testSelectableUnset : function() {
      var a = new qx.ui.basic.Atom();
      var l = a.getChildControl('label');	
      l.setSelectable(false);
      this.assert(! l.getContentElement().getAttribute("qxselectable"));
      l.dispose();
    },

  }
});
