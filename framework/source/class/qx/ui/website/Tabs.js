/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * A row of buttons used to switch between connected pages. The buttons can be
 * right- or left-aligned, or they can be justified, i.e. they will be stretched
 * to fill the available width.
 *
 * <h2>Markup</h2>
 * Each Tabs widget contains an unordered list element (<code>ul</code>), which
 * will be created if not already present.
 * The tabs are list items (<code>li</code>). Each tab can contain
 * a button with a <code>tabsPage</code> data attribute where the value is a
 * CSS selector string identifying the corresponding page. Headers and pages
 * will not be created automatically. They can be predefined in the DOM before
 * the <code>q().tabs()</code> factory method is called, or added programmatically.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-tabs</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Tabs widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-flex-justify-end</code></td>
 *       <td>Tab container (<code>ul</code>)</td>
 *       <td>Browsers with flexbox support only: Styles the tab buttons when they are right-aligned</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-justify</code></td>
 *       <td>Container element</td>
 *       <td>Internet Explorer < 10 only: Styles the tab buttons when they are stretched to fill out the available width</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-right</code></td>
 *       <td>Container element</td>
 *       <td>Internet Explorer < 10 only: Styles the tab buttons when they are right-aligned</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-button</code></td>
 *       <td>Tab (<code>li</code>)</td>
 *       <td>Identifies and styles the tabs</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-button-active</code></td>
 *       <td>Tab (<code>li</code>)</td>
 *       <td>Identifies and styles the currently selected tab. Applied in addition to <code>qx-tabs-button</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-flex-1</code></td>
 *       <td>Tab (<code>li</code>)</td>
 *       <td>Browsers with flexbox support only: Styles the tab buttons when they are stretched to fill out the available width</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @require(qx.module.Template)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Tabs", {
  extend : qx.ui.website.Widget,

  statics : {
    /**
     * Factory method which converts the current collection into a collection of
     * tabs widgets.
     *
     * @attach{qxWeb}
     * @param align {String?} Tab button alignment. Default: <code>left</code>
     * @param preselected {Integer?} The (zero-based) index of the tab that
     * should initially be selected. Default: <code>0</code>
     * @return {qx.ui.website.Tabs}
     */
    tabs : function(align, preselected) {
      var tabs =  new qx.ui.website.Tabs(this);
      if (typeof preselected == "number") {
        tabs.setConfig("preselected", preselected);
      }

      tabs.init();
      if (align) {
        tabs.setConfig("align", align);
        tabs.render();
      }

      return tabs;
    },


    /**
     * *button*
     *
     * Template used by {@link #addButton} to create a new button.
     *
     * Default value: <pre><li><button>{{{content}}}</button></li></pre>
     */
    _templates : {
      button : "<li><button>{{{content}}}</button></li>"
    },


    /**
     * *preselected*
     * The index of the page that should be opened after initial
     * rendering, or <code>null</code> if no page should be opened.
     *
     * Default value: <pre>0</pre>
     *
     * *align*
     * Configuration for the alignment of the tab buttons in horizontal
     * mode. This possible values are <code>left</code>,
     * <code>justify</code> and
     * <code>right</code>
     *
     * Default value: <pre>left</pre>
     *
     * *orientation*
     * Controls the layout of the widget. "horizontal" renders it as a
     * tab bar appropriate for wide screens. "vertical" renders it as a
     * stack of collapsible panes (sometimes called an accordion) that
     * is better suited for narrow screens.
     */
    _config : {
      preselected : 0,
      align : "left",
      orientation : "horizontal",
      mediaQuery : null
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    /**
     * Fired when the selected page has changed. The value is
     * the newly selected page's index
     */
    "changeSelected" : "Number"
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }
      var mediaQuery = this.getConfig("mediaQuery");
      if (mediaQuery) {
        this.setConfig("orientation", this._initMediaQueryListener(mediaQuery));
      }
      var orientation = this.getConfig("orientation");

      if (orientation === "vertical") {
        this.__toggleTransitions(false);
      }

      this._forEachElementWrapped(function(tabs) {
        if (tabs.getChildren("ul").length === 0) {
          var list = qxWeb.create("<ul/>");
          var content = tabs.getChildren();
          if (content.length > 0) {
            list.insertBefore(content.eq(0));
          } else {
            tabs.append(list);
          }
        }

        var buttons = tabs.getChildren("ul").getFirst()
          .getChildren("li").not(".qx-tabs-page");
        buttons._forEachElementWrapped(function(button) {
          button.addClass("qx-tabs-button");
          var pageSelector = button.getData("qx-tabs-page");
          if (!pageSelector) {
            return;
          }
          button.addClass("qx-tabs-button")
            .$onFirstCollection("tap", this._onTap, tabs);

          var page = tabs._getPage(button);
          if (page.length > 0) {
            page.addClass("qx-tabs-page");
            if (orientation == "vertical") {
              if (q.getNodeName(page[0]) == "div") {
                var li = q.create("<li>")
                .addClass("qx-tabs-page")
                .setAttribute("id", page.getAttribute("id"))
                .setHtml(page.getHtml())
                .insertAfter(button[0]);
                page.remove();
                page = li;
              }
              this._storePageHeight(page);
            }
          }

          this._showPage(null, button);
        }.bind(this));

        if (orientation == "horizontal" &&
          this.getConfig("align") == "right" &&
          q.env.get("engine.name") == "mshtml" &&
          q.env.get("browser.documentmode") < 10)
        {
          buttons.remove();
          for (var i=buttons.length - 1; i>=0; i--) {
            tabs.find("> ul").append(buttons[i]);
          }
        }

        var active = buttons.filter(".qx-tabs-button-active");
        var preselected = this.getConfig("preselected");
        if (active.length === 0 && typeof preselected == "number") {
          active = buttons.eq(preselected).addClass("qx-tabs-button-active");
        }

        if (active.length > 0) {
          this._showPage(active, null);
        }

        tabs.getChildren("ul").getFirst().$onFirstCollection("keydown", this._onKeyDown, this);

        if (orientation === "horizontal") {
          this._applyAlignment(tabs);
        }

        qxWeb(window).$onFirstCollection("resize", tabs._onResize, tabs);

      }.bind(this));

      if (orientation === "vertical") {
        this.__toggleTransitions(true);
      }

      return true;
    },


    render : function() {
      var mediaQuery = this.getConfig("mediaQuery");
      if (mediaQuery) {
        this.setConfig("orientation", this._initMediaQueryListener(mediaQuery));
      }
      var orientation = this.getConfig("orientation");

      if (orientation === "horizontal") {
        return this._renderHorizontal();
      } else if (orientation === "vertical") {
        return this._renderVertical();
      }
    },


    // overridden
    getCssPrefix : function() {
      var orientation = this.getConfig("orientation");
      if (orientation === "horizontal") {
        return "qx-tabs";
      } else if (orientation === "vertical") {
        return "qx-accordion";
      }
    },


    /**
     * Initiates a media query listener for dynamic orientation switching
     * @param mediaQuery {String} CSS media query string
     * @return {String} The appropriate orientation: "horizontal" if the
     * media query matches, "vertical" if it doesn't
     */
    _initMediaQueryListener : function(mediaQuery) {
      var mql = this.getProperty("mediaQueryListener");
      if (!mql) {
        mql = q.matchMedia(mediaQuery);
        this.setProperty("mediaQueryListener", mql);
        mql.on("change", function(query) {
          this.render();
        }.bind(this));
      }

      if (mql.matches) {
        return "horizontal";
      } else {
        return "vertical";
      }
    },


    /**
     * Render the widget in horizontal mode
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    _renderHorizontal : function() {
      this._forEachElementWrapped(function(tabs) {
        tabs.removeClass("qx-accordion")
        .addClasses(["qx-tabs", "qx-flex-ready"])
        .find("> ul").addClass("qx-hbox");

        var container = tabs.find(".qx-tabs-container");
        if (container.length == 0) {
          container = qxWeb.create("<div class='qx-tabs-container'>")
          .insertAfter(tabs.find("> ul")[0]);
        }

        var selectedPage;
        tabs.find("> ul > .qx-tabs-button")._forEachElementWrapped(function(li) {
          var page = qxWeb(li.getData("qx-tabs-page"));

          if (q.getNodeName(page[0]) == "li") {
            var div = q.create("<div>")
            .addClass("qx-tabs-page")
            .setAttribute("id", page.getAttribute("id"))
            .setHtml(page.getHtml());
            page.remove();
            page = div;
          }

          page.appendTo(container[0]);
          tabs._switchPages(page, null);

          if (li.hasClass("qx-tabs-button-active")) {
            selectedPage = page;
          }
        });

        if (!selectedPage) {
          var firstButton = tabs.find(".qx-tabs-button").eq(0)
            .addClass("qx-tabs-button-active");
          selectedPage = this._getPage(firstButton);
        }
        tabs._switchPages(null, selectedPage);

        /*
        var content = [];
        var pages= [];
        var selected;
        tabs.find("> ul > .qx-tabs-button")._forEachElementWrapped(function(li) {
          li.$offFirstCollection("tap", tabs._onTap, tabs);
          pages.push(li.getData("qx-tabs-page"));
          content.push(li.find("> button").getHtml());
          if (li.hasClass("qx-tabs-button-active")) {
            selected = content.length - 1;
          }
        });

        if (q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 10) {
          tabs.find("> ul").setHtml("");
          var toRight = this.getConfig("align") == "right" && !tabs.find("> ul").hasClass("qx-tabs-right");
          var fromRight = this.getConfig("align") != "right" && tabs.find("> ul").hasClass("qx-tabs-right");
          if (toRight || fromRight) {
            content.reverse();
            pages.reverse();
            selected = content.length - 1 - selected;
          }

          content.forEach(function(content, i) {
            tabs.addButton(content, pages[i]);
            var page = tabs._getPage(tabs.find("> ul > .qx-tabs-button:last-child"));
            if (i == selected) {
              tabs.find("> ul > .qx-tabs-button:first-child").removeClass("qx-tabs-button-active");
              tabs.find("> ul > .qx-tabs-button:last-child").addClass("qx-tabs-button-active");
              tabs._switchPages(null, page);
            } else {
              tabs._switchPages(page, null);
            }
          });
        }
        */

        this._applyAlignment(tabs);
        this.setEnabled(this.getEnabled());
      });

      return this;
    },


    /**
     * Render the widget in vertical mode
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    _renderVertical : function() {
      this._forEachElementWrapped(function(accordion) {
        accordion.find("ul.qx-hbox").removeClass("qx-hbox");
        accordion.removeClasses(["qx-tabs", "qx-flex-ready"])
        .addClass("qx-accordion")
        .getChildren("ul").getFirst()
        .getChildren("li").not(".qx-tabs-page")
        ._forEachElementWrapped(function(button) {
          button.addClass("qx-tabs-button");
          var page = this._getPage(button);
          if (page.length === 0) {
            return;
          }

          this.__deactivateTransition(page);
          if (q.getNodeName(page[0]) == "div") {
            var li = q.create("<li>")
            .addClass("qx-tabs-page")
            .setAttribute("id", page.getAttribute("id"))
            .setHtml(page.getHtml())
            .insertAfter(button[0]);
            page.remove();
            page = li;
          }
          this._storePageHeight(page);
          if (button.hasClass("qx-tabs-button-active")) {
            this._switchPages(null, page);
          } else {
            this._switchPages(page, null);
          }
          this.__activateTransition(page);

        }.bind(this));
      }.bind(this));

      return this;
    },


    /**
     * Re-render on browser window resize (page heights must be re-
     * calculated)
     */
    _onResize : function() {
      // make sure this runs after a MediaQueryListener callback
      // which might have changed the orientation
      setTimeout(function() {
        if (this.getConfig("orientation") == "vertical") {
          this._renderVertical();
        }
      }.bind(this), 100);
    },


    /**
     * Adds a new tab button
     *
     * @param label {String} The button's content. Can include markup.
     * @param pageSelector {String} CSS Selector that identifies the associated page
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    addButton : function(label, pageSelector) {
      this._forEachElementWrapped(function(item) {
        var link = qxWeb.create(
          qxWeb.template.render(
            item.getTemplate("button"),
            {content: label}
          )
        ).addClass("qx-tabs-button");
        var list = item.find("> ul");
        var links = list.getChildren("li");
        if (list.hasClass("qx-tabs-right") && links.length > 0) {
          link.insertBefore(links.getFirst());
        } else {
          link.appendTo(list);
        }

        link.$onFirstCollection("tap", this._onTap, item)
        .addClass("qx-tabs-button");
        if (item.find("> ul .qx-tabs-button").length === 1) {
          link.addClass("qx-tabs-button-active");
        }

        if (pageSelector) {
          link.setData("qx-tabs-page", pageSelector);
          var page = this._getPage(link);
          page.addClass("qx-tabs-page");
          if (link.hasClass("qx-tabs-button-active")) {
            this._switchPages(null, page);
          } else {
            this._switchPages(page, null);
          }
        }
      }, this);

      return this;
    },


    /**
     * Selects a tab button
     *
     * @param index {Integer} index of the button to select
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    select : function(index) {
      this._forEachElementWrapped(function(tabs) {
        var buttons = tabs.find("> ul > .qx-tabs-button");
        var oldButton = tabs.find("> ul > .qx-tabs-button-active").removeClass("qx-tabs-button-active");
        if (this.getConfig("align") == "right") {
          index = buttons.length -1 - index;
        }
        var newButton = buttons.eq(index).addClass("qx-tabs-button-active");
        tabs._showPage(newButton, oldButton);
        tabs.emit("changeSelected", index);
      });

      return this;
    },


    /**
     * Initiates the page switch when a button was clicked/tapped
     *
     * @param e {Event} Tap event
     */
    _onTap : function(e) {
      if (!this.getEnabled()) {
        return;
      }
      var orientation = this.getConfig("orientation");
      var tappedButton = e.getCurrentTarget();
      this._forEachElementWrapped(function(tabs) {
        var oldButton = tabs.find("> ul > .qx-tabs-button-active");
        if (oldButton[0] == tappedButton && orientation == "horizontal") {
          return;
        }

        oldButton.removeClass("qx-tabs-button-active");
        if (orientation == "vertical") {
          this._showPage(null, oldButton);
          if (oldButton[0] == tappedButton && orientation == "vertical") {
            return;
          }
        }

        var newButton;
        var buttons = tabs.find("> ul > .qx-tabs-button")
        ._forEachElementWrapped(function(button) {
          if (tappedButton === button[0]) {
            newButton = button;
          }
        });
        tabs._showPage(newButton, oldButton);
        newButton.addClass("qx-tabs-button-active");
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
      var key = e.getKeyIdentifier();
      if (!(key == "Left" || key == "Right")) {
        return;
      }
      var rightAligned = this.getConfig("align") == "right";
      var buttons = this.find("> ul > .qx-tabs-button");
      if (rightAligned) {
        buttons.reverse();
      }
      var active = this.find("> ul > .qx-tabs-button-active");
      var next;
      if (key == "Right") {
        if (!rightAligned) {
          next = active.getNext(".qx-tabs-button");
        } else {
          next = active.getPrev(".qx-tabs-button");
        }
      } else {
        if (!rightAligned) {
          next = active.getPrev(".qx-tabs-button");
        } else {
          next = active.getNext(".qx-tabs-button");
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
     * @param newButton {qxWeb} selected button
     * @param oldButton {qxWeb} previously active button
     */
    _showPage : function(newButton, oldButton) {
      var oldPage = this._getPage(oldButton);
      var newPage = this._getPage(newButton);
      if (this.getConfig("orientation") === "horizontal" && (oldPage[0] == newPage[0])) {
        return;
      }

      this._switchPages(oldPage, newPage);
    },


    /**
     * Executes a page switch
     *
     * @param oldPage {qxWeb} the previously selected page
     * @param newPage {qxWeb} the newly selected page
     */
    _switchPages : function(oldPage, newPage) {
      var orientation = this.getConfig("orientation");
      if (orientation === "horizontal") {
        if (oldPage) {
          oldPage.hide();
        }

        if (newPage) {
          newPage.show();
        }
      } else if (orientation === "vertical") {
        if (oldPage && oldPage.length > 0) {
          oldPage.setStyle("height", oldPage.getHeight() + "px");
          oldPage.setStyles({
            "height": "0px",
            "paddingTop" : "0px",
            "paddingBottom" : "0px"
          });

          oldPage.addClass("qx-tabs-page-closed");
        }

        if (newPage && newPage.length > 0) {
          var openedHeight = newPage.getProperty("openedHeight");
          newPage.removeClass("qx-tabs-page-closed");
          if (qxWeb.type.get(openedHeight) == "String") {
            newPage.setStyle("height", openedHeight);
          }
        }
      }

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
        pageSelector = button.getData("qx-tabs-page");
      }
      return qxWeb(pageSelector);
    },


    /**
     * Apply the CSS classes for the alignment
     *
     * @param tabs {qx.ui.website.Tabs[]} tabs collection
     */
    _applyAlignment : function(tabs) {
      var align = tabs.getConfig("align");
      var buttons = tabs.find("ul > li");

      if (q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 10) {

        if (align == "justify") {
          tabs.addClass("qx-tabs-justify");
        } else {
          tabs.removeClass("qx-tabs-justify");
        }

        if (align == "right") {
          tabs.addClass("qx-tabs-right");
        } else {
          tabs.removeClass("qx-tabs-right");
        }
      } else {
          buttons
          .getChildren("li").not(".qx-tabs-page")
          .filter(".qx-tabs-button");

        tabs.addClass("qx-flex-ready").find("> ul").addClass("qx-hbox");
        if (align == "justify") {
          buttons.addClass("qx-flex1");
        } else {
          buttons.removeClass("qx-flex1");
        }

        if (align == "right") {
          tabs.find("> ul").addClass("qx-flex-justify-end");
        } else {
          tabs.find("> ul").removeClass("qx-flex-justify-end");
        }
      }
    },

    /**
     * Stores the page's natural height for the page opening transition
     * @param page {qxWeb} Accordion page
     */
    _storePageHeight : function(page) {
      var prevHeight = page[0].style.height;
      page[0].style.height = "";
      page.setProperty("openedHeight", page.getHeight() + "px");
      page[0].style.height = prevHeight;
    },


    /**
     * Activates or deactivates the CSS transition styles on all
     * pages
     *
     * @param on {Boolean?} <code>true</code>: activate transitions
     */
    __toggleTransitions : function(on) {
      this._forEachElementWrapped(function(accordion) {
        accordion.find("> ul > .qx-tabs-page")
        ._forEachElementWrapped(function(page) {
          if (on) {
            this.__activateTransition(page);
          } else {
            this.__deactivateTransition(page);
          }
        }.bind(this));
      }.bind(this));
    },


    /**
     * Stores an element's CSS transition styles in a property
     * and removes them from the style declaration
     *
     * @param elem {qxWeb} Element
     */
    __deactivateTransition : function(elem) {
      var transition = elem.getStyles([
        "transitionDelay",
        "transitionDuration",
        "transitionProperty",
        "transitionTimingFunction"
      ]);
      if (transition.transitionProperty.indexOf("none") == -1) {
        elem.setProperty("__qxtransition", transition);
        elem.setStyle("transition", "none");
      }
    },


    /**
     * Restores an element's transition styles
     *
     * @param elem {qxWeb} Element
     */
    __activateTransition : function(elem) {
      var transition = elem.getProperty("__qxtransition");
      var style = elem.getStyle("transitionProperty");
      if (transition && style.indexOf("none") != -1) {
        elem.setStyles(transition);
        elem.setProperty("__qxtransition", "");
      }
    },


    dispose : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        qxWeb(window).$onFirstCollection("resize", tabs._onResize, tabs);
        tabs.find(".qx-tabs-button").$offFirstCollection("tap", tabs._onTap, tabs);
        tabs.getChildren("ul").getFirst().$offFirstCollection("keydown", tabs._onKeyDown, tabs)
        .setHtml("");
      });

      this.setHtml("").removeClasses([cssPrefix, "qx-flex-ready"]);

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      tabs : statics.tabs
    });
  }
});
