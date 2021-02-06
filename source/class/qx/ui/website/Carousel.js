/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014-2015 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * A carousel is a widget which can switch between several sub pages {@link qx.ui.website.Widget}.
 * A page switch is triggered by a swipe to left, for next page, or a swipe to right for
 * previous page. Pages can also be switched by dragging.
 *
 * A carousel shows by default a pagination indicator at the bottom of the carousel.
 *
 * @require(qx.module.Transform)
 * @require(qx.module.event.Swipe)
 * @require(qx.module.event.GestureHandler)
 * @require(qx.module.event.Track)
 */
qx.Bootstrap.define("qx.ui.website.Carousel",
{
  extend : qx.ui.website.Widget,

  statics: {

    _config : {
      /**
       * The time in milliseconds for the page switch animation.
       */
      pageSwitchDuration: 500
    },


    /**
     * Factory method which converts the current collection into a collection of
     * Carousel widgets.
     *
     * @return {qx.ui.website.Carousel} A new carousel collection.
     * @attach {qxWeb}
     */
    carousel: function() {
      var carousel =  new qx.ui.website.Carousel(this);
      carousel.init();

      return carousel;
    }

  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  members: {
    __active: null,
    __pageContainer: null,
    __scrollContainer: null,
    __paginationLabels: null,
    __startPosLeft: null,
    __pagination: null,
    _ie9: false,
    __blocked : false,


    // overridden
    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._ie9 = qx.core.Environment.get("browser.documentmode") === 9;

      if (this._ie9) {
        this.setConfig("pageSwitchDuration", 10);
      } else {
        this.addClass("qx-flex-ready");
      }

      qxWeb(window).on("resize", this._onResize, this);

      var prefix = this.getCssPrefix();

      this.__scrollContainer = qxWeb.create("<div>")
        .addClass(prefix + "-container")
        .appendTo(this);

      this.__pageContainer = qxWeb.create("<div>")
        .addClass("qx-hbox")
        .setStyle("height", "100%")
        .appendTo(this.__scrollContainer);

      this.__paginationLabels = [];
      this.__pagination = qxWeb.create("<div>")
        .addClasses([prefix + "-pagination", "qx-hbox", "qx-flex1"])
        .setStyle("visibility", "excluded")
        .appendTo(this);

      if (this._ie9) {
        this.__pageContainer.setStyle("display", "table");
        this.__pagination.setStyle("textAlign", "center");
      } else {
        this.on("trackstart", this._onTrackStart, this)
          .on("track", this._onTrack, this)
          .on("trackend", this._onTrackEnd, this);
      }

      this.on("swipe", this._onSwipe, this);

      this.render();

      return true;
    },

    render: function() {
      var pages = this.find("." + this.getCssPrefix() + "-page");
      pages.forEach(function(page) {
        this.addPage(qxWeb(page));
      }.bind(this));
      if (pages.length > 0) {
        this.setActive(pages.eq(0));
      }

      return this;
    },


    /**
     * Sets one of the Carousel's pages as active, meaning it will be
     * visible.
     *
     * @param page {qxWeb} The page to be activated
     */
    setActive: function(page) {
      var old = this.__active;
      this.__active = page;
      this._update();
      var data = {value: page, old: old, target: this};
      this.emit("changeActive", data);
    },


    /**
     * Returns the currently active (i.e. visible) page
     * @return {qxWeb} The active page
     */
    getActive: function() {
      return this.__active;
    },


    /**
     * Scrolls the carousel to the next page.
     *
     * @return {qx.ui.website.Carousel} Self instance for chaining
     */
    nextPage: function() {
      var pages = this._getPages();
      if (pages.length == 0) {
        return this;
      }

      var next = this.getActive().getNext();
      // prevent overflow if we don't use the endless loop mode
      if (pages.length > 2) {
        if (next.length === 0) {
          next = pages.eq(0);
        }
      }

      if (next.length > 0) {
        this.setActive(next);
      }

      return this;
    },


    /**
     * Scrolls the carousel to the previous page.
     *
     * @return {qx.ui.website.Carousel} Self instance for chaining
     */
    previousPage: function() {
      var pages = this._getPages();
      if (pages.length == 0) {
        return this;
      }

      var prev = this.getActive().getPrev();
      // prevent overflow if we don't use the endless loop mode
      if (pages.length > 2) {
        if (prev.length == 0) {
          prev = pages.eq(pages.length - 1);
        }
      }

      if (prev.length > 0) {
        this.setActive(prev);
      }

      return this;
    },


    /**
     * Adds a page to the Carousel. Updates the pagination,
     * scroll position, active property and the sizing.
     * @param child {qxWeb} The added child.
     */
    addPage: function(child) {
      child.addClasses(["qx-flex1", this.getCssPrefix() + "-page"])
        .appendTo(this.__pageContainer);

      if (this.find("." + this.getCssPrefix() + "-page").length >
        this.__paginationLabels.length)
      {
        var paginationLabel = this._createPaginationLabel();
        this.__paginationLabels.push(paginationLabel);
        this.__pagination.append(paginationLabel);
      }

      this._updateWidth();

      if (!this.getActive()) {
        this.setActive(child);
      } else if (this._getPages().length > 2) {
        this._updateOrder();
      }

      if (this._ie9) {
        child.setStyle("display", "table-cell");
      }

      this.find(".scroll").setStyle("touchAction", "pan-y");

      // scroll as soon as we have the third page added
      if (this._getPages().length === 3 && !this._ie9) {
        this.__scrollContainer.translate([(-this.getWidth()) + "px", 0, 0]);
      }
      this._updatePagination();
    },


    /**
     * Removes a page from the Carousel. Updates the pagination,
     * scroll position, active property and the sizing.
     * @param child {qxWeb} The removed child.
     */
    removePage: function(child) {
      child.remove();

      // reset the active page if we don't have any page at all
      if (this._getPages().length == 0) {
        this.__pagination.empty();
        this.__paginationLabels = [];
        this.setActive(null);
        return;
      }

      this._updateWidth();

      if (this.getActive()[0] == child[0]) {
        this.setActive(this._getPages().eq(0));
      } else if (this._getPages().length > 2) {
        this._updateOrder();
      } else {
        // remove all order properties
        this._setOrder(this._getPages(), 0);
      }

      this.__paginationLabels.splice(child.priorPosition, 1)[0].remove();
      for (var i = 0; i < this.__paginationLabels.length; i++) {
        this.__paginationLabels[i].getChildren(".label").setHtml((i + 1) + "");
      }
      this._updatePagination();
    },


    /**
     * Updates the order, scroll position and pagination.
     */
    _update: function() {
      if (!this.getActive()) {
        return;
      }

      // special case for only one page
      if (this._getPages().length < 2) {
        return;
      } else if (this._getPages().length == 2) {
        if (this._getPages()[0] === this.getActive()[0]) {
          this._translateTo(0);
        } else {
          this._translateTo(this.getWidth());
        }
        this._updatePagination();
        return;
      }

      var left;
      if (!this._ie9) {
        var direction = this._updateOrder();

        if (direction == "right") {
          left = this._getPositionLeft() - this.__scrollContainer.getWidth();
        } else if (direction == "left") {
          left = this._getPositionLeft() + this.__scrollContainer.getWidth();
        } else if (this._getPages().length >= 3) {
          // back snapping if the order has not changed
          this._translateTo(this.getWidth());
          return;
        } else {
          // do nothing if we don't have enough pages
          return;
        }

        if (left !== undefined) {
          // first, translate the old page into view
          this.__scrollContainer.translate([(-left) + "px", 0, 0]);
          // animate to the new page
          this._translateTo(this.getWidth());
        }
      } else {
        var index = this._getPages().indexOf(this.getActive());
        left = index * this.getWidth();
        this._translateTo(left);
      }

      this._updatePagination();
    },


    /**
     * Updates the CSS order property of the flexbox layout.
     * The active page should be the second in order with a order property of '0'.
     * The page left to the active has the order property set to '-1' and is the
     * only one on the left side. All other pages get increasing order numbers and
     * are aligned on the right side.
     *
     * @return {String} The scroll direction, either 'left' or 'right'.
     */
    _updateOrder: function() {
      if (this._ie9) {
        return "left";
      }

      var scrollDirection;

      var pages = this._getPages();
      var orderBefore = this._getOrder(this.getActive());

      if (orderBefore > 0) {
        scrollDirection = "right";
      } else if (orderBefore < 0) {
        scrollDirection = "left";
      }

      var activeIndex = pages.indexOf(this.getActive());

      this._setOrder(this.getActive(), 0);// active page should always have order 0
      var order = 1;

      // order all pages with a higher index than the active page
      for (var i = activeIndex + 1; i < pages.length; i++) {
        // move the last page to the left of the active page
        if (activeIndex === 0 && i == pages.length - 1) {
          order = -1;
        }
        this._setOrder(pages.eq(i), order++);
      }

      // order all pages with a lower index than the active page
      for (i = 0; i < activeIndex; i++) {
        // move the last page to the left of the active page
        if (i == activeIndex - 1) {
          order = -1;
        }
        this._setOrder(pages.eq(i), order++);
      }
      return scrollDirection;
    },


    /**
     * Updates the width of the container and the pages.
     */
    _updateWidth: function() {
      if (!this.isRendered() || this.getProperty("offsetWidth") === 0) {
        this.setStyle("visibility", "hidden");
        if (!this.hasListener("appear", this._updateWidth, this)) {
          this.once("appear", this._updateWidth, this);
        }
        return;
      }

      // set the initial transition on first appear
      if (this._getPositionLeft() === 0 && this._getPages().length > 2 && !this._ie9) {
        this.__scrollContainer.translate([(-this.getWidth()) + "px", 0, 0]);
      }

      // set the container width to total width of all pages
      var containerWidth =
        this.getWidth() *
        this._getPages().length;
      this.__pageContainer.setStyle("width", containerWidth + "px");
      // set the width of all pages to the carousel width
      this._getPages().setStyle("width", this.getWidth() + "px");

      this.setStyle("visibility", "visible");
    },


    /**
     * Handler for trackstart. It saves the initial scroll position and
     * cancels any running animation.
     */
    _onTrackStart: function() {
      if (this.__blocked) {
        return;
      }

      this.__startPosLeft = this._getPositionLeft();
      this.__scrollContainer
        // stop the current scroll animation
        .stop()
        // correct the scroll position as the stopped animation
        // resets to its initial value
        .translate([(-Math.round(this.__startPosLeft)) + "px", 0, 0]);
    },


    /**
     * Track handler which updates the scroll position.
     * @param e {Event} The track event.
     */
    _onTrack: function(e) {
      if (this.__blocked) {
        return;
      }

      if (e.delta.axis == "x" && this._getPages().length > 2) {
        this.__scrollContainer.translate([-(this.__startPosLeft - e.delta.x) + "px", 0, 0]);
      }
    },


    /**
     * TrackEnd handler for enabling the scroll events.
     */
    _onTrackEnd: function() {
      if (this.__startPosLeft == null || this.__blocked) { // don't end if we didn't start
        return;
      }

      // make sure the trackend handling is done after the swipe handling
      window.setTimeout(function() {
        if (this._getPages().length < 3 || this.__scrollContainer.isPlaying()) {
          return;
        }

        this.__startPosLeft = null;

        var width = this.getWidth();
        var pages = this._getPages();

        var oldActive = this.getActive();

        // if more than 50% is visible of the previous page
        if (this._getPositionLeft() < (width - (width / 2))) {
          var prev = this.getActive().getPrev();
          if (prev.length == 0) {
            prev = pages.eq(pages.length - 1);
          }
          this.setActive(prev);
        // if more than 50% is visible of the next page
        } else if (this._getPositionLeft() > (width + width / 2)) {
          var next = this.getActive().getNext();
          if (next.length == 0) {
            next = pages.eq(0);
          }
          this.setActive(next);
        }

        if (this.getActive() == oldActive) {
          this._update();
        }
      }.bind(this), 0);
    },


    /**
     * Swipe handler which triggers page changes based on the
     * velocity and the direction.
     * @param e {Event} The swipe event.
     */
    _onSwipe: function(e) {
      if (this.__blocked) {
        return;
      }
      var velocity = Math.abs(e.getVelocity());
      if (e.getAxis() == "x" && velocity > 0.25) {
        if (e.getDirection() == "left") {
          this.nextPage();
        } else if (e.getDirection() == "right") {
          this.previousPage();
        }
      }
    },


    /**
     * Factory method for a paginationLabel.
     * @return {qxWeb} the created pagination label.
     */
    _createPaginationLabel : function() {
      var paginationIndex = this._getPages().length;

      return qxWeb.create('<div class="' + this.getCssPrefix() + '-pagination-label"></div>')
        .on("tap", this._onPaginationLabelTap, this)
        .append(qxWeb.create('<div class="label">' + paginationIndex + '</div>'));
    },


    /**
     * Handles the tap on pagination labels and changes to the desired page.
     * @param e {Event} The tap event.
     */
    _onPaginationLabelTap: function(e) {
      this.__paginationLabels.forEach(function(label, index) {
        if (label[0] === e.currentTarget) {
          var pages = this._getPages();

          // wo don't reorder with two pages there just set the active property
          if (pages.length === 2) {
            this.setActive(pages.eq(index));
            return;
          }

          var activeIndex = pages.indexOf(this.getActive());
          var distance = index - activeIndex;

          // set the order to deault dom order
          this._setOrder(pages, 0);
          // get the active page into view
          this.__scrollContainer.translate([(-activeIndex * this.getWidth()) + "px", 0, 0]);

          this.__blocked = true;
          // animate to the desired page
          this._translateTo((activeIndex + distance) * this.getWidth());
          this.__scrollContainer.once("animationEnd", function(page) {
            this.__blocked = false;
            // set the viewport back to the default position
            this.__scrollContainer.translate([(-this.getWidth()) + "px", 0, 0]);
            this.setActive(page); // this also updates the order
            this._updatePagination();
          }.bind(this, pages.eq(index)));
        }
      }.bind(this));
    },


    /**
     * Updates the pagination indicator of this carousel.
     * Adds the 'active' CSS class to the currently visible page's
     * pagination button.
     */
    _updatePagination : function() {
      // hide the pagination for one page
      this._getPages().length < 2 ?
        this.__pagination.setStyle("visibility", "excluded") :
        this.__pagination.setStyle("visibility", "visible");

      this.__pagination.find("." + this.getCssPrefix() + "-pagination-label").removeClass("active");
      var pages = this._getPages();
      this.__paginationLabels[pages.indexOf(this.getActive())].addClass("active");
    },


    /**
     * Resize handler. It updates the sizes, snap points and scroll position.
     */
    _onResize : function() {
      this._updateWidth();

      if (this._getPages().length > 2) {
        this.__scrollContainer.translate([(-this.getWidth()) + "px", 0, 0]);
      }
    },


    /**
     * Animates using CSS translations to the given left position.
     * @param left {Number} The new left position
     */
    _translateTo: function(left) {
      this.__scrollContainer.animate({
        duration: this.getConfig("pageSwitchDuration"),
        keep: 100,
        timing: "ease",
        keyFrames: {
          0: {},
          100: {
            translate: [(-left) + "px", 0, 0]
          }
        }
      });
    },


    /**
     * Sets the given order on the given collection.
     * @param col {qxWeb} The collection to set the css property.
     * @param value {Number|String} The value for the order property
     */
    _setOrder: function(col, value) {
      col.setStyles({
        order: value,
        msFlexOrder: value
      });
    },


    /**
     * Returns the order css property of the given collection.
     * @param col {qxWeb} The collection to check.
     * @return {Number} The order as number.
     */
    _getOrder: function(col) {
      var order = parseInt(col.getStyle("order"));
      if (isNaN(order)) {
        order = parseInt(col.getStyle("msFlexOrder"));
      }
      return order;
    },


    /**
     * Returns a collection of all pages.
     * @return {qxWeb} All pages.
     */
    _getPages: function() {
      return this.__pageContainer.find("." + this.getCssPrefix() + "-page");
    },


    /**
     * Returns the current left position.
     * @return {Number} The position in px.
     */
    _getPositionLeft: function() {
      var containerRect = this.__scrollContainer[0].getBoundingClientRect();
      var parentRect = this[0].getBoundingClientRect();
      return -(containerRect.left - parentRect.left);
    },


    // overridden
    dispose : function() {
      qxWeb(window).off("resize", this._onResize, this);

      this.off("trackstart", this._onTrackStart, this)
        .off("track", this._onTrack, this)
        .off("swipe", this._onSwipe, this)
        .off("trackend", this._onTrackEnd, this);

      return this.base(arguments);
    }
  },

  defer: function(statics) {
    qxWeb.$attach({carousel : statics.carousel});
  }
});
