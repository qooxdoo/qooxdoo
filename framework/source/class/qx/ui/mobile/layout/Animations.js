/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * Christopher Zuendorf (czuendorf)

 ************************************************************************ */

/**
 * Contains all animations which are needed for page transitions on Card Layout {@link qx.ui.mobile.layout.Card}.
 */
qx.Class.define("qx.ui.mobile.layout.Animations",
{
  extend : qx.core.Object,
  
  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
    
    this.__animations = {
      slideLeftIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            translate : ["100%"]
          },
          100: {
            translate : ["0%"]
          }
        }
      },
      slideLeftOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            translate : ["0px"]
          },
          100: {
            translate : ["-100%"]
          }
        }
      }, 
      slideRightIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            translate : ["-100%"]
          },
          100: {
            translate : ["0%"]
          }
        }
      }, 
      slideRightOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            translate : ["0px"]
          },
          100: {
            translate : ["100%"]
          }
        }
      },
      
      fadeIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            opacity : ["0"]
          },
          100: {
            opacity : ["1"]
          }
        }
      },
      
    
      fadeOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "bottom center", 
        keyFrames : {
          0: {
            opacity : ["1"]
          },
          100: {
            opacity : ["0"]
          }
        }
      },
      
      popIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            scale : [".2",".2"]
          },
          100: {
            scale : ["1","1"]
          }
        }
      },
      
      popOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            scale : ["1","1"]
          },
          100: {
            scale : [".2",".2"]
          }
        }
      },
      slideUpIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            translate : ["0px","100%"]
          },
          100: {
            translate : ["0px","0px"]
          }
        }
      },
      slideUpOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            translate : ["0px","0px"]
          },
          100: {
            translate : ["0px","0px"]
          }
        }
      },
      
      slideDownIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            translate : ["0px","0px"]
          },
          100: {
            translate : ["0px","0px"]
          }
        }
      },
      slideDownOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            translate : ["0px","0px"]
          },
          100: {
            translate : ["0px","100%"]
          }
        }
      },
      flipLeftIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center", 
        keyFrames : {
          0: {
            rotate : ["0deg","180deg"],
            scale : [".8","1"]
          },
          100: {
            rotate : ["0deg","0deg"],
            scale : ["1","1"]
          }
        }
      },
      flipLeftOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            scale : ["1","1"]
          },
          100: {
            rotate : ["0deg","-180deg"],
            scale : [".8","1"]
          }
        }
      },
      
      flipRightIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","-180deg"],
            scale : [".8","1"]
          },
          100: {
            rotate : ["0deg","0deg"],
            scale : ["1","1"]
          }
        }
      },
      flipRightOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            scale : ["1","1"]
          },
          100: {
            rotate : ["0deg","180deg"],
            scale : [".8","1"]
          }
        }
      },
      swapLeftIn : {
        duration: this.__animationDuration, 
        timing: "ease-out", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","-70deg"],
            translate : ["0px","0px","-800px"],
            opacity : "0"
          },
          35: {
            rotate : ["0deg","-20deg"],
            translate : ["-180px","0px","-400px"],
            opacity : "1"
          },
          100: {
            rotate : ["0deg","0deg"],
            translate : ["0px","0px","0px"],
            opacity : "1"
          }
        }
      },
      swapLeftOut : {
        duration: this.__animationDuration, 
        timing: "ease-out", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            translate : ["0px","0px","0px"],
            opacity : "1"
          },
          35: {
            rotate : ["0deg","20deg"],
            translate : ["-180px","0px","-400px"],
            opacity : ".5"
          },
          100: {
            rotate : ["0deg","70deg"],
            translate : ["0px","0px","-800px"],
            opacity : "0"
          }
        }
      },
      swapRightIn : {
        duration: this.__animationDuration, 
        timing: "ease-out", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","70deg"],
            translate : ["0px","0px","-800px"],
            opacity : "0"
          },
          35: {
            rotate : ["0deg","20deg"],
            translate : ["-180px","0px","-400px"],
            opacity : "1"
          },
          100: {
            rotate : ["0deg","0deg"],
            translate : ["0px","0px","0px"],
            opacity : "1"
          }
        }
      },
      swapRightOut : {
        duration: this.__animationDuration, 
        timing: "ease-out", 
        origin: "center center", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            translate : ["0px","0px","0px"],
            opacity : "1"
          },
          35: {
            rotate : ["0deg","-20deg"],
            translate : ["180px","0px","-400px"],
            opacity : ".5"
          },
          100: {
            rotate : ["0deg","-70deg"],
            translate : ["0px","0px","-800px"],
            opacity : "0"
          }
        }
      },
      cubeLeftIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "100% 50%", 
        keyFrames : {
          0: {
            rotate : ["0deg","90deg"],
            scale: ".5",
            translate: ["0","0","0px"],
            opacity : [".5"]
          },
          100: {
            rotate : ["0deg","0deg"],
            scale: "1",
            translate: ["0","0","0"],
            opacity : ["1"]

          }
        }
      },
      cubeLeftOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "0% 50%", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            scale: "1",
            translate: ["0","0","0px"],
            opacity : ["1"]
          },
          100: {
            rotate : ["0deg","-90deg"],
            scale: ".5",
            translate: ["0","0","0"],
            opacity : [".5"]

          }
        }
      },
      cubeRightIn : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "0% 50%", 
        keyFrames : {
          0: {
            rotate : ["0deg","-90deg"],
            scale: ".5",
            translate: ["0","0","0px"],
            opacity : [".5"]
          },
          100: {
            rotate : ["0deg","0deg"],
            scale: "1",
            translate: ["0","0","0"],
            opacity : ["1"]

          }
        }
      },
      cubeRightOut : {
        duration: this.__animationDuration, 
        timing: "linear", 
        origin: "100% 50%", 
        keyFrames : {
          0: {
            rotate : ["0deg","0deg"],
            scale: "1",
            translate: ["0","0","0px"],
            opacity : ["1"]
          },
          100: {
            rotate : ["0deg","90deg"],
            scale: ".5",
            translate: ["0","0","0"],
            opacity : [".5"]

          }
        }
      }};
      
      this.__animationsMap = {
        "slide":{
          "in":this.__animations.slideLeftIn,
          "out":this.__animations.slideLeftOut,
          "reverse":{
            "in":this.__animations.slideRightIn,
            "out":this.__animations.slideRightOut
          }
        },
        "fade":{
          "in":this.__animations.fadeIn,
          "out":this.__animations.fadeOut,
          "reverse":{
            "in":this.__animations.fadeIn,
            "out":this.__animations.fadeOut
          }
        },
        "dissolve":{
          "in":this.__animations.fadeIn,
          "out":this.__animations.fadeOut,
          "reverse":{
            "in":this.__animations.fadeIn,
            "out":this.__animations.fadeOut
          }
        },
        "pop":{
          "in":this.__animations.popIn,
          "out":this.__animations.popOut,
          "reverse":{
            "in":this.__animations.popIn,
            "out":this.__animations.popOut
          }
        },
        "slideup":{
          "in":this.__animations.slideUpIn,
          "out":this.__animations.slideUpOut,
          "reverse":{
            "in":this.__animations.slideDownIn,
            "out":this.__animations.slideDownOut
          }
        },
        "flip":{
          "in":this.__animations.flipLeftIn,
          "out":this.__animations.flipLeftOut,
          "reverse":{
            "in":this.__animations.flipRightIn,
            "out":this.__animations.flipRightOut
          }
        },
        "swap":{
          "in":this.__animations.swapLeftIn,
          "out":this.__animations.swapLeftOut,
          "reverse":{
            "in":this.__animations.swapRightIn,
            "out":this.__animations.swapRightOut
          }
        },
        "cube": {
          "in": this.__animations.cubeLeftIn,
          "out": this.__animations.cubeLeftOut,
          "reverse":{
            "in":this.__animations.cubeRightIn,
            "out":this.__animations.cubeRightOut
          }
        }
      };
  },
  
 
  members :
  {
    __animationDuration : 350,
    __animations : null,
    __animationsMap : null,
   
    
    /**
     * Getter for animationsMap.
     */
    getMap : function() {
      return this.__animationsMap;
    }
  },

  
  destruct : function()
  {
    this._disposeObjects("__animations", "__animationsMap");
  }
});
