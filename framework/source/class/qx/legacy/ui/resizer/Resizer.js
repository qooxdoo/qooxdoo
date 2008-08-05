/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * David Perez (david-perez)

************************************************************************ */

/**
 * This class acts as a wrapper for other child, and allows it to be resized (not moved), normally in
 * the right and/or bottom directions.  Child can be e.g. a qx.legacy.ui.form.TextArea,
 * qx.legacy.ui.table.Table or qx.legacy.ui.form.List.  It is an alternative to splitters.
 *
 * @appearance resizer
 * @appearance resizer-frame {qx.legacy.ui.basic.Terminator}
 */
qx.Class.define("qx.legacy.ui.resizer.Resizer",
{
  extend    : qx.legacy.ui.layout.CanvasLayout,
  include   : qx.legacy.ui.resizer.MResizable,
  implement : qx.legacy.ui.resizer.IResizable,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(child)
  {
    this.base(arguments);

    this.initMinWidth();
    this.initMinHeight();
    this.initWidth();
    this.initHeight();

    if (child)
    {
      // Remove child border, as the resizer has already its own border.
      child.setBorder(null);
      this.add(this._child = child);
    }
    this.setResizableNorth(false);
    this.setResizableWest(false);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    appearance :
    {
      refine : true,
      init : "resizer"
    },

    minWidth :
    {
      refine : true,
      init : "auto"
    },

    minHeight :
    {
      refine : true,
      init : "auto"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      IResizable interface
    ---------------------------------------------------------------------------
    */

    _changeWidth: function(value)
    {
      var child = this.getChildren()[0];
      child && child.setWidth(value);
    },

    _changeHeight: function(value)
    {
      var child = this.getChildren()[0];
      child && child.setHeight(value);
    },

    /**
     * @return {Widget}
     */
    _getResizeParent: function() {
      return this.getTopLevelWidget();
    },

    /**
     * @return {Widget}
     */
    _getMinSizeReference: function() {
      return this._child;
    }
  }
});
