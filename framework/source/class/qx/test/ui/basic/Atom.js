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
      var a = new qx.ui.basic.Atom('test').set({selectable: true});
      this.getRoot().add(a);
      this.flush();
      var l = a.getChildControl('label');	
      this.assertEquals("on", l.getContentElement().getDomElement().getAttribute("qxselectable"));
      a.destroy();
    },

    testSelectableUnSetOnCreation : function() {
      var a = new qx.ui.basic.Atom('test').set({selectable: false});
      this.getRoot().add(a);
      this.flush();
      var l = a.getChildControl('label');	
      this.assertEquals("off", l.getContentElement().getDomElement().getAttribute("qxselectable"));
      a.destroy();
    },

    testSelectableSet : function() {
      var a = new qx.ui.basic.Atom('test');
      a.setSelectable(true);
      this.getRoot().add(a);
      this.flush();
      var l = a.getChildControl('label');	
      this.assertEquals("on", l.getContentElement().getDomElement().getAttribute("qxselectable"));
      a.destroy();
    },

    testSelectableUnset : function() {
      var a = new qx.ui.basic.Atom('test');
      a.setSelectable(false);
      this.getRoot().add(a);
      this.flush();
      var l = a.getChildControl('label');	
      this.assertEquals("off", l.getContentElement().getDomElement().getAttribute("qxselectable"));
      a.destroy();
    }

  }
});
