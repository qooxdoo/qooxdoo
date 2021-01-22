/* ************************************************************************

   Copyright: 2021 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "flexshrink"
 *
 * @asset(flexshrink/*)
 */
qx.Class.define("flexshrink.Application", {
  extend : qx.application.Standalone,

  members : {
    main : function() {
      this.base(arguments);

      qx.log.appender.Native;
      qx.log.appender.Console;

      var doc = this.getRoot();
      
      (function() {
        let outerContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({ maxWidth: 150 });
        doc.add(outerContainer, { left: 10, top: 10 });
        let innerContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({ appearance: "iframe" });
        innerContainer.add(new qx.ui.basic.Atom("AAAAAAAAA"));
        innerContainer.add(new qx.ui.basic.Atom("BBBBBBBBB"));
        innerContainer.add(new qx.ui.basic.Atom("CCCCCCCCC"));
        outerContainer.add(innerContainer, { flex: 1, flexShrink: true });
        outerContainer.add(new qx.ui.basic.Image("@MaterialIcons/cloud_upload/16"));
      })();
      
      (function() {
        let outerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({ maxHeight: 60 });
        doc.add(outerContainer, { left: 10, top: 80 });
        let innerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({ appearance: "iframe" });
        innerContainer.add(new qx.ui.basic.Atom("AAAAAAAAA"));
        innerContainer.add(new qx.ui.basic.Atom("BBBBBBBBB"));
        innerContainer.add(new qx.ui.basic.Atom("CCCCCCCCC"));
        innerContainer.add(new qx.ui.basic.Atom("DDDDDDDDD"));
        innerContainer.add(new qx.ui.basic.Atom("EEEEEEEEE"));
        innerContainer.add(new qx.ui.basic.Atom("FFFFFFFFF"));
        outerContainer.add(innerContainer, { flex: 1, flexShrink: true });
        outerContainer.add(new qx.ui.basic.Image("@MaterialIcons/cloud_upload/16"));
      })();
      
    }
  }
});
