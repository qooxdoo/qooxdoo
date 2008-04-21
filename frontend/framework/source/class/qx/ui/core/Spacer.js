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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Spacer is a "virtual" widget, which can be placed into any layout and takes
 * the space a normal widget of the same size would take.
 *
 * Spacers are invisible and very light weight because they don't require any
 * DOM modifications.
 */
qx.Class.define("qx.ui.core.Spacer",
{
  extend : qx.ui.core.LayoutItem,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param width {Integer?null} the initial width
  * @param height {Integer?null} the initial height
  */
  construct : function(width, height)
  {
    this.base(arguments);

    if (width != null) {
      this.setWidth(width);
    }

    if (height != null) {
      this.setHeight(height);
    }
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The spacer's minimum height */
    minHeight :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    },


    /** The spacer's preferred height */
    height :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    },


    /** The spacer's maximum height */
    maxHeight :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    },


    /** The spacer's minimum width */
    minWidth :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    },


    /** The spacer's preferred width */
    width :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    },


    /** The spacer's maximum width */
    maxWidth :
    {
      check : "Number",
      apply : "_applyLayoutChange",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _computeSizeHint : function()
    {
      var width = this.getWidth() || 0;
      var height = this.getHeight() || 0;

      var minWidth = this.getMinWidth() || 0;
      var minHeight = this.getMinHeight() || 0;

      var maxWidth = this.getMaxWidth() || Infinity;
      var maxHeight = this.getMaxHeight() || Infinity;

      width = Math.min(Math.max(minWidth, width), maxWidth);
      height = Math.min(Math.max(minHeight, height), maxHeight);

      return {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };
    }
  }
});
