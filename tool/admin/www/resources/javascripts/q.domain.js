(function() {

var Domain = q.define({
  construct: function(container, childrenSelector, iconsSelector) {
    if (container.getAttribute("id") == null) {
      throw new Error("Container must have id attribute");
    }
    this.containerSelector = "#" + container.getAttribute("id");

    this.childrenSelector = childrenSelector;
    this.iconsSelector = iconsSelector;

    this.container = container;
    this.domains = container.find(childrenSelector);
    this.icons = container.find(iconsSelector);

    this.activeDomain = this.__determineActiveDomain();

    if (this.activeDomain.length) {
      this.__showDescriptions();
    }

    this.domains.on("click", this.onClick, this);
    this.icons.on("click", this.onClickIcon, this);

    // Align feature section (line breaks may differ from platform to platform)
    this.__alignFeatures();

    q("body").on("click", this.onDocumentClick, this);
  },

  members: {
    containerSelector: null,
    childrenSelector: null,

    domains: null,
    icons: null,
    activeDomain: null,
    activeIcon: null,

    // Expand domain on click
    onClick: function(evt) {
      var target = q(evt.getTarget()),
          domain = target.getClosest(this.childrenSelector);

      if (target.getClosest(".domain.active header").length) {
        this.onActiveHeaderClick(evt);
        return;
      }

      this.toggle(domain);
    },

    onDocumentClick: function(evt) {
      var target = q(evt.getTarget());

      // Ignore clicks when inside domains
      if (target.getClosest(this.containerSelector).length) {
        return;
      }

      this.onOutsideClick();
    },

    onOutsideClick: function(evt) {
      this.__closeActive();
    },

    onActiveHeaderClick: function(evt) {
      this.__closeActive();
    },

    onClickIcon: function(evt) {
      var target = q(evt.getTarget());
      if (target.filter("img").length) {
        var domain = target.getAttribute("data-domain");
        if (domain) {
          this.toggle(domain);
        }
      }
    },

    toggle: function(domain) {
      var otherDomains;

      if (typeof domain == "string") {
        domain = this.domains.filter("#" + domain);
      }

      if (this.activeDomain && this.activeDomain[0] == domain[0]) {
        return;
      }

      if (this.activeDomain) {
        this.activeDomain.removeClass("active");
      }

      if (this.activeIcon) {
        this.activeIcon.removeClass("active");
      }

      this.activeDomain = domain;
      this.activeDomain.addClass("active");

      this.__activateIcon(this.activeDomain);
      this.__showDescriptions();
    },

    __activateIcon: function(domain) {
      var icon = this.icons.find("[data-domain=" + domain.getAttribute("id") + "]");
      this.activeIcon = icon;
      this.activeIcon.addClass("active");
    },

    __deactivateIcon: function() {
      if (this.activeIcon) {
        this.activeIcon.removeClass("active");
        this.activeIcon = null;
      }
    },

    __determineActiveDomain: function() {
      var activeDomain = this.domains.filter(".active"),
          hash;

      // No active domain predefined, try to read from location hash
      if (!activeDomain.length) {
        hash = location.hash;
        if (hash.match(/#\w+/)) {
          activeDomain = this.domains.filter("#" + hash);
          activeDomain.addClass("active");
        }
      }

      return activeDomain;
    },

    __showDescriptions: function() {
      this.activeDomain.getChildren(".description").setStyle("display", "block");
      otherDomains = this.domains.filter(":not(.active)");
      otherDomains.getChildren(".description").setStyle("display", "none");
      this.container.addClass("active");
    },

    __alignFeatures: function() {
      // TODO: Copied from qx.lang.Array#max
      var max = function(arr) {
        var i, len=arr.length, result = arr[0];

        for (i = 1; i < len; i++)
        {
          if (arr[i] > result) {
            result = arr[i];
          }
        }

        return result === undefined ? null : result;
      };

      // Determine feature with greatest height
      var height = max(this.domains.find(".introduction").map(function(description) {
        return q(description).getHeight();
      }));

      this.domains.find(".feature")
        .setStyle("top", height + "px")
        .setStyle("visibility", "visible");
    },

    __closeActive: function() {
      if (this.activeDomain && this.activeDomain.removeClass) {
        this.activeDomain.removeClass("active");
        this.activeDomain = null;
        this.domains.filter(":not(#core)").getChildren(".description").setStyle("display", "block");
        this.domains.filter("#core").getChildren(".description").setStyle("display", "none");
        this.container.removeClass("active");
        this.__deactivateIcon();
      }
    }
  }
});

q.$attach({
  domain: function(childrenSelector, iconsSelector) {
    if (!this.length) {
      return this;
    }
    if (this.length > 1) {
      throw new Error("Container collection must contain only one element");
    }
    // Work on container
    new Domain(this, childrenSelector, iconsSelector);
    return this;
  }
});

})();
