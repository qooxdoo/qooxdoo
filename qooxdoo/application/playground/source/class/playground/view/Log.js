/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Log widget responsible for showing the log information.
 */
qx.Class.define("playground.view.Log",
{
  extend : qx.ui.container.Composite,


  construct : function()
  {
    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this.base(arguments, layout);
    this.setDecorator("main");

    // caption of the log pane
    var caption = new qx.ui.basic.Label(this.tr("Log")).set(
    {
      font       : "bold",
      padding    : 5,
      allowGrowX : true,
      allowGrowY : true
    });

    this.add(caption);

    // log pane
    var logArea = new qx.ui.embed.Html('');
    logArea.set(
    {
      backgroundColor : "white",
      overflowY       : "scroll",
      overflowX       : "auto",
      font            : "monospace",
      padding         : 5
    });
    this.add(logArea, {flex : 1});

    // log appender
    this.__logAppender = new qx.log.appender.Element();
    qx.log.Logger.unregister(this.__logAppender);

    // Directly create DOM element to use
    this.__logElem = document.createElement("DIV");
    this.__logAppender.setElement(this.__logElem);

    logArea.addListenerOnce("appear", function() {
      logArea.getContentElement().getDomElement().appendChild(this.__logElem);
    }, this);
  },

  members :
  {
    __logElem : null,
    __logAppender : null,


    /**
     * Clears the log.
     */
    clear : function() {
      if (this.__logElem) {
        this.__logElem.innerHTML = "";
      }
    },


    /**
     * Fetches all logged data from the qx logging system and puts in into the
     * log widget.
     */
    fetch : function()
    {
      // Register to flush the log queue into the appender.
      qx.log.Logger.register(this.__logAppender);

      // Clear buffer
      qx.log.Logger.clear();

      // Unregister again, so that the logger can flush again the next time the tab is clicked.
      qx.log.Logger.unregister(this.__logAppender);
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__logAppender");
    this.__logElem = null;
  }
});
