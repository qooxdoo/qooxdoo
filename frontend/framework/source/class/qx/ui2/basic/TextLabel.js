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

qx.Class.define("qx.ui2.basic.TextLabel",
{
  extend : qx.ui2.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(content)
  {
    this.base(arguments);

    if (content != null) {
      this.setContent(content);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    content :
    {
      check : "String",
      apply : "_applyContent"
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
      var text = qx.bom.Label.getTextSize(this.getContent());
      return {
        width : text.width,
        minWidth : 0,
        maxWidth : Infinity,
        height : text.height,
        minHeight : 0,
        maxHeight : Infinity
      };
    },


    // overridden
    _createContentElement : function()
    {
      var el = new qx.html.Label;

      el.setStyle("position", "relative");
      el.setStyle("zIndex", 10);

      return el;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLIER
    ---------------------------------------------------------------------------
    */

    _applyContent : function(value, old)
    {
      this._contentElement.setContent(value);
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
