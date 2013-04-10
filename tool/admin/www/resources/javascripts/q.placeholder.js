(function() {

q.$attach({
  placeholder: function() {
    this
      // Remove placeholder
      .on("focus", function() {
        this.setAttribute("data-placeholder", this.getAttribute("placeholder"));
        this.setAttribute("placeholder", "");
      })
      // Add placeholder
      .on("blur", function() {
        if (this.getAttribute("data-placeholder")) {
          this.setAttribute("placeholder", this.getAttribute("data-placeholder"));
        }
      });
  }
});

})();
