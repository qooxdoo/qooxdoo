var pos = Number(window.location.href.substring(window.location.href.lastIndexOf("/")+1, window.location.href.length-5));
var tnpos = pos + 1;
var tppos = pos - 1;

if (tnpos < 10)
  tnpos = String("000" + tnpos)
else if (tnpos < 100)
  tnpos = String("00" + tnpos)
else if (tnpos < 1000)
  tnpos = String("0" + tnpos)
else
  tnpos = String(tnpos)

if (tppos < 10)
  tppos = String("000" + tppos)
else if (tppos < 100)
  tppos = String("00" + tppos)
else if (tppos < 1000)
  tppos = String("0" + tppos)
else
  tppos = String(tppos)


document.write('<div id="testHead">qooxdoo: <span>The new era of web interface development</span></div>');
document.write('<div id="testDebug"></div>');
document.write('<div id="testFrame"></div>');
document.write('<div id="testFoot">');
//document.write('[<a href="' + tppos + '.html">Previous</a>|<a href="' + tnpos + '.html">Next</a>] &#160;');
document.write('[<a href="javascript:void(window.application.dispose())">Dispose</a>] &#160;');

if( /\/source\//.test(window.location.href) ) {
  document.write('[<a href="javascript:void(window.location.href=window.location.href.replace(/\\/source\\//, \'\\/public\\/\'))">Public</a>]');
} else {
document.write('[<a href="javascript:void(window.location.href=window.location.href.replace(/\\/public\\//, \'\\/source\\/\'))">Source</a>]');
}
document.write('</div>');
