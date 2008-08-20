qx.Theme.define("demobrowser.Appearance",
{
  extend : qx.theme.modern.Appearance,
  title : "Demo browser",

  appearances :
  {
    "demo-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          decorator: "pane",
          padding: 2,
          backgroundColor: "undefined",
          width: 300
        }
      }
    },

    "demo-frame" :
    {
      style : function(states)
      {
        return {
          decorator : null
        }
      }
    },

    "log-page" :
    {
      include : "tabview-page",
      alias : "tabview-page",

      style : function(states)
      {
        return {
          backgroundColor: "undefined"
        }
      }
    },

    "html-page" : "log-page",
    "code-page" : "log-page",

		"demo-header" : {
      extend : "toolbar",
      alias : "toolbar"
		},

    "demo-menubar" : "toolbar",
    "demo-toolbar" : "toolbar",

    "main-splitpane" :
    {
      extend : "splitpane",
      alias : "splitpane",

      style : function(states)
      {
        return {
          margin : [2, 0, 0, 2]
        };
      }
    },

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          paddingRight : 1,
          backgroundColor : "#dfdfdf"
        };
      }
    }

  }

});