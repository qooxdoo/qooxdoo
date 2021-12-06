/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * Christopher Zuendorf (czuendorf)

 ************************************************************************ */

/**
 * Contains property maps for the usage with qx.bom.element.Animation {@link qx.bom.element.Animation}.
 * These animations can be used for page transitions for example.
 */
qx.Bootstrap.define("qx.util.Animation",
{

  statics :
  {
    /** Target slides in from right. */
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
    /** Target slides out from right.*/
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
    /** Target slides in from left.*/
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
    /** Target slides out from left.*/
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
    /** Target fades in. */
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
    /** Target fades out. */
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
    /** Target pops in from center. */
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
    /** Target pops out from center. */
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

    /** Target shrinks its height. */
    SHRINK_HEIGHT : {
      duration: 400,
      timing: "linear",
      origin: "top center",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "1", "1" ],
          opacity: 1
        },
        100: {
          scale : [ "1", "0" ],
          opacity : 0
        }
      }
    },

    /** Target grows its height. */
    GROW_HEIGHT : {
      duration: 400,
      timing: "linear",
      origin: "top center",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "1", "0" ],
          opacity: 0
        },
        100: {
          scale : [ "1", "1" ],
          opacity : 1
        }
      }
    },

    /** Target shrinks its width. */
    SHRINK_WIDTH : {
      duration: 400,
      timing: "linear",
      origin: "left center",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "1", "1" ],
          opacity: 1
        },
        100: {
          scale : [ "0", "1" ],
          opacity : 0
        }
      }
    },

    /** Target grows its width. */
    GROW_WIDTH : {
      duration: 400,
      timing: "linear",
      origin: "left center",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "0", "1" ],
          opacity: 0
        },
        100: {
          scale : [ "1", "1" ],
          opacity : 1
        }
      }
    },

    /** Target shrinks in both width and height. */
    SHRINK : {
      duration: 400,
      timing: "linear",
      origin: "left top",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "1", "1" ],
          opacity: 1
        },
        100: {
          scale : [ "0", "0" ],
          opacity : 0
        }
      }
    },

    /** Target grows in both width and height. */
    GROW : {
      duration: 400,
      timing: "linear",
      origin: "left top",
      keep: 100,
      keyFrames : {
        0: {
          scale : [ "0", "0" ],
          opacity: 0
        },
        100: {
          scale : [ "1", "1" ],
          opacity : 1
        }
      }
    },

    /** Target slides in to top. */
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
    /** Target slides out to top.*/
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
    /** Target slides out to bottom.*/
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
    /** Target slides down to bottom.*/
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
    /** Target flips (turns) left from back side to front side. */
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
    /** Target flips (turns) left from front side to back side. */
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
    /** Target flips (turns) right from back side to front side. */
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
    /** Target flips (turns) right from front side to back side. */
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
    /** Target moves in to left. */
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
    /** Target moves out to left.  */
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
    /** Target moves in to right. */
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
    /** Target moves out to right. */
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
    /** Target moves in with cube animation from right to left.  */
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
    /** Target moves out with cube animation from right to left.  */
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
    /** Target moves in with cube animation from left to right.  */
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
    /** Target moves out with cube animation from left to right.  */
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
