qx.Class.define("testrunner.view.mobile.MainButton", {

  extend : qx.ui.mobile.form.Button,

  construct : function(label, icon)
  {
    this.base(arguments, label, icon);
    qx.bom.element.Class.replace(this.getContentElement(), "button", "navigationbar-backbutton");
  },

  properties :
  {
    state :
    {
      apply : "_applyState"
    }
  },

  members :
  {
    _applyState : function(value)
    {
      var el = this.getContentElement();
      var cls = qx.bom.element.Class;
      cls.removeClasses(el, ["runbutton", "stopbutton"]);
      switch(value) {
        case "init":
          break;
        case "loading":
          this.setEnabled(false);
          break;
        case "ready":
          this.setEnabled(true);
          this.setValue("Run");
          cls.add(el, "runbutton");
          break;
        case "error":
          this.setEnabled(false);
          break;
        case "running":
          this.setValue("Stop");
          cls.add(el, "stopbutton");
          break;
        case "finished":
          this.setValue("Run");
          cls.add(el, "runbutton");
          break;
        case "aborted":
          this.setValue("Run");
          cls.add(el, "runbutton");
      }
    }
  }
});
