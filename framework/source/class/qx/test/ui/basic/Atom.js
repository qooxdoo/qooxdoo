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

<<<<<<< HEAD
  include : [qx.dev.unit.MMock],
=======
  include : [qx.dev.unit.MRequirements, qx.dev.unit.MMock],
>>>>>>> 4db393876743f81ce2fcf21465b8512054d3df0b

  members :
  {
    tearDown : function()
    {
<<<<<<< HEAD
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
=======
      this.base(arguments);
      this.getSandbox().restore();
      qx.bom.webfonts.Manager.getInstance().dispose();
      delete qx.bom.webfonts.Manager.$$instance;
>>>>>>> 4db393876743f81ce2fcf21465b8512054d3df0b
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
<<<<<<< HEAD
    },
=======
    }
>>>>>>> 4db393876743f81ce2fcf21465b8512054d3df0b

  }
});
