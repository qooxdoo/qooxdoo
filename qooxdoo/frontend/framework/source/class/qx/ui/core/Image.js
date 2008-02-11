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

qx.Class.define("qx.ui.core.Image",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(source, width, height)
  {
    this.base(arguments);

    if (source != null) {
      this.setSource(source);
    }

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
    source :
    {
      check : "String",
      apply : "_applySource"
    },

    allowGrowX :
    {
      refine : true,
      init : false
    },

    allowShrinkX :
    {
      refine : true,
      init : false
    },

    allowGrowY :
    {
      refine : true,
      init : false
    },

    allowShrinkY :
    {
      refine : true,
      init : false
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      // TODO: Needs preloader implementation
      return {
        width : 16,
        minWidth : 0,
        maxWidth : Infinity,
        height : 16,
        minHeight : 0,
        maxHeight : Infinity
      };
    },


    // overridden
    _createContentElement : function()
    {
      var el = new qx.html.Image;
      el.setStyle("zIndex", 10);
      return el;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIER
    ---------------------------------------------------------------------------
    */

    _applySource : function(value, old)
    {
      this._contentElement.setSource(value);
      this.scheduleLayoutUpdate();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {


  }
});
