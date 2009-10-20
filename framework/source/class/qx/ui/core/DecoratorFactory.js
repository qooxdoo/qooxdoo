/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class is responsible for creating and maintaining {@link qx.html.Element}
 * instances. It pools decorator elements for reuse.
 * 
 *  @internal
 */
qx.Class.define("qx.ui.core.DecoratorFactory",
{
  extend : qx.core.Object,

  construct : function() 
  {
    this.base(arguments);
    this.__pool = {};
  },
  
  
  statics :
  {
    MAX_SIZE: 5,
    NO_POOL_ID: "$$nopool$$"
  },
  
  
  members :
  {
    __pool : null, 
  
    
    /**
     * Get a decorator element configured with the given decorator.
     * 
     * @param decorator {qx.ui.decoration.IDecorator} The decorator to use
     * @return {qx.html.Decorator} The configured decorator element
     */
    getDecoratorElement : function(decorator)
    {
      var clazz = qx.ui.core.DecoratorFactory;
      
      if (qx.lang.Type.isString(decorator))
      {
        var id = decorator;
        var decoratorInstance = qx.theme.manager.Decoration.getInstance().resolve(decorator);
      }
      else
      {
        var id = clazz.NO_POOL_ID;
        decoratorInstance = decorator;
      }
      
      var pool = this.__pool;
      if (pool[id] && pool[id].length > 0) {
        return pool[id].pop();
      } else {
        var element = this._createDecoratorElement(decoratorInstance, id);
        return element;
      }
    },
    
    
    /**
     * Pool or dispose the given decorator element
     * 
     * @param decoratorElement {qx.html.Decorator} the decorator element to pool
     */
    poolDecorator : function(decoratorElement)
    {
      if (!decoratorElement) {
        return;
      }
      
      var clazz = qx.ui.core.DecoratorFactory;
      var id = decoratorElement.getId();
      if (id == clazz.NO_POOL_ID)
      {
        decoratorElement.dispose();
        return;
      }
      
      var pool = this.__pool;
      if (!pool[id]) {
        pool[id] = []
      }
      
      if (pool[id].length > clazz.MAX_SIZE) {
        decoratorElement.dispose();
      } else {
        pool[id].push(decoratorElement);
      }
    },
    
    
    /**
     * Creates an element which may be used for a
     * decoration render to fill.
     *
     * @param decorator {qx.ui.decoration.IDecorator} Any instance implementing 
     *     the decorator interface
     * @param id {String?} An optional id for the decorator
     * @return {qx.html.Decorator} The element to be used for decorations/shadows
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

  
  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown)
    {
      var pool = this.__pool;
      for (var key in pool) {
        qx.util.DisposeUtil.disposeArray(pool, key);
      }
    }

    this._disposeFields("__pool");
  }
});
