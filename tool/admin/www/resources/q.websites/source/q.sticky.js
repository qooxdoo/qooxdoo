(function() {

var Sticky = q.define({
  construct: function($elem, paddingTop, paddingBottom) {
    if ($elem == null)
      throw new Error("Missing element");

    this.$elem = $elem; // $ by convention signals collection
    this.paddingTop = paddingTop || 0;
    this.paddingBottom = paddingBottom || 0;
    this.offset = $elem.getOffset() || {};
    this.status = "";

    if (this.paddingTop + this.getHeight() < this.getWindowHeight())
      this.watch();
  },


  members: {
    watch: function() {
      q(window)
        .on("scroll", this.onScroll, this)
        .on("resize", this.onResize, this);
    },


    onScroll: function() {
      var scrollY = window.scrollY,
          scrollHeight = document.documentElement.scrollHeight,
          isBelow = scrollY > (this.offset.top - this.paddingTop),
          isCloseBottom = scrollY + this.getOuterHeight() >= scrollHeight;

      if (isBelow)
        isCloseBottom ? this.absolutize() : this.fix();
      else
        this.statify();
    },


    onResize: function() {
      if (this.status == "fixed") {
        this.absolutize(); // Temporarily absolutize
        this.offset.left = this.$elem.getOffset() && this.$elem.getOffset().left;
        this.fix();
      } else {
        this.offset.left = this.$elem.getOffset() && this.$elem.getOffset().left;
      }
    },


    getHeight: function() {
      return this.$elem.getHeight();
    },


    getOuterHeight: function() {
      return this.paddingTop + this.getHeight() + this.paddingBottom;
    },


    getWindowHeight: function() {
      return q(window).getHeight();
    },


    getParentHeight: function() {
      var parent = this.$elem.getParents(),
          parentHeight;

      function pixels(style) {
        return parseInt(parent.getStyle(style), 10);
      }

      if (parent.length) {
        parentHeight = parent.getHeight();
        parentHeight -= pixels("paddingTop") + pixels("paddingBottom");
        return parentHeight;
      }

      return 0;
    },


    // Fix at predetermined position, don't scroll
    fix: function() {
      if (!(this.status == "fixed")) {
        this.$elem.setStyle("position", "fixed");
        this.$elem.setStyle("left", this.offset.left + "px");
        this.$elem.setStyle("top", this.paddingTop + "px");
        this.status = "fixed";
      }
    },


    // Normal flow
    statify: function() {
      if (!(this.status == "statically")) {
        this.$elem.setStyle("position", "static");
        this.status = "statically";
      }
    },


    // Position at current offset, do scroll
    absolutize: function() {
      if (!(this.status == "absolute")) {
        var offsetCurrent = this.$elem.getOffset(),
            offsetRelative, offsetTop;

        this.$elem.setStyle("position", "static");  // Temporarily statify
        offsetRelative = this.$elem.getOffset();

        offsetTop = offsetCurrent.top - offsetRelative.top;
        offsetTop = this.fixLateScroll(offsetTop);

        this.$elem.setStyle("position", "relative");
        this.$elem.setStyle("top", offsetTop + "px");
        this.$elem.setStyle("left", 0);

        this.status = "absolute";
      }
    },


    // The "scroll" event may be fired too late, so that the offset
    // of the current position (determined by fixed positioning) would already
    // cause an overflow. As last resort, work around by limiting offset to highest
    // offset acceptable. For smooth normal scrolling, still use the offset calculated
    // from previous fixed position when appropriate.
    fixLateScroll: function(offset) {
      var offsetTopMax = this.getParentHeight() - this.getHeight();
      return Math.min(offset, offsetTopMax);
    }
  }
});

q.$attach({
  sticky: function(paddingTop, paddingBottom) {
    if (this.length > 1) {
      this.forEach(function(item) {
        new Sticky(q(item), paddingTop, paddingBottom);
      });
    } else {
      new Sticky(this, paddingTop, paddingBottom);
    }
    return this;
  }
});

})();
