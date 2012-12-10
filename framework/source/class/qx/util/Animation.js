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
 * Contains property maps for the usage with qx.bom.element.Animation {@link qx.bom.element.Animation}.
 * These animations can be used for page transitions for example.
 */
qx.Class.define("qx.util.Animation",
{
  
  statics : 
  {
    SLIDE_LEFT_IN : {
      duration: 350,
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
    
    SLIDE_LEFT_OUT : {
      duration: 350, 
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
    
    SLIDE_RIGHT_IN : {
      duration: 350, 
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
    
    SLIDE_RIGHT_OUT : {
      duration: 350, 
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
      
    FADE_IN : {
      duration: 350, 
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
      
    
    FADE_OUT : {
      duration: 350, 
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
      
    POP_IN : {
      duration: 350, 
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
      
    POP_OUT : {
      duration: 350, 
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
    
    SLIDE_UP_IN : {
      duration: 350, 
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
    
    SLIDE_UP_OUT : {
      duration: 350, 
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
      
    SLIDE_DOWN_IN : {
      duration: 350, 
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
    
    SLIDE_DOWN_OUT : {
      duration: 350, 
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
    
    FLIP_LEFT_IN : {
      duration: 350, 
      timing: "linear", 
      origin: "center", 
      keyFrames : {
        0: {
          opacity : 0
        },
        49: {
          opacity : 0
        },
        50: {
          rotate : ["0deg","90deg"],
          scale : [".8","1"],
          opacity : 1
        },
        100: {
          rotate : ["0deg","0deg"],
          scale : ["1","1"],
          opacity : 1
        }
      }
    },
    
    FLIP_LEFT_OUT : {
      duration: 350, 
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
      
    FLIP_RIGHT_IN : {
      duration: 350, 
      timing: "linear", 
      origin: "center center", 
      keyFrames : {
        0: {
          opacity : 0
        },
        49: {
          opacity : 0
        },
        50: {
          rotate : ["0deg","-90deg"],
          scale : [".8","1"],
          opacity : 1
        },
        100: {
          rotate : ["0deg","0deg"],
          scale : ["1","1"],
          opacity : 1
        }
      }
    },
    
    FLIP_RIGHT_OUT : {
      duration: 350, 
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
    
    SWAP_LEFT_IN : {
      duration: 700, 
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
    
    SWAP_LEFT_OUT : {
      duration: 700, 
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
    
    SWAP_RIGHT_IN : {
      duration: 700, 
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
    
    SWAP_RIGHT_OUT : {
      duration: 700, 
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
    
    CUBE_LEFT_IN : {
      duration: 550, 
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
    
    CUBE_LEFT_OUT : {
      duration: 550, 
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
    
    CUBE_RIGHT_IN : {
      duration: 550, 
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
    
    CUBE_RIGHT_OUT : {
      duration: 550, 
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
    }
  }
});
