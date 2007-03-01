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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#embed(qx.static/history/historyHelper.html)

************************************************************************ */

/**
 * A helper for using the browser history in JavaScript Applications without
 * reloading the main page.
 * <p>
 * Adds entries to the browser history and fires a "request" event when one of
 * the entries was requested by the user (e.g. by clicking on the back button).
 * </p>
 */
qx.Class.define("qx.client.History",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__pageFlag = true;
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired when the user moved in the history. The data property of the event
     * holds the command, which was passed to {@link #addToHistory}.
     */
    "request" : "qx.event.type.DataEvent"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initializes the History. This method has to called by applications using this
     * class once during initialization. Subsequent calls have no (negative) effect.
     *
     * @type member
     * @return {void}
     */
    init : function()
    {
      if (this.__iframe == null)
      {
        this.__iframe = document.createElement("iframe");
        this.__iframe.style.visibility = "hidden";

        document.body.appendChild(this.__iframe);
      }
    },


    /**
     * Adds an entry to the browser history.
     *
     * @type member
     * @param command {String} a string representing the old state of the
     *          application. This command will be delivered in the data property of
     *          the "request" event.
     * @param newTitle {String ? null} the page title to set after the history entry
     *          is done. This title should represent the new state of the application.
     * @return {void}
     * @throws TODOC
     */
    addToHistory : function(command, newTitle)
    {
      if (command == this.__currentCommand) {
        document.title = newTitle;
      }
      else
      {
        if (this.__iframe == null) {
          throw new Error("You have to call init first!");
        }

        this.__pageFlag = !this.__pageFlag;
        this.__currentCommand = command;
        this.__newTitle = newTitle;

        // NOTE: We need the command attribute to enforce a loading of the page
        //       (Otherwise we don't get an onload event).
        //       The browser will still cache commands loaded once.
        //       Without the onload-problem anchors would work, too.
        //       (Anchors would have the advantage that the helper is only loaded once)
        var src = qx.manager.object.AliasManager.getInstance().resolvePath("static/history/historyHelper.html");

        try {
          this.__iframe.src = src + "?c=" + command;
        } catch(ex) {
          this.error("Could not load file: " + src);
        }
      }
    },


    /**
     * Event handler. Called when the history helper page was loaded.
     *
     * @type member
     * @param location {Map} the location property of the window object of the
     *          helper page.
     * @return {void}
     */
    _onHistoryLoad : function(location)
    {
      try
      {
        var equalsPos = location.search.indexOf("=");
        var command = location.search.substring(equalsPos + 1);

        if (this.__newTitle)
        {
          document.title = this.__newTitle;
          this.__newTitle = null;
        }

        if (command != this.__currentCommand)
        {
          this.__currentCommand = command;

          this.createDispatchDataEvent("request", command);
        }
      }
      catch(exc)
      {
        this.error("Handling history load failed", exc);
      }

      qx.ui.core.Widget.flushGlobalQueues();
    }
  }
});
