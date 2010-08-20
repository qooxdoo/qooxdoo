/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.event.type.Touch", 
{
    extend : qx.event.type.Dom,


    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members :
    {
      // overridden
      init : function(nativeEvent, target, relatedTarget, canBubble, cancelable)
      {
        this.base(arguments, nativeEvent, target, relatedTarget, canBubble, cancelable);

        if (!relatedTarget) {
          this._relatedTarget = qx.bom.Event.getRelatedTarget(nativeEvent);
        }

        return this;
      },


      // overridden
      _cloneNativeEvent : function(nativeEvent, clone)
      {
        var clone = this.base(arguments, nativeEvent, clone);

        clone.pageX = nativeEvent.pageX;
        clone.pageY = nativeEvent.pageY;
        clone.layerX = nativeEvent.layerX;
        clone.layerX = nativeEvent.layerX;
        clone.srcElement = nativeEvent.srcElement;
        clone.type = nativeEvent.type;
        clone.currentTarget = nativeEvent.currentTarget;
        clone.rotation = nativeEvent.rotation;
        clone.timestamp = nativeEvent.timestamp;
        clone.identifier = nativeEvent.identifier;
        clone.scale = nativeEvent.scale;
        
        // TODO (reference type?)
        clone.targetTouches = [];
        for (var i = 0; i < nativeEvent.targetTouches.length; i++) {
          clone.targetTouches[i] = nativeEvent.targetTouches.item(i);
        };

        clone.changedTouches = [];
        for (var i = 0; i < nativeEvent.changedTouches.length; i++) {
          clone.changedTouches[i] = nativeEvent.changedTouches.item(i);
        };
        
        clone.touches = [];
        for (var i = 0; i < nativeEvent.touches.length; i++) {
          clone.touches[i] = nativeEvent.touches.item(i);
        };
        
        return clone;
      },


      // overridden
      stop : function() {
        this.stopPropagation();
      },
      
      
      getTouches : function() {
        return this._native.touches;
      },
      
      
      getPageX : function() {
        return this._native.touches[0].pageX;
      },
      
      getPageY : function() {
        return this._native.touches[0].pageY;
      }      
    }
  });
