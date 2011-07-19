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
qx.Class.define("playground.view.PlayArea", 
{
  extend : qx.ui.container.Stack,


  construct : function()
  {
    this.base(arguments);
    this.setDynamic(true);
    p = this;

    this.__riaArea = new playground.view.RiaPlayArea();
    this.__mobileArea = new playground.view.MobilePlayArea();

    this.add(this.__riaArea);
    this.add(this.__mobileArea);
  },


  properties : {
    mode : {
      check : "String",
      apply : "_applyMode"
    }
  },

  members :
  {
    __riaArea : null,
    __mobileArea : null,

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


    updateCaption : function(text) {
      this.__riaArea.updateCaption(text);
      this.__mobileArea.updateCaption(text);
    },


    getApp : function() {
      return this.getSelection()[0].getApp();
    },


    reset : function(beforeReg, afterReg, code) {
      this.getSelection()[0].reset(beforeReg, afterReg, code);
    }
  }
});
