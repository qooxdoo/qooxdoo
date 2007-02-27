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

#module(ui_form)

************************************************************************ */

qx.Clazz.define("qx.ui.form.RepeatButton",
{
  extend : qx.ui.form.Button,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash)
  {
    this.base(arguments, vText, vIcon, vIconWidth, vIconHeight, vFlash);

    this._timer = new qx.client.Timer;
    this._timer.setInterval(this.getInterval());
    this._timer.addEventListener("interval", this._oninterval, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "execute" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    interval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 100
    },

    firstInterval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 500
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      if (e.getTarget() != this || !e.isLeftButtonPressed()) {
        return;
      }

      this._executed = false;

      this._timer.setInterval(this.getFirstInterval());
      this._timer.start();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      this.setCapture(false);

      if (!this.hasState("abandoned"))
      {
        this.addState("over");

        if (this.hasState("pressed") && !this._executed) {
          this.execute();
        }
      }

      this._timer.stop();

      this.removeState("abandoned");
      this.removeState("pressed");
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
      this._timer.stop();
      this._timer.setInterval(this.getInterval());
      this._timer.start();

      this._executed = true;
      this.createDispatchEvent("execute");
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

      if (this._timer)
      {
        this._timer.stop();
        this._timer.dispose();
        this._timer = null;
      }

      return this.base(arguments);
    }
  }
});
