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
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * Fading support for widgets
 *
 * This mixin supports fading in and out of widgets. It can be included in any
 * sub class of {@link qx.ui.core.Widget}. To enable this feature for all widgets
 * use:
 *
 * <code><pre>
 *   qx.Class.include(qx.ui.core.Widget, qx.ui.animation.MAnimation);
 * </code></pre>
 */
qx.Mixin.define("qx.ui.animation.MAnimation", {

  events : {
    /** This event is fired after the fading has finished. */
    "FADE_FINISHED"   : "qx.event.type.DataEvent"
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
      apply : "_modifyFadeSteps"
    },


    /** The duration for the fade in milliseconds. */
    fadeTime :
    {
      check : "Integer",
      init : 400,
      apply : "_modifyFadeTime"
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
      apply : "_modifyFadeUnit"
    },


    /** The maximum opacity for a fadeIn. */
    fadeMax :
    {
      check : "Integer",
      init : 100,
      apply : "_modifyFadeMax"
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
     * @type member
     * @param vSteps {var} TODOC
     * @param vTime {var} TODOC
     * @return {void}
     */
    fadeIn : function(vSteps, vTime)
    {
      if (vSteps) this.setFadeSteps(vSteps);
      if (vTime) this.setFadeTime(vTime);
      this._fadeMode = qx.ui.animation.MAnimation.FADE_IN;
      var timer = this.getFadeTimer();
      timer.addEventListener("interval", this._onInterval, this);
      timer.start();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vSteps {var} TODOC
     * @param vTime {var} TODOC
     * @return {void}
     */
    fadeOut : function(vSteps, vTime)
    {
      if (vSteps) this.setFadeSteps(vSteps);
      if (vTime) this.setFadeTime(vTime);
      this._fadeMode = qx.ui.animation.MAnimation.FADE_OUT;
      this.setFadeCounter(this.getFadeSteps());
      var timer = this.getFadeTimer();
      timer.addEventListener("interval", this._onInterval, this);
      timer.start();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFadeTimer : function()
    {
      if (this._fadeTimer) {
        this._fadeTimer.setInterval(this.getFadeInterval());
      } else {
        this._fadeTimer = new qx.client.Timer(this.getFadeInterval());
      }

      return this._fadeTimer;
    },


    /**
     * TODOC
     *
     * @type member
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
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onInterval : function(e)
    {
      this.getFadeTimer().stop();
      var counter = this.getFadeCounter();

      switch(this._fadeMode)
      {
        case qx.ui.animation.MAnimation.FADE_IN:
          this.setFadeCounter(++counter);

          if (counter <= this.getFadeSteps())
          {
            this.setOpacity(this._computeFadeOpacity());
            this.getFadeTimer().restart();
          }
          else if (this.hasEventListeners(qx.ui.animation.MAnimation.FADE_FINISHED))
          {
            this.createDispatchDataEvent(qx.ui.animation.MAnimation.FADE_FINISHED, qx.ui.animation.MAnimation.FADE_IN);
          }

          break;

        case qx.ui.animation.MAnimation.FADE_OUT:
          this.setFadeCounter(--counter);

          if (counter >= 0)
          {
            this.setOpacity(this._computeFadeOpacity());
            this.getFadeTimer().restart();
          }
          else if (this.hasEventListeners(qx.ui.animation.MAnimation.FADE_FINISHED))
          {
            this.createDispatchDataEvent(qx.ui.animation.MAnimation.FADE_FINISHED, qx.ui.animation.MAnimation.FADE_OUT);
          }

          break;
      }

      //qx.ui.core.Widget.flushGlobalQueues();
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void | Boolean} TODOC
     */
    _modifyFadeSteps : function(propValue, propOldValue, propData)
    {
      if (propValue < 1) return;
      this.setFadeInterval(parseInt(this.getFadeTime() / propValue));
      this.setFadeUnit(Math.round(this.getFadeMax() / propValue));
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void | Boolean} TODOC
     */
    _modifyFadeTime : function(propValue, propOldValue, propData)
    {
      if (propValue < 1) return;
      this.setFadeInterval(parseInt(propValue / this.getFadeSteps()));
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFadeUnit : function(propValue, propOldValue, propData)
    {
      this.setFadeSteps(Math.round(this.getFadeMax() / propValue));
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFadeMax : function(propValue, propOldValue, propData)
    {
      this.setFadeUnit(Math.round(propValue / this.getFadeSteps()));
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computeFadeOpacity : function()
    {
      var op = this.getFadeUnit() * this.getFadeCounter() / 100;
      return (op);
    }
  }

});