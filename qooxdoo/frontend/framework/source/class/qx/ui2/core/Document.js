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

qx.Class.define("qx.ui2.core.Document",
{
  extend : qx.ui2.core.Root,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(doc)
  {
    this.base(arguments, doc);

    this._window = qx.dom.Node.getWindow(doc);

    this._onResizeWrapper = qx.lang.Function.bind(this._onResize, this);
    qx.event.Registration.addListener(this._window, "resize", this._onResizeWrapper);

    this._onResize();
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
    // overridden
    setGeometry : function(left, top, width, height)
    {
      var innerLeft = left + this.getPaddingLeft() + this._borderWidthLeft;
      var innerTop = left + this.getPaddingLeft() + this._borderWidthTop;
      var innerWidth = width - this.getPaddingRight() - this._borderWidthRight;
      var innerHeight = height - this.getPaddingBottom() - this._borderWidthBottom;

      this._innerElement.setStyle("left", innerLeft + "px");
      this._innerElement.setStyle("top", innerTop + "px");
      this._innerElement.setStyle("width", innerWidth + "px");
      this._innerElement.setStyle("height", innerHeight + "px");
    },

    _onResize : function(e)
    {
      this.setWidth(qx.bom.Document.getWidth(this._window));
      this.setHeight(qx.bom.Document.getHeight(this._window));
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
