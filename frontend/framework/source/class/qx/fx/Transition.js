/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * TODO
 */
qx.Class.define("qx.fx.Transition",
{
	type : "static",
	
  statics :
  {
    linear: function(pos)
    {
      return pos;
    },
    
    sinoidal: function(pos)
    {
      return ( -Math.cos(pos * Math.PI) / 2 ) + 0.5;
    },
    
    reverse: function(pos)
    {
      return 1 - pos;
    },
    
    flicker: function(pos)
    {
      var pos = ( (-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() / 4;
      return pos > 1 ? 1 : pos;
    },
    
    wobble: function(pos)
    {
      return ( -Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
    },
    
    pulse: function(pos, pulses)
    {

      pulses = (typeof(pulses) == "Number") ? pulses : 5;

      return (
        Math.round((pos % (1/pulses)) * pulses) == 0 ? 
              Math.floor((pos * pulses * 2) - (pos * pulses * 2)) : 
          1 - Math.floor((pos * pulses * 2) - (pos * pulses * 2))
        );
    },
    
    spring: function(pos)
    {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6)); 
    },
    
    none: function(pos)
    {
      return 0;
    },
    
    full: function(pos)
    {
      return 1;
    }
  }
});
