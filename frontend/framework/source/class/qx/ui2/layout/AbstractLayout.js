/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.layout.AbstractLayout",
{
  extend : qx.core.Object,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    widget :
    {
      check : "qx.ui2.core.Widget",
      init : null,
      nullable : true,
      apply : "_applyWidget"
    }
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** Add this widget to the layout */
    add : function(widget, layoutHints) {},

    /** Remove this from the layout */
    remove : function(widget) {},

    /** Whether the widget is a child of this layout */
    has : function(widget) {},

    /** Returns the children list */
    getChildren : function() {},

    /** Sets the geometry */
    layout : function(width, height) {},

    /**
     * Computes the layout dimensions and possible ranges of these.
     *
     * @type member
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function() {},

    /** Invalidate all leyout relevant caches */
    invalidate : function() {},


    // property apply
    _applyWidget : function(value, old)
    {
      var children = this.getChildren();

      if (old)
      {
        for (var i=0, l=children.length; i<l; i++) {
          children[i].free();
          children[i].setParent(null);
        }
      }

      if (value)
      {
        for (var i=0, l=children.length; i<l; i++) {
          value._contentElement.add(children[i].getElement());
          children[i].setParent(value);
        }
      }
    }


  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});