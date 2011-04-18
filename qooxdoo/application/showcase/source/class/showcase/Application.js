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
  extend : qx.application.Inline,

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
    __description : null,

    main : function()
    {
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      qx.locale.Manager.getInstance().setLocale("en_US");

      var grid = new qx.ui.layout.Grid();
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(1, 1);
      var row = 0;
      var htmlElement = document.getElementById("showcase");
      var container = new qx.ui.root.Inline(htmlElement, false, false);
      container.set({
        layout: grid,
        width: 900,
        minHeight: 650,
        allowGrowX: false,
        height: null
      });

      var list = new showcase.ui.PreviewList();
      container.add(list, {row: row++, column: 0, colSpan: 2});

      this.__stack = new qx.ui.container.Stack();
      this.__stack.set({
        appearance: "stack",
        maxWidth: 600,
        allowGrowX: false
      });
      container.add(this.__stack, {row: row, column: 0});

      var startPage = new qx.ui.basic.Image("showcase/images/welcome.png").set({
        allowGrowX: true,
        allowGrowY: true,
        allowShrinkX: true,
        padding: [5, 0, 0, 180]
      });
      this.__stack.add(startPage);

      this.__listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var loadImage = new qx.ui.basic.Image("showcase/images/loading66.gif").set({
        marginLeft: -33
      });
      this.__listLoadImage.add(loadImage, {left: "50%", top: 200});
      this.__stack.add(this.__listLoadImage);

      this.__content = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      this.__stack.add(this.__content);

      this.__description = new showcase.ui.Description();
      container.add(this.__description, {row: row++, column: 1});
      this.__description.exclude();

      var pages = new qx.data.Array();
      pages.push(
        new showcase.page.table.Page(),
        new showcase.page.form.Page(),
        new showcase.page.virtuallist.Page(),
        new showcase.page.databinding.Page(),
        new showcase.page.tree.Page(),
        new showcase.page.theme.Page(),
        new showcase.page.i18n.Page(),
        new showcase.page.dragdrop.Page(),
        new showcase.page.htmleditor.Page()
      );

      var listController = new qx.data.controller.List(pages, list, "name");
      listController.setIconPath("icon");
      listController.bind("selection[0]", this, "selectedPage");
      listController.bind("selection[0].description", this.__description, "value");

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

      // history support
      var history = qx.bom.History.getInstance();
      listController.bind("selection[0].part", history, "state");

      var initState = history.getState();
      if (initState) {
        var page;
        for (var i = 0; i < pages.getLength(); i++) {
          if (pages.getItem(i).getPart() === initState) {
            page = pages.getItem(i);
            break;
          }
        };
        if (page) {
          // opera requires a flush to scroll the selection into view!
          qx.ui.core.queue.Manager.flush();
          listController.getSelection().push(page);
        }
      }
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
          page.getContent().getView().hide();
          this.__cancelFade();
        }
      }
    },


    _showPage : function(page)
    {
      this.__description.show();

      page.load(function(page)
      {
        if (this.getSelectedPage() == page) {
          var view = page.getContent().getView();

          this.__content.add(view, {edge: 0});
          view.show();

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
      // no fades for IE, sorry!
      if (qx.core.Environment.get("engine.name") == "mshtml") {
        return;
      }

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
  },

  destruct : function()
  {
    this._disposeObjects("__stack", "__listLoadImage", "__content",
      "__description", "__effect");
  }
});
