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

************************************************************************ */

/**
 * This singleton manages multiple instances of qx.legacy.ui.embed.Iframe.
 * <p>
 * The problem: When dragging over an iframe then all mouse events will be
 * passed to the document of the iframe, not the main document.
 * <p>
 * The solution: In order to be able to track mouse events over iframes, this
 * manager will block all iframes during a drag with a glasspane.
 */
qx.Class.define("qx.legacy.ui.embed.IframeManager",
{
  type : "singleton",
  extend : qx.legacy.util.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);

    this._blocked = {};
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
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param evt {Event} TODOC
     * @return {void}
     */
    handleMouseDown : function(evt)
    {
      var iframeMap = this._blockData = qx.lang.Object.copy(this.getAll());
      // console.debug("Blocking frames: " + qx.lang.Object.getLength(iframeMap));

      for (var key in iframeMap) {
        iframeMap[key].block();
      }
    },


    /**
     * TODOC
     *
     * @param evt {Event} TODOC
     * @return {void}
     */
    handleMouseUp : function(evt)
    {
      var iframeMap = this._blockData;
      // console.debug("Releasing frames: " + qx.lang.Object.getLength(iframeMap));

      for (var key in iframeMap) {
        iframeMap[key].release();
      }
    }
  }
});
