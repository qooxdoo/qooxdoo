/**
 * @ignore(require)
 */
const fs = require('fs');

qx.Class.define("testapp.InnerEs6Classes", {
  extend: qx.core.Object,
  
  construct(options) {
    this.base(arguments);
    
    class ClassStats {
      constructor(classname) {
        this.classname = classname;
      }
      
      forProperty(propName) {
        return propName;
      }
    }
    /*
    class AllStats {
      constructor() {
        new ClassStats("abc.X");
      }
    }
    */
  },
  
  members: {
    /*
    testOne() {
      return new ClassStats("abc.X");
    },
    
    testTwo() {
      class ClassStatsTwo {
        constructor(classname) {
          this.classname = classname;
        }
        
        forProperty(propName) {
          return propName;
        }
      }
      
      class AllStatsTwo {
        constructor() {
          new ClassStatsTwo("abc.X");
        }
      }
    }
    */
  },
  
  statics: {
    /*
    staticTestOne() {
      return new ClassStats("abc.X");
    },
    
    staticTestTwo() {
      class ClassStatsStaticTwo {
        constructor(classname) {
          this.classname = classname;
        }
        
        forProperty(propName) {
          return propName;
        }
      }
      
      class AllStatsStaticTwo {
        constructor() {
          new ClassStatsStaticTwo("abc.X");
        }
      }
    }
    */
  }
});
