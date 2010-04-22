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
 * Widget responsible for hosting the run code.
 */
qx.Class.define("playground.view.PlayArea",
{
  extend : qx.ui.container.Composite,


  construct : function()
  {
    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this.base(arguments, layout);
    this.setDecorator("main");

    // caption
    this.__playFieldCaption = new qx.ui.basic.Label().set({
      font       : "bold",
      padding    : 5,
      allowGrowX : true,
      allowGrowY : true
    });

    this.add(this.__playFieldCaption);

    this.__playField = new qx.ui.container.Scroll();
    this.__playField.getChildControl("scrollbar-x");
    this.__playField.getChildControl("scrollbar-y");
    this.__playField.getChildControl("corner");

    this.__dummy = new qx.ui.core.Widget();
    this.__playField.add(this.__dummy);

    this.add(this.__playField, {flex : 1});
  },


  members :
  {
    __playFieldCaption : null,
    __dummy : null,
    __playRoot : null,
    __playField : null,
    __playApp : null,


    /**
     * Initializes the playarea.
     * @param app {qx.application.Standalone} Reference to the playground app.
     */
    init : function(app)
    {
      qx.html.Element.flush();

      var playRootEl = this.__dummy.getContainerElement().getDomElement();
      this.__playRoot = new qx.ui.root.Inline(playRootEl);
      this.__playRoot._setLayout(new qx.ui.layout.Canvas());

      var self = this;
      this.__playRoot.getLayoutParent = function() { return self.__playField; };
      this.__playField.getChildren = this.__playField._getChildren =
        function() { return [self.__playRoot]; };

      this.__playField.addListener("resize", function(e) {
        var data = e.getData();
        this.__playRoot.setMinWidth(data.width);
        this.__playRoot.setMinHeight(data.height);
      }, this);

      this.__playApp = app.clone();
      this.__playApp.getRoot = function() {
        return self.__playRoot;
      };

      this.__playRoot.addListener("resize", function(e) {
        var data = e.getData();
        this.__dummy.setMinWidth(data.width);
        this.__dummy.setMinHeight(data.height);
      }, this);
    },


    /**
     * Sets the caoption of the playarea to the given text.
     * @param text {String} The new text of the caption.
     */
    updateCaption : function(text) {
      this.__playFieldCaption.setValue(text);
    },


    /**
     * Disposes the objects added in the playarea.
     * Therefore, it uses a two step process, which could fail ins some
     * scenarios.
     *
     * First step takes all widgets added to the playarea's root and destroys
     * them.
     *
     * The second step uses the given dumps of the qx registry and compares the
     * additionally available classes with the sourcecode. If the classname of
     * the new objects are in the code, the objects will be disposed.
     *
     * @param beforeReg {Object} A copy of the qx object registry before running
     *   the application.
     * @param afterReg {Object} A copy of the qx object registry after running
     *   the application
     * @param code {String} The code of the application as string.
     */
    reset : function(beforeReg, afterReg, code) {
      var ch = this.__playRoot.getChildren();
      var i = ch.length;
      while(i--)
      {
        if (ch[i]) {
          ch[i].destroy();
        }
      }

      var layout = this.__playRoot.getLayout();
      this.__playRoot.setLayout(new qx.ui.layout.Canvas());
      layout.dispose();

      if (!beforeReg) {
        return;
      }

      // flush the dispose queue to get the ui controlls disposed
      qx.ui.core.queue.Dispose.flush();

      // clean up the registry. Only really new objects should be in
      for (var hash in afterReg) {
        if (!beforeReg[hash] && !afterReg[hash].isDisposed()) {
          // check if the object could be created by the code
          if (code.indexOf(afterReg[hash].classname) != -1) {
            // if yes, dispose it
            var item = afterReg[hash];
            item.destruct ? item.destruct() : item.dispose();
          }
        }
      }
    },


    /**
     * Returns the used application.
     * @return {qx.application.Standalone} A clone of the playground app.
     */
    getApp : function()
    {
      return this.__playApp;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects(
      "__playFieldCaption", "__playField", "__dummy", "__playRoot", "__playApp"
    );
  }
});
