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
    
    
    updateCaption : function(text) {
      this.__playFieldCaption.setValue(text);
    },
    
    
    /**
     * This currently only destroys the children of the application root.
     * While this is ok for many simple scenarios, it cannot account for
     * application code that generates temporary objects without adding them
     * to the application (as widgets for instance). There is no real
     * solution for such a multi-application scenario that is playground
     * specific.
     */
    reset : function() {
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
    },
    
    
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
