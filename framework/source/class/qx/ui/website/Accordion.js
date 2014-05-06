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
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * The Accordion is a group of vertically stacked panels (here called pages),
 * each with a header.
 * By default, only one page is visible while the others are collapsed.
 * Clicking or tapping a collapsed page's header will expand it while collapsing the
 * previously expanded page.
 *
 * <h2>Markup</h2>
 * The Accordion contains an unordered list element (<code>ul</code>), which
 * will be created if not already present.
 * Headers and pages are list items (<code>li</code>). Each header must contain
 * a button with an <code>accordionPage</code> data attribute where the value is a
 * CSS selector string identifying the corresponding page. Headers and pages
 * will not be created automatically. They can be predefined in the DOM before
 * the <code>q().accordion()</code> factory method is called, or added programmatically.
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
 *       <td><code>qx-accordion</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Accordion widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-button</code></td>
 *       <td>Page header (<code>li</code>)</td>
 *       <td>Identifies and styles the page headers</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-button-active</code></td>
 *       <td>Page header (<code>li</code>)</td>
 *       <td>Identifies and styles the header of the currently expanded page. Applied in addition to <code>qx-accordion-button</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-accordion-page</code></td>
 *       <td>Page (<code>li</code>)</td>
 *       <td>Identifies and styles the pages</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @require(qx.module.util.Object)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Accordion", {
  extend : qx.ui.website.Tabs,

  statics : {

    /**
     * *button*
     *
     * Template for the list items containing the panel buttons.
     *
     * Default value:
     * <pre><li><button>{{{content}}}</button></li></pre>
     */
    _templates : {
      button : "<li><button>{{{content}}}</button></li>"
    },

    /**
     * *preselected*
     * The index of the page that should be opened after initial
     * rendering, or <code>null</code> if no page should be opened.
     *
     * Default value: <pre>null</pre>
     *
     */
    _config : {
      preselected : null
    },


    /**
     * Factory method which converts the current collection into a collection of
     * accordion widgets.
     *
     * @param preselected {Integer?} The (zero-based) index of the panel that
     * should initially be opened
     * @return {qx.ui.website.Accordion} A new Accordion collection.
     * @attach {qxWeb}
     */
    accordion : function(preselected) {
      var accordion =  new qx.ui.website.Accordion(this);
      if (preselected) {
        accordion.setConfig("preselected", preselected);
      }
      accordion.init();

      return accordion;
    }

  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  members : {

    init : function() {
      this.__toggleTransitions(false);
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(accordion) {
        accordion.render();
      });
      this.__toggleTransitions(true);
    },


    render : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(accordion) {
        accordion.find("> ul > ." + cssPrefix + "-button")
        ._forEachElementWrapped(function(button) {
          var page = this._getPage(button);
          if (page.length === 0) {
            return;
          }

          this.__deactivateTransition(page);
          this._storePageHeight(page);
          if (button.hasClass(cssPrefix + "-button-active")) {
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
     * Stores the page's height in both opened and closed states
     * for the page switch
     * @param page {qxWeb} Accordion page
     */
    _storePageHeight : function(page) {
      var closedClass = this.getCssPrefix() + "-page-closed";
      var openedHeight;
      var closedHeight;

      page[0].style.height = "";

      if (page.hasClass(closedClass)) {
        closedHeight = page.getHeight();
        page.toggleClass(closedClass);
        openedHeight = page.getHeight();
        page.toggleClass(closedClass);
      } else {
        openedHeight = page.getHeight();
        page.toggleClass(closedClass);
        closedHeight = page.getHeight();
        page.toggleClass(closedClass);
      }

      if (openedHeight !== closedHeight) {
        // closed page has changed height: store the initial height to
        // be applied on open. This is necessary because changing the
        // "height" style property back to "auto" from a fixed value
        // does not trigger a CSS transition.
        page.setProperty("openedHeight", openedHeight + "px");
        page.setProperty("closedHeight", closedHeight + "px");
      } else {
        // height doesn't change on close: set a flag so we know the
        // page has been initialized.
        page.setProperty("openedHeight", true);
      }
    },


    // overridden
    _showPage : function(newButton, oldButton) {
      var oldPage = this._getPage(oldButton);
      var newPage = this._getPage(newButton);

      this._switchPages(oldPage, newPage);
    },


    // overridden
    _switchPages : function(oldPage, newPage) {
      var prefix = this.getCssPrefix();
      if (oldPage && oldPage.length > 0) {
        // don't apply before initial rendering, i.e. while we're
        // in the base class' init method.
        if (oldPage.getProperty("openedHeight")) {
          oldPage.addClass(prefix + "-page-closed");
          var closedHeight = oldPage.getProperty("closedHeight");
          if (closedHeight) {
            oldPage.setStyle("height", closedHeight);
          }
        }
      }

      if (newPage && newPage.length > 0) {
        var openedHeight = newPage.getProperty("openedHeight");
        if (openedHeight) {
          newPage.removeClass(prefix + "-page-closed");
          if (qxWeb.type.get(openedHeight) == "String") {
            newPage.setStyle("height", openedHeight);
          }
        }
      }
    },


    /**
     * Activates or deactivates the CSS transition styles on all
     * pages
     *
     * @param on {Boolean?} <code>true</code>: activate transitions
     */
    __toggleTransitions : function(on) {
      this._forEachElementWrapped(function(accordion) {
        accordion.find("> ul > ." + this.getCssPrefix() + "-page")
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


    /**
     * Allows content selection using the up and down arrow keys
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var cssPrefix = this.getCssPrefix();
      var key = e.getKeyIdentifier();
      if (!(key == "Up" || key == "Down")) {
        return;
      }
      var buttons = this.find("> ul > ." + cssPrefix + "-button");
      var active = this.find("> ul > ." + cssPrefix + "-button-active");
      var next;
      if (key == "Down") {
        next = active.getNextAll("." + cssPrefix + "-button").eq(0);
      } else {
        next = active.getPrevAll("." + cssPrefix + "-button").eq(0);
      }

      if (next.length > 0) {
        var idx = buttons.indexOf(next);
        this.select(idx);
        next.getChildren("button").focus();
      }
    },


    // overridden
    _onTap : function(e) {
      var tappedButton = e.getCurrentTarget();
      var cssPrefix = this.getCssPrefix();
      var sameButton = false;

      this._forEachElementWrapped(function(accordion) {
        var oldButton = accordion.find("> ul > ." + cssPrefix + "-button-active");
        if (oldButton[0] == tappedButton) {
          sameButton = true;
          oldButton.removeClass(cssPrefix + "-button-active");
          this._showPage(null, oldButton);
        }
      });

      if (!sameButton) {
        this.base(arguments, e);
      }
    }
  },


  defer : function(statics) {
    qxWeb.$attach({accordion : statics.accordion});
  }
});
