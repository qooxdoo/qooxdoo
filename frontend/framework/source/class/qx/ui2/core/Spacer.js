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
qx.Class.define("qx.ui2.core.Spacer",
{
  extend : qx.ui2.core.LayoutItem,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param width {Integer} the spacer's initial width
  * @param height {Integer} the spacer's initial height
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
      init : 0,
      apply : "_applyLayoutChange",
      nullable : false
    },


    /** The spacer's preferred height */
    height :
    {
      check : "Number",
      init : 50,
      apply : "_applyLayoutChange",
      nullable : false
    },


    /** The spacer's maximum height */
    maxHeight :
    {
      check : "Number",
      init : Infinity,
      apply : "_applyLayoutChange",
      nullable : false
    },


    /** The spacer's minimum width */
    minWidth :
    {
      check : "Number",
      init : 0,
      apply : "_applyLayoutChange",
      nullable : false
    },


    /** The spacer's preferred width */
    width :
    {
      check : "Number",
      init : 100,
      apply : "_applyLayoutChange",
      nullable : false
    },


    /** The spacer's maximum width */
    maxWidth :
    {
      check : "Number",
      init : Infinity,
      apply : "_applyLayoutChange",
      nullable : false
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overrridden
    renderLayout : function(left, top, width, height) {
      // nothing to do
    },

    // overrridden
    hasValidLayout : function() {
      return true;
    },

    // overrridden
    invalidateLayoutCache : function() {
      this._sizeHint = null;
    },


    /**
     * generic property apply method for layout relevant properties
     */
    _applyLayoutChange : function() {
      this.scheduleLayoutUpdate();
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      this._sizeHint = {
        minWidth : this.getMinWidth(),
        width : this.getWidth(),
        maxWidth : this.getMaxWidth(),
        minHeight : this.getMinHeight(),
        height : this.getHeight(),
        maxHeight : this.getMaxHeight()
      };

      return this._sizeHint;
    },


    // overridden
    getCachedSizeHint : function() {
      return this._sizeHint;
    },


    // overridden
    isVisible : function() {
      return true;
    }
  }
});
