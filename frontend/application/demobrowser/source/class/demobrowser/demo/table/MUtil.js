qx.Mixin.define("demobrowser.demo.table.MUtil",
{
  construct : function() {
    this._tableLeft = 10;
  },

  members :
  {
    _fixBoxModel : function()
    {
      var boxSizingAttr = qx.legacy.core.Client.getInstance().getEngineBoxSizingAttributes();
      var borderBoxCss = boxSizingAttr.join(":border-box;") + ":border-box;";

      qx.bom.Stylesheet.createElement(
        "*{" + borderBoxCss +"} "
      );
    },


    _getNewTableDiv : function(width)
    {
      var div = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(div, {
        position : "absolute",
        left: this._tableLeft + "px",
        width: (width || 150) + "px",
        top: 20 + "px",
        height: "500px",
        backgroundColor : "#FFE"
      });
      this._tableLeft += (width || 150) + 20;
      document.body.appendChild(div);
      return div;
    },


    permute :function(options, callback)
    {
      var keys = qx.lang.Object.getKeys(options);

      // init
      var map = {};
      var indices = [];
      for (var i=0; i<keys.length; i++)
      {
        indices[i] = 0;
        var key = keys[i];
        map[key] = options[key][0]
      }

      var _perm = function(index, ignore)
      {
        if (index >= keys.length) {
          return;
        }

        var key = keys[index];
        var values = options[key];

        for (var i=0; i<values.length; i++)
        {
          if (ignore !== i)
          {
            indices[index] = i;
            map[key] = values[i];
            callback(map);
          }
          _perm(index+1, indices[index+1]);
        }
      }

      _perm(0, -1);
    }
  }
});