/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */
/* ************************************************************************


************************************************************************* */
/**
 * Mapping class for all animations used in the clean theme.
 *
 */
qx.Class.define("qx.theme.clean.Animation",
{
  extend : qx.core.Object,

  statics :
  {    
   
    ANIMATIONS :
    {
		"growdown" : 
		{
			duration: 300, 
			timing: "ease", 
			keyFrames : 
			{
				0: {height: "0%"},
				100: {}
			}
		},

		"fadegrowdown" : 
		{
			duration: 300, 
			timing: "ease", 
			keyFrames : 
			{
				0: {opacity: 0, height: "10%"},
				100: {opacity: 1}
			}
		},

		"fadegrowup" : 
		{
			duration: 300, 
			timing: "ease", 
			keyFrames : 
			{
				0: {opacity: 0},
				100: {opacity: 1}
			  }
		}
    }
  }
});
