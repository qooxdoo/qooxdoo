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

#module(ui_core)

************************************************************************ */

/**
 * @event completed {qx.event.type.Event}
 */
qx.Clazz.define("qx.io.image.PreloaderSystem",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vPreloadList, vCallBack, vCallBackScope)
  {
    qx.core.Target.call(this);

    this._list = vPreloadList;

    // Create timer
    this._timer = new qx.client.Timer(qx.core.Setting.get("qx.preloaderTimeout"));
    this._timer.addEventListener("interval", this._oninterval, this);

    // If we use the compact syntax, automatically add an event listeners and start the loading process
    if (vCallBack)
    {
      this.addEventListener("completed", vCallBack, vCallBackScope || null);
      this.start();
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _stopped : false,




    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    start : function()
    {
      if (qx.lang.Object.isEmpty(this._list))
      {
        this.createDispatchEvent("completed");
        return;
      }

      for (var vSource in this._list)
      {
        var vPreloader = qx.manager.object.ImagePreloaderManager.getInstance().create(qx.manager.object.AliasManager.getInstance().resolvePath(vSource));

        if (vPreloader.isErroneous() || vPreloader.isLoaded()) {
          delete this._list[vSource];
        }
        else
        {
          vPreloader._origSource = vSource;

          vPreloader.addEventListener("load", this._onload, this);
          vPreloader.addEventListener("error", this._onerror, this);
        }
      }

      // Initial check
      this._check();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _onload : function(e)
    {
      delete this._list[e.getTarget()._origSource];
      this._check();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _onerror : function(e)
    {
      delete this._list[e.getTarget()._origSource];
      this._check();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    _oninterval : function(e)
    {
      this.error("Could not preload: " + qx.lang.Object.getKeysAsString(this._list));

      this._stopped = true;
      this._timer.stop();

      this.createDispatchEvent("completed");
    },




    /*
    ---------------------------------------------------------------------------
      CHECK
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    _check : function()
    {
      if (this._stopped) {
        return;
      }

      // this.debug("Check: " + qx.lang.Object.getKeysAsString(this._list));
      if (qx.lang.Object.isEmpty(this._list))
      {
        this._timer.stop();
        this.createDispatchEvent("completed");
      }
      else
      {
        // Restart timer for timeout
        this._timer.restart();
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {boolean | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return true;
      }

      this._list = null;

      if (this._timer)
      {
        this._timer.dispose();
        this._timer = null;
      }

      return qx.core.Target.prototype.dispose.call(this);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    /*
    ---------------------------------------------------------------------------
      DEFAULT SETTINGS
    ---------------------------------------------------------------------------
    */

    "qx.preloaderTimeout" : 3000
  }
});
