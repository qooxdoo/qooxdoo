/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.core.DecoratorFactory",
{
  extend : qx.core.Object,

  construct : function() 
  {
    this.base(arguments);
    this.__pool = {};
    
    this.__manager = qx.theme.manager.Decoration.getInstance();
  }
  
  members :
  {
    __pool : null, 
    __manager : null,
  
    
    getDecoratorElement : function(decorator)
    {
      if (qx.lang.Type.isString(decorator))
      {
        var id = decorator;
        var decoratorInstance = this.__manager.resolve(decorator);
      }
      else
      {
        var id = decorator.toHashCode();
        decoratorInstance = decorator;
      }
      
      var pool = this.__pool;
      if (pool[id].length > 0) {
        return pool[id].pop();
      } else {
        return this._createDecoratorElement(decoratorInstance);
      }
    },
    
    
    poolDecorator : function(decoratorElement, decorator)
    {
      if (qx.lang.Type.isString(decorator)) {
        var id = decorator;
      } else {
        var id = decorator.toHashCode();
      }
      
      var pool = this.__pool;
      if (!pool[id]) {
        pool[id] = []
      }
      pool[id].push(decoratorElement);
    },
    
    
    /**
     * Creates an element which may be used for a
     * decoration render to fill.
     *
     * @param decorator {qx.ui.decoration.IDecorator} Any instance implementing the decorator interface
     * @return {qx.html.Element} The element to be used for decorations/shadows
     */
    _createDecoratorElement : function(decorator)
    {
      var element = new qx.html.Element;
      element.setStyles({
        position: "absolute",
        top: 0,
        left: 0
      });

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        element.setAttribute("qxType", "decorator");
      }

      element.useMarkup(decorator.getMarkup());

      return element;
    }
  },

  
  destruct : function()
  {
    this._disposeObjects("__pool");
    this._disposeFields("__manager");
  }
});
