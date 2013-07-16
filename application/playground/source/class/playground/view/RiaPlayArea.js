
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
qx.Class.define("playground.view.RiaPlayArea",
{
  extend : qx.ui.container.Composite,


  construct : function()
  {
    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this.base(arguments, layout);
    this.setDecorator("main");

    // caption
    var caption = new qx.ui.container.Composite();
    caption.setLayout(new qx.ui.layout.HBox());

    // caption label
    this.__captionLabel = new qx.ui.basic.Label().set({
      font       : "bold",
      padding    : 5,
      allowGrowX : true,
      allowGrowY : true
    });

    // button for max / min the play area
    var maxIcon = "decoration/window/maximize.gif";
    var restoreIcon = "decoration/window/restore.gif";
    var maxButton = new qx.ui.form.Button(null, maxIcon);
    maxButton.setAppearance("toolbar-button");
    maxButton.setMarginRight(6);
    maxButton.setToolTipText(this.tr("Maximize"));
    maxButton.addListener("execute", function() {
      // toggle the icons
      if (maxButton.getIcon() == maxIcon) {
        maxButton.setIcon(restoreIcon);
        maxButton.setToolTipText(this.tr("Restore"));
      } else {
        maxButton.setIcon(maxIcon);
        maxButton.setToolTipText(this.tr("Maximize"));
      }
      this.fireEvent("toggleMaximize");
    }, this)

    // combine all parts for the caption
    caption.add(this.__captionLabel);
    caption.add(new qx.ui.core.Spacer(), {flex: 1});
    caption.add(maxButton);
    this.add(caption);

    // playfield
    this.__playField = new qx.ui.container.Scroll();
    this.__playField.getChildControl("scrollbar-x");
    this.__playField.getChildControl("scrollbar-y");
    this.__playField.getChildControl("corner");

    this._dummy = new qx.ui.core.Widget();
    this.__playField.add(this._dummy);

    this.add(this.__playField, {flex : 1});
  },


  events : {
    /** Event to signal the the fields should be maximized / restored. */
    "toggleMaximize" : "qx.event.type.Event"
  },


  members :
  {
    __captionLabel : null,
    _dummy : null,
    _playRoot : null,
    __playField : null,
    _playApp : null,
    _initialized : false,


    /**
     * Initializes the playarea.
     */
    init : function()
    {
      if (this._initialized) {
        return;
      }
      qx.html.Element.flush();

      var playRootEl = this._dummy.getContainerElement().getDomElement();
      this._playRoot = new qx.ui.root.Inline(playRootEl);
      this._playRoot._setLayout(new qx.ui.layout.Canvas());

      var self = this;
      this._playRoot.getLayoutParent = function() { return self.__playField; };
      this.__playField.getChildren = this.__playField._getChildren =
        function() { return [self._playRoot]; };

      this.__playField.addListener("resize", function(e) {
        var data = e.getData();
        this._playRoot.setMinWidth(data.width);
        this._playRoot.setMinHeight(data.height);
      }, this);

      this._playApp = new qx.application.Standalone();
      this._playApp.getRoot = function() {
        return self._playRoot;
      };

      this._playRoot.addListener("resize", function(e) {
        var data = e.getData();
        this._dummy.setMinWidth(data.width);
        this._dummy.setMinHeight(data.height);
      }, this);

      this._initialized = true;
    },


    /**
     * Sets the caption of the playarea to the given text.
     * @param text {String} The new text of the caption.
     */
    updateCaption : function(text) {
      this.__captionLabel.setValue(text);
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
      if (!this._initialized) {
        return;
      }

      var ch = this._playRoot.getChildren();
      var i = ch.length;
      while(i--)
      {
        if (ch[i]) {
          ch[i].destroy();
        }
      }

      var layout = this._playRoot.getLayout();
      this._playRoot.setLayout(new qx.ui.layout.Canvas());
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
            // skip singletons
            if (item.constructor.$$instance === item) {
              continue;
            }
            item.destroy ? item.destroy() : item.dispose();
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
      return this._playApp;
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
      "__captionLabel", "__playField", "_dummy", "_playRoot", "_playApp"
    );
  }
});
