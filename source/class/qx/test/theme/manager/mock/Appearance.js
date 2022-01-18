qx.Theme.define("qx.test.theme.manager.mock.Appearance", {
  extend: qx.theme.simple.Appearance,

  appearances: {
    "test-button-gradient": {
      alias: "button",
      style(states) {
        return {
          padding: [30, 80],
          decorator: "test-button-gradient"
        };
      }
    },

    "test-button-gradient/label": {
      style(states) {
        return {
          textColor: "red"
        };
      }
    },

    "button-frame": {
      alias: "atom",

      style(states) {
        return {
          decorator: "button-box",
          padding: [30, 80]
        };
      }
    },

    "button-frame/label": {
      alias: "atom/label",

      style(states) {
        return {
          textColor: "text"
        };
      }
    }
  }
});
