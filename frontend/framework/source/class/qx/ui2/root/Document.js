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

qx.Class.define("qx.ui2.top.Page",
{
  extend : qx.ui2.top.Root,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(doc)
  {
    this.base(arguments, doc.body);

    this._window = qx.dom.Node.getWindow(doc);

    qx.event.Registration.addListener(this._window, "resize", this._onResize, this);

    // Don't use overflow: hidden
    this._innerElement.removeStyle("overflow");
    this._innerElement.setStyle("top", "0px");
    this._innerElement.setStyle("left", "0px");

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

    /**
     * Listener for window's resize event
     *
     * @type member
     * @param e {qx.type.Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {

      var width = qx.bom.Document.getWidth(this._window);
      var height = qx.bom.Document.getHeight(this._window);

      this.setGeometry(0, 0, width, height);

      // Sync to layouter
      //this.addHint("width", width);
      //this.addHint("height", height);

      // Debug
      qx.core.Log.debug("Resize document: " + width + "x" + height);
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
