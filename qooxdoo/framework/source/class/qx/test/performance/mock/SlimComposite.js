qx.Class.define("qx.test.performance.mock.SlimComposite",
{
  extend : qx.ui.container.Composite,

  members :
  {
    elementMock : {
      setAttribute : function() {},
      setStyle : function() {},
      setStyles : function() {},
      dispose : function() {}
    },

    _createContentElement : function() {
      return this.elementMock;
    },

    getContentElement : function() {
      return this.getContainerElement();
    }
  }
});