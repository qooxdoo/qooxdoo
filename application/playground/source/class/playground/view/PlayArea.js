/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Abstraction layer for all play areas which forwards the calls and offers a
 * common interface to the playground application.
 */
qx.Class.define("playground.view.PlayArea",
{
  extend : qx.ui.container.Stack,


  construct : function()
  {
    this.base(arguments);
    this.setDynamic(true);

    this.__riaArea = new playground.view.RiaPlayArea();
    this.__mobileArea = new playground.view.MobilePlayArea();

    this.__riaArea.addListener("toggleMaximize", this._onToggleMaximize, this);
    this.__mobileArea.addListener("toggleMaximize", this._onToggleMaximize, this);

    this.add(this.__riaArea);
    this.add(this.__mobileArea);

    this.setBackgroundColor("white");
  },


  properties : {
    /** The mode the play area is currently in. */
    mode : {
      check : "String",
      apply : "_applyMode"
    }
  },


  events : {
    /** Event to signal the the fields should be maximized / restored. */
    "toggleMaximize" : "qx.event.type.Event"
  },


  members :
  {
    __riaArea : null,
    __mobileArea : null,


    /**
     * Helper to forward the toggle maximize event.
     */
    _onToggleMaximize : function() {
      this.fireEvent("toggleMaximize");
    },


    // property apply
    _applyMode : function(value) {
      this.getSelection()[0].reset();
      if (value == "mobile") {
        this.setSelection([this.__mobileArea]);
        this.__mobileArea.init();
      } else {
        this.setSelection([this.__riaArea]);
        this.__riaArea.init();
      }
    },


    /**
     * Sets the caption of the playareas to the given text.
     * @param text {String} The new text of the caption.
     */
    updateCaption : function(text) {
      this.__riaArea.updateCaption(text);
      this.__mobileArea.updateCaption(text);
    },


    /**
     * Returns the application object of the current selected playarea.
     * @return {qx.ui.container.Composite} The current playarea.
     */
    getApp : function() {
      return this.getSelection()[0].getApp();
    },


    /**
     * Used to reset the current selected playarea.
     * @param beforeReg {Object} A copy of the qx object registry before running
     *   the application.
     * @param afterReg {Object} A copy of the qx object registry after running
     *   the application
     * @param code {String} The code of the application as string.
     */
    reset : function(beforeReg, afterReg, code) {
      this.getSelection()[0].reset(beforeReg, afterReg, code);
    }
  }
});
