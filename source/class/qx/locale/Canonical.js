qx.Class.define("qx.locale.Canonical", {
  statics: {
    getDay(locale) {
      var parts = new Intl.DateTimeFormat(locale, {
        day: "2-digit"
      }).formatToParts(new Date(2000, 1, 1));

      var result = [];
      for (var part of parts) {
        var value = part.value;
        var type = part.type;
        if (type === "literal") {
          result.push(value);
        } else if (type === "day") {
          result.push("d");
        }
      }
      return new qx.locale.LocalizedString(
        result.join(""),
        "cldr_date_time_format_d",
        [],
        true
      );
    },

    getYear(locale) {
      var parts = new Intl.DateTimeFormat(locale, {
        year: "numeric"
      }).formatToParts(new Date(2000, 1, 1));

      var result = [];
      for (var part of parts) {
        var value = part.value;
        var type = part.type;
        if (type === "literal") {
          result.push(value);
        } else if (type === "year") {
          result.push("y");
        }
      }
      return new qx.locale.LocalizedString(
        result.join(""),
        "cldr_date_time_format_y",
        [],
        true
      );
    }
  }
});
