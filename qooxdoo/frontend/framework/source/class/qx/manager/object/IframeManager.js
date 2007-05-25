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
     * Til Schneider (til132)

************************************************************************ */

/**
 * This singleton manages multiple instances of qx.ui.embed.Iframe.
 * <p>
 * The problem: When dragging over an iframe then all mouse events will be
 * passed to the document of the iframe, not the main document.
 * <p>
 * The solution: In order to be able to track mouse events over iframes, this
 * manager will block all iframes during a drag with a glasspane.
 */
qx.Class.define("qx.ui.embed.IframeManager",
{
  type : "singleton",
  extend : qx.util.manager.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
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
     * @type member
     * @param evt {Event} TODOC
     * @return {void}
     */
    handleMouseDown : function(evt)
    {
      var iframeMap = this.getAll();

      for (var key in iframeMap)
      {
        var iframe = iframeMap[key];
        iframe.block();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {void}
     */
    handleMouseUp : function(evt)
    {
      var iframeMap = this.getAll();

      for (var key in iframeMap)
      {
        var iframe = iframeMap[key];
        iframe.release();
      }
    }
  }
});
