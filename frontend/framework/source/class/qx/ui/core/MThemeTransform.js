qx.Mixin.define("qx.ui.core.MThemeTransform",
{
  members :
  {
    _resolveThemedColor : function(value)
    {
      if (value.getCssValue) {
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
      if (value.render) {
        return value;
      }

      var mgr = qx.theme.manager.Decoration.getInstance();
      if (mgr.isDynamic(value)) {
        return new qx.ui.core.value.ThemedDecorator(mgr.resolveDynamic(value), value);
      }

      return value;
    },

    _resolveThemedFont : function(value)
    {
      if (value.getStyles) {
        return value;
      }

      var mgr = qx.theme.manager.Font.getInstance();
      if (mgr.isDynamic(value)) {
        return new qx.ui.core.value.ThemedFont(mgr.resolveDynamic(value), value);
      }

      return value;
    }
  }
});