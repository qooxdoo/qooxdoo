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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The widget displays a busy indicator.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait");
 *   this.getRoot().add(busyIndicator);
 * </pre>
 *
 * This example create a widget to display the busy indicator.
 */
qx.Class.define("qx.ui.mobile.dialog.BusyIndicator",
{
  extend : qx.ui.mobile.basic.Atom,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   */
  construct : function(label)
  {
    // the image passed as second argument is a blank 20x20 transparent png
    this.base(arguments, label, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH2wsJDS8ybObCaQAAABBJREFUKM9jYBgFo2AUkAIAAzQAATnIy0MAAAAASUVORK5CYII=');

    this.addListener("appear", this._onAppear, this);
    this.addListener("disappear", this._onDisappear, this);

    this.__spinnerAnimation = {
      duration: 1000,
      timing: "linear",
      origin: "center center",
      repeat: "infinite",
      keyFrames : {
        0: {
          rotate : "0deg"
        },
        100: {
          rotate : "359deg"
        }
      }
    };
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "spinnerContainer"
    },


    /**
     * The spinner css class to use.
     */
    spinnerClass :
    {
      apply : "_applySpinnerClass",
      nullable : false,
      check : "String",
      init : "spinner"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __spinnerAnimation : null,
    __animationHandle : null,


    /**
     * Listener for appear event.
     */
    _onAppear : function() {
      this.__animationHandle = qx.bom.element.Animation.animate(this.getIconWidget().getContainerElement(), this.__spinnerAnimation);
    },


    /**
     * Handler for disappear event.
     */
    _onDisappear : function() {
      this.__animationHandle.stop();
    },


    // overridden
    _createIconWidget : function(iconUrl)
    {
      var iconWidget = this.base(arguments,iconUrl);
      iconWidget.addCssClass(this.getSpinnerClass());
      return iconWidget;
    },


    // property apply
    _applySpinnerClass : function(value, old)
    {
      if (old) {
        this.getIconWidget().removeCssClass(old);
      }
      if(value) {
        this.getIconWidget().addCssClass(value);
      }
    }
  },


  destruct : function()
  {
    this.removeListener("appear", this._onAppear, this);
    this.removeListener("disappear", this._onDisappear, this);

    if(this.__animationHandle) {
      this.__animationHandle.stop();
    }

    this.__spinnerAnimation = this.__animationHandle = null;
  }
});
