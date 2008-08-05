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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Fading support for widgets
 *
 * This mixin supports fading in and out of widgets. It can be included in any
 * sub class of {@link qx.legacy.ui.core.Widget}. To enable this feature for all widgets
 * use:
 *
 * <pre class='javascript'>
 *   qx.Class.include(qx.legacy.ui.core.Widget, qx.legacy.ui.animation.MAnimation);
 * </pre>
 */
qx.Mixin.define("qx.legacy.ui.animation.MAnimation", {

  events : {
    /** This event is fired after the fading has finished. */
    "FADE_FINISHED"   : "qx.event.type.Data"
  },

  statics :
  {
    FADE_IN : 'FADE_IN',
    FADE_OUT : 'FADE_OUT',
    FADE_FINISHED : 'FADE_FINISHED'
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The amount of steps for the fade. */
    fadeSteps :
    {
      check : "Integer",
      init : 10,
      apply : "_applyFadeSteps"
    },


    /** The duration for the fade in milliseconds. */
    fadeTime :
    {
      check : "Integer",
      init : 400,
      apply : "_applyFadeTime"
    },


    /** The time between the fade steps. */
    fadeInterval :
    {
      check : "Integer",
      init : 40
    },


    /** The current state of a fade in progress. */
    fadeCounter :
    {
      check : "Integer",
      init : 0
    },


    /** The amount of oppacity changed on each fade step. */
    fadeUnit :
    {
      check : "Integer",
      init : 10,
      apply : "_applyFadeUnit"
    },


    /** The maximum opacity for a fadeIn. */
    fadeMax :
    {
      check : "Integer",
      init : 100,
      apply : "_applyFadeMax"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @param vSteps {var} TODOC
     * @param vTime {var} TODOC
     * @return {void}
     */
    fadeIn : function(vSteps, vTime)
    {
      if (vSteps) this.setFadeSteps(vSteps);
      if (vTime) this.setFadeTime(vTime);
      this._fadeMode = qx.legacy.ui.animation.MAnimation.FADE_IN;
      this.setFadeCounter(0);
      var timer = this.getFadeTimer();
      timer.addListener("interval", this._onInterval, this);
      timer.start();
    },


    /**
     * TODOC
     *
     * @param vSteps {var} TODOC
     * @param vTime {var} TODOC
     * @return {void}
     */
    fadeOut : function(vSteps, vTime)
    {
      if (vSteps) this.setFadeSteps(vSteps);
      if (vTime) this.setFadeTime(vTime);
      this._fadeMode = qx.legacy.ui.animation.MAnimation.FADE_OUT;
      this.setFadeCounter(this.getFadeSteps());
      var timer = this.getFadeTimer();
      timer.addListener("interval", this._onInterval, this);
      timer.start();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getFadeTimer : function()
    {
      if (this._fadeTimer) {
        this._fadeTimer.setInterval(this.getFadeInterval());
      } else {
        this._fadeTimer = new qx.event.Timer(this.getFadeInterval());
      }

      return this._fadeTimer;
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    resetFader : function()
    {
      this.setFadeCounter(0);

      if (this.getFadeTimer())
      {
        this._fadeTimer.stop();
        this._fadeTimer.dispose();
      }

      this._fadeTimer.dispose();
      this._fadeTimer = null;
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onInterval : function(e)
    {
      this.getFadeTimer().stop();
      var counter = this.getFadeCounter();

      switch(this._fadeMode)
      {
        case qx.legacy.ui.animation.MAnimation.FADE_IN:
          this.setFadeCounter(++counter);

          if (counter <= this.getFadeSteps())
          {
            this.setOpacity(this._computeFadeOpacity());
            this.getFadeTimer().restart();
          }
          else
          {
            this.fireDataEvent(qx.legacy.ui.animation.MAnimation.FADE_FINISHED, qx.legacy.ui.animation.MAnimation.FADE_IN);
          }

          break;

        case qx.legacy.ui.animation.MAnimation.FADE_OUT:
          this.setFadeCounter(--counter);

          if (counter >= 0)
          {
            this.setOpacity(this._computeFadeOpacity());
            this.getFadeTimer().restart();
          }
          else
          {
            this.fireDataEvent(qx.legacy.ui.animation.MAnimation.FADE_FINISHED, qx.legacy.ui.animation.MAnimation.FADE_OUT);
          }

          break;
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void | Boolean} TODOC
     */
    _applyFadeSteps : function(value, old)
    {
      if (value < 1) return;
      this.setFadeInterval(parseInt(this.getFadeTime() / value));
      this.setFadeUnit(Math.round(this.getFadeMax() / value));
      return true;
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void | Boolean} TODOC
     */
    _applyFadeTime : function(value, old)
    {
      if (value < 1) return;
      this.setFadeInterval(parseInt(value / this.getFadeSteps()));
      return true;
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFadeUnit : function(value, old)
    {
      this.setFadeSteps(Math.round(this.getFadeMax() / value));
      return true;
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFadeMax : function(value, old)
    {
      this.setFadeUnit(Math.round(value / this.getFadeSteps()));
      return true;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _computeFadeOpacity : function()
    {
      var op = this.getFadeUnit() * this.getFadeCounter() / 100;
      return (op);
    }
  },


  destruct : function()
  {
    this._disposeObjects("_fadeTimer");
  }

});
