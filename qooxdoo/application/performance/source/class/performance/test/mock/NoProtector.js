qx.Class.define("performance.test.mock.NoProtector",
{
  extend : qx.ui.core.Widget,

  members :
  {
    elementMock : {
      setAttribute : function() {},
      setStyle : function() {},
      setStyles : function() {},
      dispose : function() {}
    },

    _createProtectorElement : function() {
      return this.elementMock;
    },

    getContentElement : function() {
      return this.getContainerElement();
    }
  }
});