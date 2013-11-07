/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * @require(qx.module.Template)
 * @require(qx.module.Animation)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Tabs", {
  extend : qx.ui.website.Widget,

  statics : {

    _templates : {
      button : "<li><button>{{{content}}}</button></li>"
    },

    _config : {
      align : "left", // "justify", "right"

      /**
       * Controls the page switching animation sequence:
       * "sequential" means the animation to show the new page will
       * only start after the animation to hide the old page is
       * finished. "parallel" means the animations will be started
       * (almost) simultaneously.
       */
      animationTiming : "sequential",

      /**
       * The animation used to show a newly selected page
       */
      showAnimation : null,

      /**
       * The animation used to hide the previous page when
       * a new one is selected
       */
      hideAnimation : null
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    "changeSelected" : "Number",
    "changePage" : "Map"
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(tabs) {

        var cssPrefix = this.getCssPrefix();

        if (tabs.getChildren("ul").length === 0) {
          var list = qxWeb.create("<ul/>");
          var content = tabs.getChildren();
          if (content.length > 0) {
            list.insertBefore(content.eq(0));
          } else {
            tabs.append(list);
          }
        }

        tabs.find("> ul").removeClasses([cssPrefix + "-justify", cssPrefix + "-right"]);

        var align = tabs.getConfig("align");
        if (align == "justify") {
          tabs.find("> ul").addClass(cssPrefix + "-justify");
        } else if (align == "right") {
          tabs.find("> ul").addClass(cssPrefix + "-right");
        }

        var buttons = tabs.getChildren("ul").getFirst()
          .getChildren("li").not("." + cssPrefix + "-page");
        buttons.addClass(cssPrefix + "-button")._forEachElementWrapped(function(button) {
          tabs._getPage(button).hide();
          button.onWidget("click", this._onClick, tabs);

          var pageSelector = button.getData("qx-tab-page");
          if (pageSelector) {
            qxWeb(pageSelector).addClass(cssPrefix + "-page");
          }
        }.bind(this));

        if (align == "right") {
          buttons.remove();
          for (var i=buttons.length - 1; i>=0; i--) {
            tabs.find("> ul").append(buttons[i]);
          }
        }

        var active = buttons.filter("." + cssPrefix + "-button-active");
        if (active.length === 0) {
          buttons.eq(0).addClass(cssPrefix + "-button-active");
        }
        this._getPage(buttons.filter("." + cssPrefix + "-button-active")).show();

        tabs.getChildren("ul").getFirst().onWidget("keydown", this._onKeyDown, this);
      }.bind(this));

      return true;
    },

    render : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        var content = [];
        var pages= [];
        var selected;
        tabs.find("> ul > ." + cssPrefix + "-button")._forEachElementWrapped(function(li) {
          li.offWidget("click", tabs._onClick, tabs);
          pages.push(li.getData("qx-tab-page"));
          content.push(li.find("> button").getHtml());
          if (li.hasClass(cssPrefix + "-button-active")) {
            selected = content.length - 1;
          }
        });

        tabs.find("> ul").setHtml("");

        var toRight = this.getConfig("align") == "right" && !tabs.find("> ul").hasClass(cssPrefix + "-right");
        var fromRight = this.getConfig("align") != "right" && tabs.find("> ul").hasClass(cssPrefix + "-right");
        if (toRight || fromRight) {
          content.reverse();
          pages.reverse();
          selected = content.length - 1 - selected;
        }

        tabs.find("> ul").removeClasses([cssPrefix + "-justify", cssPrefix + "-right"]);

        content.forEach(function(content, i) {
          tabs.addButton(content, pages[i]);
          var page = tabs._getPage(tabs.find("> ul > ." + cssPrefix + "-button:last-child"));
          if (i == selected) {
            tabs.find("> ul > ." + cssPrefix + "-button:first-child").removeClass(cssPrefix + "-button-active");
            tabs.find("> ul > ." + cssPrefix + "-button:last-child").addClass(cssPrefix + "-button-active");
            page.show();
          } else {
            page.hide();
          }
        });

        var align = tabs.getConfig("align");
        if (align == "justify") {
          tabs.find("> ul").addClass(cssPrefix + "-justify");

        } else if (align == "right") {
          tabs.find("> ul").addClass(cssPrefix + "-right");
        }
      });

      return this;
    },


    /**
     * Adds a new tab button
     *
     * @param label {String} The button's content. Can include markup.
     * @param pageSelector {String} CSS Selector that identifies the associated page
     * @return {qxWeb} The collection for chaining
     */
    addButton : function(label, pageSelector) {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(item) {

        var link = qxWeb.create(
          qxWeb.template.render(
            item.getTemplate("button"),
            {content: label}
          )
        ).addClass(cssPrefix + "-button");
        var list = item.find("> ul");
        var links = list.getChildren("li");
        if (list.hasClass(cssPrefix + "-right") && links.length > 0) {
          link.insertBefore(links.getFirst());
        } else {
          link.appendTo(list);
        }

        link.onWidget("click", this._onClick, item)
        .addClass(cssPrefix + "-button");
        if (item.find("> ul ." + cssPrefix + "-button").length === 1) {
          link.addClass(cssPrefix + "-button-active");
        }

        if (pageSelector) {
          link.setData("qx-tab-page", pageSelector);
          var page = this._getPage(link);
          page.addClass(cssPrefix + "-page");
          if (!link.hasClass(cssPrefix + "-button-active")) {
            page.hide();
          }
        }
      }, this);

      return this;
    },


    /**
     * Selects a tab button
     *
     * @param index {Integer} index of the button to select
     * @return {qxWeb} The collection for chaining
     */
    select : function(index) {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        var buttons = tabs.find("> ul > ." + cssPrefix + "-button");
        var oldButton = tabs.find("> ul > ." + cssPrefix + "-button-active").removeClass(cssPrefix + "-button-active");
        if (this.getConfig("align") == "right") {
          index = buttons.length -1 - index;
        }
        var newButton = buttons.eq(index).addClass(cssPrefix + "-button-active");
        tabs._showPage(newButton, oldButton);
        tabs.emit("changeSelected", index);
      });

      return this;
    },


    /**
     * Initiates the page switch when a button was clicked
     *
     * @param e {Event} Click event
     */
    _onClick : function(e) {
      var clickedButton = e.getCurrentTarget();
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        var oldButton = tabs.find("> ul > ." + cssPrefix + "-button-active");
        if (oldButton[0] == clickedButton) {
          return;
        }
        oldButton.removeClass(cssPrefix + "-button-active");

        var newButton;
        var buttons = tabs.find("> ul > ." + cssPrefix + "-button")
        ._forEachElementWrapped(function(button) {
          if (clickedButton === button[0]) {
            newButton = button;
          }
        });
        tabs._showPage(newButton, oldButton);
        newButton.addClass(cssPrefix + "-button-active");
        var index = buttons.indexOf(newButton[0]);
        if (this.getConfig("align") == "right") {
          index = buttons.length - 1 - index;
        }
        tabs.emit("changeSelected", index);
      });
    },


    /**
     * Allows tab selection using the left and right arrow keys
     *
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var cssPrefix = this.getCssPrefix();
      var key = e.getKeyIdentifier();
      if (!(key == "Left" || key == "Right")) {
        return;
      }
      var rightAligned = this.getConfig("align") == "right";
      var buttons = this.find("> ul > ." + cssPrefix + "-button");
      if (rightAligned) {
        buttons.reverse();
      }
      var active = this.find("> ul > ." + cssPrefix + "-button-active");
      var next;
      if (key == "Right") {
        if (!rightAligned) {
          next = active.getNext("." + cssPrefix + "-button");
        } else {
          next = active.getPrev("." + cssPrefix + "-button");
        }
      } else {
        if (!rightAligned) {
          next = active.getPrev("." + cssPrefix + "-button");
        } else {
          next = active.getNext("." + cssPrefix + "-button");
        }
      }

      if (next.length > 0) {
        var idx = buttons.indexOf(next);
        this.select(idx);
        next.getChildren("button").focus();
      }
    },


    /**
     * Initiates the page switch if a tab button is selected
     *
     * @param newButton {qxWeb} clicked button
     * @param oldButton {qxWeb} previously active button
     */
    _showPage : function(newButton, oldButton) {
      var oldPage = this._getPage(oldButton);
      var newPage = this._getPage(newButton);
      if (oldPage[0] == newPage[0]) {
        return;
      }

      var showAnimation = this.getConfig("showAnimation");
      var hideAnimation = this.getConfig("hideAnimation");
      this._switchPages(oldPage, newPage, hideAnimation, showAnimation);
    },


    /**
     * Executes a page switch
     *
     * @param oldPage {qxWeb} the previously selected page
     * @param newPage {qxWeb} the newly selected page
     * @param hideAnimation {Map} animation description used to hide the old page
     * @param showAnimation {Map} animation description used to show the new page
     */
    _switchPages : function(oldPage, newPage, hideAnimation, showAnimation) {
      var timing = this.getConfig("animationTiming");
      var oldOverflow = oldPage.getStyle("overflow");

      if (hideAnimation) {
        if (oldOverflow == "visible") {
          oldPage.setStyle("overflow", "hidden");
        }
        oldPage.once("animationEnd", function() {
          oldPage.hide();
          if (oldOverflow == "visible") {
            oldPage.setStyle("overflow", oldOverflow);
          }
          if (timing == "sequential") {
            this._showNewPage(newPage, showAnimation);
          }
        }, this);

        if (timing == "parallel") {
          this._showNewPage(newPage, showAnimation);
        }

        oldPage.animate(hideAnimation);
      } else {
        oldPage.hide();
        this._showNewPage(newPage, showAnimation);
      }
    },


    /**
     * Shows a newly selected tab page
     *
     * @param newPage {qxWeb} the newly selected page
     * @param showAnimation {Map} animation description used to show the new pag
     */
    _showNewPage : function(newPage, showAnimation) {
      if (newPage.length == 0) {
        return;
      }

      if (!showAnimation) {
        newPage.show();
        return;
      }

      // apply the first frame of the animation before showing the
      // page to prevent an ugly visible "jump"
      if (showAnimation.keyFrames &&
            showAnimation.keyFrames["0"])
      {
        newPage.setStyles(showAnimation.keyFrames["0"]);
      }

      newPage.show();

      // set overflow to hidden so that the content won't show
      // outside of the page as it grows
      var newOverflow = newPage.getStyle("overflow");
      if (newOverflow == "visible") {
        newPage.setStyle("overflow", "hidden");
      }
      newPage.once("animationEnd", function() {
        if (newOverflow == "visible") {
          newPage.setStyle("overflow", newOverflow);
        }
      })
      .animate(showAnimation);
    },


    /**
     * Returns the tab page associated with the given button
     *
     * @param button {qxWeb} Tab button
     * @return {qxWeb} Tab page
     */
    _getPage : function(button) {
      var pageSelector;
      if (button) {
        pageSelector = button.getData("qx-tab-page");
      }
      return qxWeb(pageSelector);
    },


    dispose : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        tabs.find("." + cssPrefix + "-button").offWidget("click", tabs._onClick, tabs);
        tabs.getChildren("ul").getFirst().offWidget("keydown", tabs._onKeyDown, tabs)
        .setHtml("");
      });

      this.setHtml("").removeClass(cssPrefix);

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      tabs : function(align) {
        var tabs =  new qx.ui.website.Tabs(this);
        tabs.init();
        if (align) {
          tabs.setConfig("align", align);
          tabs.render();
        }

        return tabs;
      }
    });
  }
});
