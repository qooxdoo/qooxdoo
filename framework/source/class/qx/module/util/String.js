qx.Bootstrap.define("qx.module.util.String", {
  statics : {
    camelCase : function(str) {
      return qx.lang.String.camelCase.call(qx.lang.String, str);
    },
    hyphenate : function(str) {
      return qx.lang.String.hyphenate.call(qx.lang.String, str);
    },
    firstUp : qx.lang.String.firstUp,
    firstLow : qx.lang.String.firstLow,
    startsWith : qx.lang.String.startsWith,
    endsWith : qx.lang.String.endsWith,
    escapeRegexpChars : qx.lang.String.escapeRegexpChars
  },


  defer : function(statics) {
    q.attachStatic({
      util : {
        String : {
          camelCase : statics.camelCase,
          hyphenate : statics.hyphenate,
          firstUp : statics.firstUp,
          firstLow : statics.firstLow,
          startsWith : statics.startsWith,
          endsWith : statics.endsWith,
          escapeRegexpChars : statics.escapeRegexpChars
        }
      }
    });
  }
});
