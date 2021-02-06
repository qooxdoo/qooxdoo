/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
 *       <td><code>qx-tabs-horizontal</code></td>
 *       <td>Container element</td>
 *       <td>Styles the widget in horizontal orientation</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-vertical</code></td>
 *       <td>Container element</td>
 *       <td>Styles the widget in vertical orientation</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-container</code></td>
 *       <td>Tab page container (<code>div</code>)</td>
 *       <td>Styles the tab pages' container (horizontal orientation only)</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-flex-justify-end</code></td>
 *       <td>Tab container (<code>ul</code>)</td>
 *       <td>Browsers with flexbox support only: Styles the tab buttons when they are right-aligned</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-left</code></td>
 *       <td>Container element</td>
 *       <td>Internet Explorer < 10 only: Styles the tab buttons when they are left-aligned</td>
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
 *       <td>Tab button (<code>li</code>)</td>
 *       <td>Identifies and styles the tabs</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-button-active</code></td>
 *       <td>Tab button (<code>li</code>)</td>
 *       <td>Identifies and styles the currently selected tab. Applied in addition to <code>qx-tabs-button</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-flex-1</code></td>
 *       <td>Tab button (<code>li</code>)</td>
 *       <td>Browsers with flexbox support only: Styles the tab buttons when they are stretched to fill out the available width</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-tabs-page</code></td>
 *       <td>Tab page (<code>div</code> in horizontal mode, <code>li</code>)</td>
 *       <td>Styles the tab pages.</td>
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
  extend: qx.ui.website.Widget,

  statics: {
    /**
     * Factory method which converts the current collection into a collection of
     * tabs widgets.
     *
     * @attach{qxWeb}
     * @param align {String?} Tab button alignment. Default: <code>left</code>
     * @param preselected {Integer?} The (zero-based) index of the tab that
     * should initially be selected. Default: <code>0</code>
     * @param orientation {String?} <code>horizontal</code> (default) or <code>vertical</code>
     * @return {qx.ui.website.Tabs}
     */
    tabs: function(align, preselected, orientation) {
      var tabs = new qx.ui.website.Tabs(this);
      if (typeof preselected !== "undefined") {
        tabs.setConfig("preselected", preselected);
      }

      tabs.init();
      if (align) {
        tabs.setConfig("align", align);
      }

      if (orientation) {
        tabs.setConfig("orientation", orientation);
      }

      if (align || orientation) {
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
    _templates: {
      button: "<li><button>{{{content}}}</button></li>"
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
     *
     * *mediaQuery*
     * A CSS media query string that will be used with a
     * media query listener to dynamically set the widget's
     * orientation. The widget will be rendered in vertical mode unless
     * the query matches.
     */
    _config: {
      preselected: 0,
      align: "left",
      orientation: "horizontal",
      mediaQuery: null
    }
  },


  construct: function(selector, context) {
    this.base(arguments, selector, context);
  },


  events: {
    /**
     * Fired when the selected page has changed. The value is
     * the newly selected page's index
     */
    "changeSelected": "Number"
  },


  members: {

    __mediaQueryListener: null,

    init: function() {
      if (!this.base(arguments)) {
        return false;
      }
      var mediaQuery = this.getConfig("mediaQuery");
      if (mediaQuery) {
        this.setConfig("orientation", this._initMediaQueryListener(mediaQuery));
      }
      var orientation = this.getConfig("orientation");

      this.addClasses([this.getCssPrefix(), this.getCssPrefix() + "-" + orientation, "qx-flex-ready"]);
      if (this.getChildren("ul").length === 0) {
        var list = qxWeb.create("<ul/>");
        var content = this.getChildren();
        if (content.length > 0) {
          list.insertBefore(content.eq(0));
        } else {
          this.append(list);
        }
      }

      var container = this.find("> ." + this.getCssPrefix() + "-container");

      var buttons = this.getChildren("ul").getFirst()
          .getChildren("li").not("." + this.getCssPrefix() + "-page");
      buttons._forEachElementWrapped(function(button) {
        button.addClass(this.getCssPrefix() + "-button");
        var pageSelector = button.getData(this.getCssPrefix() + "-page");
        if (!pageSelector) {
          return;
        }
        button.addClass(this.getCssPrefix() + "-button")
          .on("tap", this._onTap, this);

        var page = this._getPage(button);
        if (page.length > 0) {
          page.addClass(this.getCssPrefix() + "-page");
          if (orientation == "vertical") {
            this.__deactivateTransition(page);
            if (q.getNodeName(page[0]) == "div") {
              var li = q.create("<li>")
                .addClass(this.getCssPrefix() + "-page")
                .setAttribute("id", page.getAttribute("id"))
                .insertAfter(button[0]);
              page.remove()
                .getChildren().appendTo(li);
              page = li;
            }
            this._storePageHeight(page);
          } else if (orientation == "horizontal") {
            if (q.getNodeName(page[0]) == "li") {
              var div = q.create("<div>")
                .addClass(this.getCssPrefix() + "-page")
                .setAttribute("id", page.getAttribute("id"));
              page.remove()
                .getChildren().appendTo(div);
              page = div;
            }
          }

          if (orientation == "horizontal") {
            if (container.length === 0) {
              container = qxWeb.create("<div class='" + this.getCssPrefix() + "-container'>")
                .insertAfter(this.find("> ul")[0]);
            }
            page.appendTo(container[0]);
          }
        }

        this._showPage(null, button);
        this.__activateTransition(page);

      }.bind(this));

      if (orientation == "vertical" && container.length == 1 && container.getChildren().length === 0) {
        container.remove();
      }

      if (orientation == "horizontal" &&
        this.getConfig("align") == "right" &&
        q.env.get("engine.name") == "mshtml" &&
        q.env.get("browser.documentmode") < 10) {
        buttons.remove();
        for (var i = buttons.length - 1; i >= 0; i--) {
          this.find("> ul").append(buttons[i]);
        }
      }

      var active = buttons.filter("." + this.getCssPrefix() + "-button-active");
      var preselected = this.getConfig("preselected");
      if (active.length === 0 && typeof preselected == "number") {
        active = buttons.eq(preselected).addClass(this.getCssPrefix() + "-button-active");
      }

      if (active.length > 0) {
        var activePage = this._getPage(active);
        this.__deactivateTransition(activePage);
        this._showPage(active, null);
        this.__activateTransition(activePage);
      }

      this.getChildren("ul").getFirst().on("keydown", this._onKeyDown, this);

      if (orientation === "horizontal") {
        this._applyAlignment(this);
      }

      qxWeb(window).on("resize", this._onResize, this);

      return true;
    },


    render: function() {
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


    /**
     * Initiates a media query listener for dynamic orientation switching
     * @param mediaQuery {String} CSS media query string
     * @return {String} The appropriate orientation: "horizontal" if the
     * media query matches, "vertical" if it doesn't
     */
    _initMediaQueryListener: function(mediaQuery) {
      var mql = this.__mediaQueryListener;
      if (!mql) {
        mql = q.matchMedia(mediaQuery);
        this.__mediaQueryListener = mql;
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
    _renderHorizontal: function() {
      this.removeClass(this.getCssPrefix() + "-vertical")
        .addClasses([this.getCssPrefix() + "", this.getCssPrefix() + "-horizontal"])
        .find("> ul").addClass("qx-hbox");

      var container = this.find("> ." + this.getCssPrefix() + "-container");
      if (container.length == 0) {
        container = qxWeb.create("<div class='" + this.getCssPrefix() + "-container'>")
          .insertAfter(this.find("> ul")[0]);
      }

      var selectedPage;
      this.find("> ul > ." + this.getCssPrefix() + "-button")._forEachElementWrapped(function(li) {
        var page = this.find(li.getData(this.getCssPrefix() + "-page"));

        if (q.getNodeName(page[0]) == "li") {
          var div = q.create("<div>")
            .addClass(this.getCssPrefix() + "-page")
            .setAttribute("id", page.getAttribute("id"));
          page.remove()
            .getChildren().appendTo(div);
          page = div;
        }

        page.appendTo(container[0]);
        this._switchPages(page, null);

        if (li.hasClass(this.getCssPrefix() + "-button-active")) {
          selectedPage = page;
        }
      }.bind(this));

      if (!selectedPage) {
        var firstButton = this.find("> ul > ." + this.getCssPrefix() + "-button").eq(0)
          .addClass(this.getCssPrefix() + "-button-active");
        selectedPage = this._getPage(firstButton);
      }
      this._switchPages(null, selectedPage);

      this._applyAlignment(this);

      this.setEnabled(this.getEnabled());

      return this;
    },


    /**
     * Render the widget in vertical mode
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    _renderVertical: function() {
      this.find("> ul.qx-hbox").removeClass("qx-hbox");
      this.removeClasses([this.getCssPrefix() + "-horizontal"])
      .addClasses([this.getCssPrefix() + "", this.getCssPrefix() + "-vertical"])
      .getChildren("ul").getFirst()
      .getChildren("li").not("." + this.getCssPrefix() + "-page")
      ._forEachElementWrapped(function(button) {
        button.addClass(this.getCssPrefix() + "-button");
        var page = this._getPage(button);
        if (page.length === 0) {
          return;
        }

        this.__deactivateTransition(page);
        if (q.getNodeName(page[0]) == "div") {
          var li = q.create("<li>")
            .addClass(this.getCssPrefix() + "-page")
            .setAttribute("id", page.getAttribute("id"));
          page.getChildren().appendTo(li);
          li.insertAfter(button[0]);
          page.remove();
          page = li;
        }

        this._storePageHeight(page);
        if (button.hasClass(this.getCssPrefix() + "-button-active")) {
          this._switchPages(null, page);
        } else {
          this._switchPages(page, null);
        }
        this.__activateTransition(page);

      }.bind(this));

      this.setEnabled(this.getEnabled());

      return this;
    },


    /**
     * Re-render on browser window resize (page heights must be re-
     * calculated)
     */
    _onResize: function() {
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
    addButton: function(label, pageSelector) {
      var link = qxWeb.create(
        qxWeb.template.render(
          this.getTemplate("button"), {
            content: label
          }
        )
      ).addClass(this.getCssPrefix() + "-button");
      var list = this.find("> ul");
      var links = list.getChildren("li");
      if (list.hasClass(this.getCssPrefix() + "-right") && links.length > 0) {
        link.insertBefore(links.getFirst());
      } else {
        link.appendTo(list);
      }

      link.on("tap", this._onTap, this)
        .addClass(this.getCssPrefix() + "-button");
      if (this.find("> ul ." + this.getCssPrefix() + "-button").length === 1) {
        link.addClass(this.getCssPrefix() + "-button-active");
      }

      if (pageSelector) {
        link.setData(this.getCssPrefix() + "-page", pageSelector);
        var page = this._getPage(link);
        page.addClass(this.getCssPrefix() + "-page");
        if (link.hasClass(this.getCssPrefix() + "-button-active")) {
          this._switchPages(null, page);
        } else {
          this._switchPages(page, null);
        }
      }

      return this;
    },


    /**
     * Selects a tab button
     *
     * @param index {Integer} index of the button to select
     * @return {qx.ui.website.Tabs} The collection for chaining
     */
    select: function(index) {
      var buttons = this.find("> ul > ." + this.getCssPrefix() + "-button");
      var oldButton = this.find("> ul > ." + this.getCssPrefix() + "-button-active")
        .removeClass(this.getCssPrefix() + "-button-active");
      if (this.getConfig("align") == "right") {
        index = buttons.length - 1 - index;
      }
      var newButton = buttons.eq(index).addClass(this.getCssPrefix() + "-button-active");
      this._showPage(newButton, oldButton);
      this.emit("changeSelected", index);

      return this;
    },


    /**
     * Initiates the page switch when a button was clicked/tapped
     *
     * @param e {Event} Tap event
     */
    _onTap: function(e) {
      if (!this.getEnabled()) {
        return;
      }
      var orientation = this.getConfig("orientation");
      var tappedButton = e.getCurrentTarget();
      var oldButton = this.find("> ul > ." + this.getCssPrefix() + "-button-active");
      if (oldButton[0] == tappedButton && orientation == "horizontal") {
        return;
      }

      oldButton.removeClass(this.getCssPrefix() + "-button-active");
      if (orientation == "vertical") {
        this._showPage(null, oldButton);
        if (oldButton[0] == tappedButton && orientation == "vertical") {
          return;
        }
      }

      var newButton;
      var buttons = this.find("> ul > ." + this.getCssPrefix() + "-button")
      ._forEachElementWrapped(function(button) {
        if (tappedButton === button[0]) {
          newButton = button;
        }
      });
      this._showPage(newButton, oldButton);
      newButton.addClass(this.getCssPrefix() + "-button-active");
      var index = buttons.indexOf(newButton[0]);
      if (this.getConfig("align") == "right") {
        index = buttons.length - 1 - index;
      }
      this.emit("changeSelected", index);
    },


    /**
     * Allows tab selection using the left and right arrow keys
     *
     * @param e {Event} keydown event
     */
    _onKeyDown: function(e) {
      var key = e.getKeyIdentifier();
      if (!(key == "Left" || key == "Right")) {
        return;
      }
      var rightAligned = this.getConfig("align") == "right";
      var buttons = this.find("> ul > ." + this.getCssPrefix() + "-button");
      if (rightAligned) {
        buttons.reverse();
      }
      var active = this.find("> ul > ." + this.getCssPrefix() + "-button-active");
      var next;
      if (key == "Right") {
        if (!rightAligned) {
          next = active.getNext("." + this.getCssPrefix() + "-button");
        } else {
          next = active.getPrev("." + this.getCssPrefix() + "-button");
        }
      } else {
        if (!rightAligned) {
          next = active.getPrev("." + this.getCssPrefix() + "-button");
        } else {
          next = active.getNext("." + this.getCssPrefix() + "-button");
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
    _showPage: function(newButton, oldButton) {
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
    _switchPages: function(oldPage, newPage) {
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
          oldPage[0].offsetHeight;
          oldPage.setStyles({
            "height": "0px",
            "paddingTop": "0px",
            "paddingBottom": "0px"
          });

          oldPage.addClass(this.getCssPrefix() + "-page-closed");
        }

        if (newPage && newPage.length > 0) {
          newPage.removeClass(this.getCssPrefix() + "-page-closed");
          if (!newPage.getStyle("transition") ||
            newPage.getStyle("transition").indexOf("none") === 0) {
            newPage.setStyle("height", "");
          } else {
            var openedHeight = newPage.getProperty("openedHeight");
            if (qxWeb.type.get(openedHeight) == "String") {
              newPage.setStyle("height", openedHeight);
            }
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
    _getPage: function(button) {
      var pageSelector;
      if (button) {
        pageSelector = button.getData(this.getCssPrefix() + "-page");
      }
      return this.find(pageSelector);
    },


    /**
     * Apply the CSS classes for the alignment
     *
     * @param tabs {qx.ui.website.Tabs[]} tabs collection
     */
    _applyAlignment: function(tabs) {
      var align = tabs.getConfig("align");
      var buttons = tabs.find("> ul > li");

      if (q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 10) {
        if (align == "left") {
          tabs.addClass(this.getCssPrefix() + "-left");
        } else {
          tabs.removeClass(this.getCssPrefix() + "-left");
        }

        if (align == "justify") {
          tabs.addClass(this.getCssPrefix() + "-justify");
        } else {
          tabs.removeClass(this.getCssPrefix() + "-justify");
        }

        if (align == "right") {
          tabs.addClass(this.getCssPrefix() + "-right");
        } else {
          tabs.removeClass(this.getCssPrefix() + "-right");
        }
      } else {
        tabs.find("> ul").addClass("qx-hbox");
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
     * @param page {qxWeb} page
     */
    _storePageHeight: function(page) {
      var closedClass = this.getCssPrefix() + "-page-closed";
      var isClosed = page.hasClass(closedClass);
      if (isClosed) {
        page.removeClass(this.getCssPrefix() + "-page-closed");
      }
      var prevDisplay = page[0].style.display;
      var prevHeight = page[0].style.height;
      page[0].style.height = "";
      page[0].style.display = "block";

      page.setProperty("openedHeight", page.getHeight() + "px");

      if (isClosed) {
        page.addClass(this.getCssPrefix() + "-page-closed");
      }
      page[0].style.height = prevHeight;
      page[0].style.display = prevDisplay;
    },


    /**
     * Stores an element's CSS transition styles in a property
     * and removes them from the style declaration
     *
     * @param elem {qxWeb} Element
     */
    __deactivateTransition: function(elem) {
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
    __activateTransition: function(elem) {
      var transition = elem.getProperty("__qxtransition");
      var style = elem.getStyle("transitionProperty");
      if (transition && style.indexOf("none") != -1) {
        elem.setStyles(transition);
        elem.setProperty("__qxtransition", "");
      }
    },


    dispose: function() {
      this.__mediaQueryListener = undefined;
      var cssPrefix = this.getCssPrefix();
      qxWeb(window).off("resize", this._onResize, this);
      this.find("> ul > ." + this.getCssPrefix() + "-button").off("tap", this._onTap, this);
      this.getChildren("ul").getFirst().off("keydown", this._onKeyDown, this)
      .setHtml("");

      this.setHtml("").removeClasses([cssPrefix, "qx-flex-ready"]);

      return this.base(arguments);
    }

  },


  defer: function(statics) {
    qxWeb.$attach({
      tabs: statics.tabs
    });
  }
});

