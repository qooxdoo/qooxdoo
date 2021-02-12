qx.Class.define("mylib.LibClass", {
  extend: qx.core.Object,

  members: {
    doSomething() {
      console.log(this.tr("Lib Alpha"));
      console.log(this.tr("Lib Beta"));
      console.log(this.tr("Lib Charlie"));
      console.log(this.tr("Lib Override"));
    }
  }
});