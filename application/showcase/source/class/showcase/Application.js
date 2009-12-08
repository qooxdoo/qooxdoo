/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(showcase/*)

************************************************************************ */

qx.Class.define("showcase.Application",
{
  extend : qx.application.Standalone,

  properties :
  {
    selectedPage : 
    {
      check: "showcase.Page",
      apply: "_applySelectedPage",
      nullable: true
    },
    
    
    showLoadIndicator :
    {
      check: "Boolean",
      init: false,
      apply: "_applyShowLoadIndicator"
    }
  },

  members :
  {
    __stack : null,
    __contentContainer : null,
    __listLoadImage : null,
    __content : null,
    __effect : null,
    
    
    main : function()
    {
      this.base(arguments);

      var cssUrl = qx.util.AliasManager.getInstance().resolve(
        "showcase/css/showcase.css"
      );
      qx.bom.Stylesheet.includeFile(cssUrl);

      var grid = new qx.ui.layout.Grid();
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);
      var row = 0;
      var container = new qx.ui.container.Composite(grid);
      this.getRoot().add(container, {edge: 0});
                  
      var list = new showcase.ui.PreviewList();
      container.add(list, {row: row++, column: 0, colSpan: 2});               
                 
      this.__stack = new qx.ui.container.Stack();
      this.__stack.setAppearance("stack");
      container.add(this.__stack, {row: row, column: 0});
      
      this.__listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
      var loadImage = new qx.ui.basic.Image("showcase/images/loading66.gif");
      loadImage.setAlignY("middle");
      this.__listLoadImage.add(loadImage);
      this.__stack.add(this.__listLoadImage);
        
      this.__content = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      this.__stack.add(this.__content);
      
      var descriptionBox = new qx.ui.container.Scroll().set({
        appearance: "description-box",
        layout: new qx.ui.layout.Canvas()
      });
      container.add(descriptionBox, {row: row++, column: 1});
      
      var description = new qx.ui.basic.Label().set({
        rich: true,
        selectable: true
      });
      descriptionBox.add(description, {edge: 0});
      
      var pages = new qx.data.Array();
      pages.push(
        new showcase.page.dragdrop.Page(),
        new showcase.page.theme.Page(),
        new showcase.page.form.Page(),
        new showcase.page.table.Page(),
        new showcase.page.databinding.Page(),
        new showcase.page.animation.Page()
      );
      
      var listController = new qx.data.controller.List(pages, list, "name");
      listController.setIconPath("icon");      
      listController.getSelection().setItem(0, pages.getItem(0));
      listController.bind("selection[0]", this, "selectedPage");
      listController.bind("selection[0].description", description, "value");

      listController.bind("selection[0].readyState", this, "showLoadIndicator", {
        converter: function(value) {
          return value !== "complete";
        }
      });      
      
      listController.setDelegate({
        configureItem: function(item) {
          item.set({
            appearance: "page-preview"
          });
        }
      });
    },
    
    
    _applyShowLoadIndicator : function(value)
    {
      if (value) {
        this.__stack.setSelection([this.__listLoadImage]);
      } else {
        this.__stack.setSelection([this.__content]);
      }
    },
    
    
    _applySelectedPage : function(value, old)
    {
      if (old) {
        this._hidePage(old);
      }
      
      this._showPage(value);
    },
    
    
    _hidePage : function(page)
    {
      if (this.getSelectedPage() !== page) {
        if (page.getReadyState() == "complete") {
          this.__content.remove(page.getContent().getView());
          this.__cancelFade();
        }
      }
    },
    
    
    _showPage : function(page)
    {
      page.load(function(page)
      {
        if (this.getSelectedPage() == page) {
          var view = page.getContent().getView();
          this.__content.add(view, {edge: 0});
           
          this.__fadeIn(view);
        }
      }, this);
    },
    
    
    __cancelFade : function() 
    {
      if (this.__effect) {
        this.__effect.cancel();
        this.__effect.dispose();
        this.__effect = null;
      }
    },
    
    
    __fadeIn : function(view) 
    {
      
      view.getContentElement().setStyle("display", "none", true);
      this.__cancelFade();
      
      qx.event.Timer.once(function() {
        var element = view.getContentElement().getDomElement();
        this.__effect = new qx.fx.effect.core.Fade(element);
        this.__effect.set({
          from: 0,
          to: 1
        });
        this.__effect.addListenerOnce("update", function() {
          view.getContentElement().setStyle("display", "block");
        }, this);

        this.__effect.start();
      }, this, 0);
    }
  }
});
