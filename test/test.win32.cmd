rmdir  /Q /S myapp
:: test create app
call qx create myapp --type server -I  -v || EXIT /B 1
cd myapp
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1
:: test add contrib
call qx contrib update -v || EXIT /B 1
call qx contrib list -v || EXIT /B 1
call qx contrib install oetiker/UploadWidget -v || EXIT /B 1
call qx contrib install cboulanger/qx-contrib-Dialog -v || EXIT /B 1
call qx contrib install johnspackman/UploadMgr -v || EXIT /B 1
call qx contrib install ergobyte/qookery/qookeryace -v || EXIT /B 1
call qx contrib install ergobyte/qookery/qookerymaps -v || EXIT /B 1
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1
:: test reinstall contrib
call qx clean
call qx contrib install  -v || EXIT /B 1
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1
:: test remove contrib
call qx contrib remove oetiker/UploadWidget -v || EXIT /B 1
call qx contrib remove ergobyte/qookery/qookeryace -v || EXIT /B 1
call qx contrib remove ergobyte/qookery/qookerymaps -v || EXIT /B 1
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1
:: test install without manifest
call qx contrib install ergobyte/qookery -v || EXIT /B 1
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1
:: test add class and add script
call qx add class myapp.Window --extend=qx.ui.window.Window --force || EXIT /B 1
call qx add script ../testdata/npm/script/jszip.js --rename=zip.js || EXIT /B 1
copy ..\testdata\npm\application\*.js source\class\myapp /Y
call qx lint --fix --warnAsError || EXIT /B 1
call qx compile -v --clean || EXIT /B 1
call node compiled\source\myapp\myapp.js || EXIT /B 1

