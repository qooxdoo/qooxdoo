const fs = require('fs');

qx.Class.define("testapp.Issue488", {
  extend: qx.core.Object,
  
  construct(options) {
    this.base(arguments);
    
    console.log(options.apiKey);
    console.log(dontKnow);
    [].slice.call(this, 1);
  },
  
  members: {
    api: function(method, path, options) {
      abc=1;
      return request(ro);
    },
    
    test() {
      fs.readFile("abc.txt");
      var a = 1;
      var b = 2;
      [ a, b, c ].forEach(a => console.log(a));
    }
  },
  
  statics: {
    findOrCreateSsoGroup(apos, type, data) {
      return testapp.Issue488.findSsoGroupById(apos, type, data.id)
        .then(group => {
          return testapp.Issue488.findGroup(apos, { title: data.title })
            .then(group => {
            });
        });
    }
  }
});
