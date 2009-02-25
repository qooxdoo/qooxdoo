/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * EXPERIMENTAL!
 * 
 * 
 */
qx.Mixin.define("qx.data.marshal.MEventBubbling", 
{

  events : {
    /**
     * The change event which will be fired on every change in the model no 
     * matter what property changes. This event bubbles so the root model will 
     * fire a change event on every change of its children properties too.
     * 
     * The data will contain a map with the following three keys
     *   <li>value: The new value of the property</li>
     *   <li>name: The name of the property changed including its parent 
     *     properties separated by dots.</li>
     *   <li>old: The old value of the property.</li>
     * Due to that, the <code>getOldData</code> method will always return null 
     * because the old data is contained in the map.
     */
    "changeBubble": "qx.event.type.Data"
  },


  members : {
    
    _applyEventPropagation: function(value, old, name) {
      this.fireDataEvent("changeBubble", {value: value, name: name, old: old});

      if ((value instanceof qx.core.Object) 
        && qx.Class.hasMixin(value.constructor, qx.data.marshal.MEventBubbling)
      ) {
        var listener = qx.lang.Function.bind(
          this.__changePropertyListener, this, name
        );
        var id = value.addListener("changeBubble", listener, this);
        value.setUserData("idBubble", id);        
      }

      if (old != null && old.getUserData && old.getUserData("idBubble") != null) {
        old.removeListenerById(old.getUserData("idBubble"));
      }

    },


    __changePropertyListener: function(name, e) {
      var data = e.getData();
      var value = data.value;
      var old = data.old;

      if (qx.Class.hasInterface(e.getTarget().constructor, qx.data.IListData)) {
        if (data.name.indexOf) {
          var dotIndex = data.name.indexOf(".") != -1 ? data.name.indexOf(".") : data.name.length;
          var bracketIndex = data.name.indexOf("[") != -1 ? data.name.indexOf("[") : data.name.length;

          if (dotIndex < bracketIndex) {
            var index = data.name.substring(0, dotIndex);
            var rest = data.name.substring(dotIndex + 1, data.name.length);
            if (rest[0] != "[") {
              rest = "." + rest;
            }
            var newName =  name + "[" + index + "]" + rest;
          } else if (bracketIndex < dotIndex) {
            var index = data.name.substring(0, bracketIndex);
            var rest = data.name.substring(bracketIndex, data.name.length);
            var newName =  name + "[" + index + "]" + rest;            
          } else {
            var newName =  name + "[" + data.name + "]";
          }
        } else {
          var newName =  name + "[" + data.name + "]";
        }
        
        
      } else {
        var newName =  name + "." + data.name;        
      }


      this.fireDataEvent(
        "changeBubble", 
        {
          value: value,
          name: newName,
          old: old
        }
      );
    }            
  }
});
