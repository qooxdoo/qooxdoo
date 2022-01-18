qx.Mixin.define("qx.test.io.MRemoteTest", {
  members: {
    getUrl(path) {
      return qx.util.ResourceManager.getInstance().toUri(path);
    },

    isLocal() {
      return window.location.protocol == "file:";
    },

    needsPHPWarning() {
      this.warn(
        "This test can only be run from a web server with PHP support."
      );
    }
  }
});
