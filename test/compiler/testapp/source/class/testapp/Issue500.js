qx.Class.define("testapp.Issue500", {
  extend: qx.core.Object,
  
  members: {
    test(nextConfigName) {
      console.error(
          `Unable to launch monitor with name ${nextConfigName}.` +
            `Was it deleted?`);
      console.error("abc" + "def");
    }
  }
});
