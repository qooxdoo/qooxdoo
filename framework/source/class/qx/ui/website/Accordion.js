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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The Accordion is a group of vertically stacked panels (here called pages),
 * each with a header.
 * By default, only one page is visible while the others are collapsed.
 * Clicking a collapsed page's header will expand it while collapsing the
 * previously expanded page. The expand and collapse operations can be
 * visually customized using CSS animations.
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
     * *animationTiming*
     *
     * Controls the page switching animation sequence:
     * "sequential" means the animation to show the new page will
     * only start after the animation to hide the old page is
     * finished. "parallel" means the animations will be started
     * (almost) simultaneously.
     *
     * Default value: <pre>parallel</pre>
     *
     *
     * *animationStyles*
     *
     * Style properties used to animate page switching. Allowed values:
     * "parallel", "sequential"
     *
     * Default value:
     * <pre>["height", "paddingTop", "paddingBottom"]</pre>
     *
     *
     * *hideAnimation*
     *
     * The animation used to hide the previous page when
     * a new one is selected
     *
     * Default value:
     * <pre>{
     *   duration: 500,
     *   delay: 0,
     *   keep: 100,
     *   timing: "linear",
     *   keyFrames: {
     *     0: {
     *       height : "{{height}}",
     *       paddingTop : "{{paddingTop}}",
     *       paddingBottom : "{{paddingBottom}}"
     *     },
     *     100: {
     *       height : "0px",
     *       paddingTop: "0px",
     *       paddingBottom: "0px"
     *     }
     *   }
     * }</pre>
     *
     *
     * *showAnimation*
     *
     * The animation used to show a newly selected page.
     *
     * Default value:
     * <pre>{
     *   duration: 500,
     *   delay: 0,
     *   keep: 100,
     *   timing: "linear",
     *   keyFrames: {
     *     0: {
     *       height : "0px",
     *       paddingTop: "0px",
     *       paddingBottom: "0px"
     *     },
     *     100 : {
     *       height :  "{{height}}",
     *       paddingTop : "{{paddingTop}}",
     *       paddingBottom : "{{paddingBottom}}"
     *     }
     *   }
     * }</pre>
     */
    _config : {
      preselected : null,

      animationTiming : "parallel",

      animationStyles : ["height", "paddingTop", "paddingBottom"],

      hideAnimation : {
        duration: 500,
        delay: 0,
        keep: 100,
        timing: "linear",
        keyFrames: {
          0: {
            height : "{{height}}",
            paddingTop : "{{paddingTop}}",
            paddingBottom : "{{paddingBottom}}"
          },
          100: {
            height : "0px",
            paddingTop: "0px",
            paddingBottom: "0px"
          }
        }
      },

      showAnimation : {
        duration: 500,
        delay: 0,
        keep: 100,
        timing: "linear",
        keyFrames: {
          0: {
            height : "0px",
            paddingTop: "0px",
            paddingBottom: "0px"
          },
          100 : {
            height :  "{{height}}",
            paddingTop : "{{paddingTop}}",
            paddingBottom : "{{paddingBottom}}"
          }
        }
      }
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
      if (!this.base(arguments)) {
        return false;
      }

      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(accordion) {
        accordion.find("> ul > ." + cssPrefix + "-button")._forEachElementWrapped(function(button) {
          var page = accordion._getPage(button);
          accordion._storeInitialStyles(page);
        }.bind(accordion));
        accordion.render();
      });

    },


    render : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(accordion) {
        accordion.find("> ul > ." + cssPrefix + "-button")._forEachElementWrapped(function(button) {
          var page = this._getPage(button);
          if (page.length === 0) {
            return;
          }
          this._storeInitialStyles(page);
          if (button.hasClass(cssPrefix + "-button-active")) {
            page.show();
          } else {
            page.hide();
          }
        }.bind(this));

      }.bind(this));

      return this;
    },


    /**
     * Stores the page's styles for the switching animations
     * @param page {qxWeb} Accordion page
     */
    _storeInitialStyles : function(page) {
      var isHidden = page.getStyle("display") === "none";
      var accordion = page.getAncestors("." + this.getCssPrefix());
      var accHeight;
      if (!accordion[0].style.height) {
        accHeight = accordion.getHeight();
      }
      if (isHidden) {
        if (accHeight) {
          accordion.setStyle("height", accHeight + "px");
        }
        page.show();
      }

      var styles = page.getStyles(this.getConfig("animationStyles"));
      if (styles.height) {
        page[0].style.height = "";
        styles.height = page.getHeight() + "px";
      }

      page.setProperty("initialStyles", styles);
      if (isHidden) {
        if (accHeight) {
          accordion.setStyle("height", "");
        }
      }
    },


    // overridden
    _showPage : function(newButton, oldButton) {
      var oldPage = this._getPage(oldButton);
      var newPage = this._getPage(newButton);

      if (newPage.length > 0) {
        var showAnimation = this.getConfig("showAnimation");
        if (showAnimation) {
          showAnimation = JSON.parse(qxWeb.template.render(
            JSON.stringify(showAnimation),
            newPage.getProperty("initialStyles")
          ));
        }
      }

      if (oldPage.length > 0) {
        var hideAnimation = this.getConfig("hideAnimation");
        if (hideAnimation) {
          hideAnimation = JSON.parse(qxWeb.template.render(
            JSON.stringify(hideAnimation),
            {height: oldPage.getHeight() + "px"}
          ));
        }
      }

      this._switchPages(oldPage, newPage, hideAnimation, showAnimation);
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
    _onClick : function(e) {
      var clickedButton = e.getCurrentTarget();
      var cssPrefix = this.getCssPrefix();
      var sameButton = false;

      this._forEachElementWrapped(function(accordion) {
        var oldButton = accordion.find("> ul > ." + cssPrefix + "-button-active");
        if (oldButton[0] == clickedButton) {
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
