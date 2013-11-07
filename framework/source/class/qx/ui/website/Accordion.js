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
 * @require(qx.module.util.Object)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Accordion", {
  extend : qx.ui.website.Tabs,

  statics : {

    _templates : {
      button : "<li><button>{{{content}}}</button></li>"
    },

    _config : {
      /**
       * Controls the page switching animation sequence:
       * "sequential" means the animation to show the new page will
       * only start after the animation to hide the old page is
       * finished. "parallel" means the animations will be started
       * (almost) simultaneously.
       */
      animationTiming : "parallel", // "sequential"


      /**
       * Style properties used to animate page switching.
       */
      animationStyles : ["height", "paddingTop", "paddingBottom"],


      /**
       * The animation used to hide the previous page when
       * a new one is selected
       */
      hideAnimation : {
        duration: 200,
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


      /**
       * The animation used to show a newly selected page
       */
      showAnimation : {
        duration: 200,
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
      this._forEachElementWrapped(function(tabs) {
        tabs.find("> ul > ." + cssPrefix + "-page")._forEachElementWrapped(function(page) {
          tabs._storeInitialStyles(page);
        }.bind(tabs));
      });

    },


    render : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(tabs) {
        tabs.find("> ul > ." + cssPrefix + "-page")._forEachElementWrapped(function(page) {
          var showAnim = tabs.getConfig("showAnimation");
          if (showAnim) {
            showAnim = qxWeb.object.clone(showAnim, true);
            showAnim.duration = 1;
            page.once("animationEnd",  function() {
              this._storeInitialStyles(page);
            }, this)
            .animate(showAnim);
          } else {
            this._storeInitialStyles(page);
          }
        });
      }.bind(this));
    },


    /**
     * Stores the page's styles for the switching animations
     * @param page {qxWeb} Accordion page
     */
    _storeInitialStyles : function(page) {
      var isHidden = page.getStyle("display") === "none";
      var accordion = page.getAncestors(".qx-accordion");
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
      page.setProperty("initialStyles", page.getStyles(this.getConfig("animationStyles")));
      if (isHidden) {
        page.hide();
        if (accHeight) {
          accordion.setStyle("height", "");
        }
      }
    },


    // overridden
    _showPage : function(newButton, oldButton) {
      var oldPage = this._getPage(oldButton);
      var newPage = this._getPage(newButton);
      if (oldPage[0] == newPage[0]) {
        return;
      }

      var showAnimation = this.getConfig("showAnimation");
      if (showAnimation) {
        showAnimation = JSON.parse(qxWeb.template.render(
          JSON.stringify(showAnimation),
          newPage.getProperty("initialStyles")
        ));
      }

      var hideAnimation = this.getConfig("hideAnimation");
      if (hideAnimation) {
        hideAnimation = JSON.parse(qxWeb.template.render(
          JSON.stringify(hideAnimation),
          {height: oldPage.getHeight()}
        ));
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
    }
  },


  defer : function(statics) {
    qxWeb.$attach({
      accordion : function(align) {
        var accordion =  new qx.ui.website.Accordion(this);
        accordion.init();

        return accordion;
      }
    });
  }
});
