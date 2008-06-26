qx.Mixin.define("qx.ui.core.MThemeTransform",
{
  members :
  {
    _resolveThemedColor : function(value)
    {
      var mgr = qx.theme.manager.Color.getInstance();
      if (mgr.isDynamic(value)) {
        return mgr.resolveDynamic(value);
      } else {
        return value;
      }
    },

    _resolveThemedDecorator : function(value)
    {
      var mgr = qx.theme.manager.Decoration.getInstance();
      if (mgr.isDynamic(value)) {
        return mgr.resolveDynamic(value);
      } else {
        return value;
      }
    },

    _resolveThemedFont : function(value)
    {
      var mgr = qx.theme.manager.Font.getInstance();
      if (mgr.isDynamic(value)) {
        return mgr.resolveDynamic(value);
      } else {
        return value;
      }
    }
  }
});