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
  },
  
  
  members :
  {
    __pool : null, 
  
    
    getDecoratorElement : function(decorator)
    {
      if (qx.lang.Type.isString(decorator))
      {
        var id = decorator;
        var decoratorInstance = qx.theme.manager.Decoration.getInstance().resolve(decorator);
      }
      else
      {
        var id = decorator.toHashCode();
        decoratorInstance = decorator;
      }
      
      var pool = this.__pool;
      if (pool[id] && pool[id].length > 0) {
//        console.log("hit!")
        return pool[id].pop();
      } else {
//        console.log("miss!")
        var element = this._createDecoratorElement(decoratorInstance, id);
        return element;
      }
    },
    
    
    poolDecorator : function(decoratorElement)
    {
      var id = decoratorElement.getId();
      
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
    _createDecoratorElement : function(decorator, id)
    {
      var element = new qx.html.Decorator(decorator, id);

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        element.setAttribute("qxType", "decorator");
      }

      return element;
    }
  },

  
  destruct : function() {
    this._disposeObjects("__pool");
  }
});
