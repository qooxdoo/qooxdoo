// Regression fixture for GitHub issue #633 - loaded by qx.test.tool.compiler.ClassFile

qx.Class.define("externalSuperClass",
{
  extend : my.application.control.EditableList,
    members :
  {
    /**
     * Create an editor instance
     * 
     * [Constructor]
     * 
     * @return {Object}
     */
    _createEditorInstance : function() {
      return null;
    }
  }
});
