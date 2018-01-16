rmdir  /Q /S myapp
call qx create myapp -I  -v || EXIT /B 1
cd myapp
call qx contrib update -v || EXIT /B 1
call qx contrib list -v || EXIT /B 1
call qx contrib install oetiker/UploadWidget --release v1.0.0 -v || EXIT /B 1
call qx contrib install cboulanger/qx-contrib-Dialog --release v1.3.0-beta.3 -v || EXIT /B 1
call qx contrib install johnspackman/UploadMgr --release v1.0.0 -v || EXIT /B 1
call qx compile -v || EXIT /B 1
rmdir /Q /S contrib
call qx contrib install  -v || EXIT /B 1
call qx contrib remove cboulanger/qx-contrib-Dialog -v || EXIT /B 1
