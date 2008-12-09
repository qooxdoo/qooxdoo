/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * EXPERIMENTAL!!!
 */
qx.Mixin.define("qx.data.MBinding", 
{
  members :
  {
    bind : function(sourcePropertyChain, targetObject, targetProperty, options) {
      return qx.data.SingleValueBinding.bind(this, sourcePropertyChain, targetObject, targetProperty, options);
    },
    
    bindToObject : function(sourceObject, sourcePropertyChain, targetProperty, options) {
      return qx.data.SingleValueBinding.bind(sourceObject, sourcePropertyChain, this, targetProperty, options);      
    },
    
    bindToEvent: function(sourceEvent, targetObject, targetProperty, options){
      return qx.data.SingleValueBinding.bindEventToProperty(this, sourceEvent, targetObject, targetProperty, options);      
    },
    
    removeBinding: function(id){
      qx.data.SingleValueBinding.removeBindingFromObject(this, id);
    },
    
    removeAllBindings: function() {
      qx.data.SingleValueBinding.removeAllBindingsForObject(this);
    },
    
    getBindings: function() {
      return qx.data.SingleValueBinding.getAllBindingsForObject(this);
    }
  }
});
