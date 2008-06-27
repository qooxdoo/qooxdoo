qx.Mixin.define("qx.ui.core.MThemeTransform",
{
  members :
  {
    _resolveThemedColor : function(value)
    {
      if (value.getValue) {
        return value;
      }

      var mgr = qx.theme.manager.Color.getInstance();
      if (mgr.isDynamic(value)) {
        return qx.ui.core.value.Color.create(mgr.resolveDynamic(value), value);
      }

      return qx.ui.core.value.Color.create(value, null);
    },

    _resolveThemedDecorator : function(value)
    {
      // shortcut
      if (value.getValue) {
        return value;
      }

      var mgr = qx.theme.manager.Decoration.getInstance();
      if (mgr.isDynamic(value)) {
        return mgr.resolveDynamic(value);
      }

      return value;
    },

    _resolveThemedFont : function(value)
    {
      if (value.getValue) {
        return value;
      }

      var mgr = qx.theme.manager.Font.getInstance();
      if (mgr.isDynamic(value)) {
        return mgr.resolveDynamic(value);
      }

      return value;
    },

    _resolveThemedIcon : function(value)
    {
      var mgr = qx.util.AliasManager.getInstance();
      return mgr.resolve(value);
    }
  }
});