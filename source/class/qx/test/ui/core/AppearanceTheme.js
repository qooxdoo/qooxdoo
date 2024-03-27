qx.Theme.define("qx.test.ui.core.AppearanceTheme", {
  appearances: {
    test: {
      style(states) {
        return {
          backgroundColor: "red"
        };
      }
    },

    "test/text": {
      style(states) {
        return {
          backgroundColor: "blue"
        };
      }
    },

    textfield: {
      style(states) {
        return {
          backgroundColor: "green"
        };
      }
    },

    test2: {
      style(states) {
        return {
          backgroundColor: "yellow"
        };
      }
    },

    "test2/text2": {
      style(states) {
        return {
          backgroundColor: "black"
        };
      }
    }
  }
});
