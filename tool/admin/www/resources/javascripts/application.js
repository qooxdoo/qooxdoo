/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 - 2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

var app = {
  getType: function() {
    if (q("body.dokuwiki").length) return "site";
    if (q("body.blog").length) return "blog";
    if (q("#main-wrapper.sphinx").length) return "manual";
    if (q("body.bugzilla-qooxdoo-org").length) return "bugs";
  }
};

q.ready(function() {
  q().domain && q("body#home section#domains").domain(".domain", ".icons");
  q().sticky && q("#sidebar").sticky(q("#wpadminbar").length ? 48 : 20, 324);

  // "Latest / All" toggle
  q("#versions-hint").on("click", function(e) {
    $target = q(e.getTarget());
    if (!$target.is("a")) return;
    $target.hasClass("all") ?
      q(".versions").addClass("show") :
      q(".versions").removeClass("show");
    $target.getSiblings().removeClass("active");
    $target.addClass("active");
  });

  // Search in current and other subsystems
  var searchView = {
    render: function(type, value) {
      type = type || app.getType() || "site";
      value = value || "";

      var searchTemplate = q("#search-" + type + "-template").getHtml();
      var optionsTemplate = q("#search-options-template").getHtml();
      var html = searchTemplate + optionsTemplate;
      if (html) q("#search").setHtml(html);

      q("#search input[type=search]").setValue(value);
      q("#search select option[value=" + type + "]").setAttribute("selected", "true");
      q("#search").emit("render");
    }
  };

  // Update search view on type change
  q("#search").on("change", function(evt) {
    if (!q(evt.getTarget()).is("select")) return;
    var type = q("#search select").getValue().toLowerCase();
    var value = q("#search input[type=search]").getValue();
    searchView.render(type, value);
  });

  // Apply placeholder plugin to new search input
  q("#search").on("render", function() {
    q().placeholder && q("#search input[type=search]").placeholder();
  });

  searchView.render();

  // Read current domain from anchor
  (function() {
    if (!q("body#demos").length) return;

    var domains = q("#domains .domain"),
        chosenDomain = location.hash.substring(1),
        showAllButton = q("#show-all");

    var expand = function(domain) {
      domain.addClass("expanded");
      domain.removeClass("compact");
    };

    var compact = function(domain) {
        domain.removeClass("expanded");
        domain.addClass("compact");
    };

    var expandAll = function() {
      domains.forEach(function(domain) {
        domain = q(domain);
        domain.removeClass("compact");
        domain.addClass("expanded");
        domains.getParents().addClass("all");
        showAllButton.setStyle("display", "none");
      });
    };

    if (chosenDomain) {
      domains.forEach(function(domain) {
        domain = q(domain);
        if (!domain.hasClass(chosenDomain)) {
          compact(domain);
        } else {
          expand(domain);
        }
      });

      showAllButton.setStyle("display", "block");
      showAllButton.on("click", expandAll);
      domains.getParents().removeClass("all");
      domains.filter(".compact").on("click", function(evt) {
        target = q(evt.getTarget());
        if (!target.is("h3")) {
          expandAll();
        }
      });
    } else {
      expandAll();
    }
  })();

});

// SyntaxHighlighter
if (typeof SyntaxHighlighter !== "undefined") {
  SyntaxHighlighter.defaults['gutter'] = false;
  SyntaxHighlighter.defaults['toolbar'] = false;
  SyntaxHighlighter.all();
}
