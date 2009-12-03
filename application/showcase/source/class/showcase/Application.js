/* ************************************************************************

   Copyright:

   License:

   Authors:

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
    main : function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.getRoot().add(container, {edge: 0});
                  
      var list = new qx.ui.form.List(true).set({
        appearance: "header",
        height: null
      });
      container.add(list);      
           
      var grid = new qx.ui.layout.Grid();
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(0, 1);
      grid.setRowFlex(1, 0);
      var contentContainer = this.__contentContainer = new qx.ui.container.Composite(grid);
      contentContainer.setAppearance("content-container");
      container.add(contentContainer, {flex: 1});
      
      var stack = this.__stack = new qx.ui.container.Stack();
      contentContainer.add(stack, {row: 0, column: 0, rowSpan: 2});
      
      this.__listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
      var loadImage = new qx.ui.basic.Image("showcase/images/loading66.gif");
      loadImage.setAlignY("middle");
      this.__listLoadImage.add(loadImage);
      stack.add(this.__listLoadImage);
            
      this.__content = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      stack.add(this.__content);
      
      this.__descriptionBox = new qx.ui.groupbox.GroupBox("Description").set({
        appearance: "description-box",
        layout: new qx.ui.layout.Canvas()
      });
      contentContainer.add(this.__descriptionBox, {row: 0, column: 1});
      
      this.__description = new qx.ui.basic.Label().set({
        rich: true
      });
      this.__descriptionBox.add(this.__description, {edge: 0});
      
      var pages = new qx.data.Array();
      pages.push(
        new showcase.Page(new showcase.page.theme.Description()),
        new showcase.Page(new showcase.page.table.Description())
      );
      
      var listController = new qx.data.controller.List(pages, list, "description.name");
      listController.setIconPath("description.icon");      
      listController.getSelection().setItem(0, pages.getItem(0));
      listController.bind("selection[0]", this, "selectedPage");
      listController.bind("selection[0].description.description", this.__description, "value");

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
        }
      }
    },
    
    
    _showPage : function(page)
    {
      page.load(function(page)
      {
        if (this.getSelectedPage() == page) {
          this.__content.add(page.getContent().getView(), {edge: 0});
        }
      }, this);
    }
  }
});
