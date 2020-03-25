# Migrate your application from qooxdoo 5.0 to qooxdoo 6.0 toolchain

  - create new desktop or mobile application with `qx create oldName` using the information provided in old/Manifest.json
  - replace some folders in the new application with the counterparts of the old application
      - old/source/class -> new/source/class
      - old/source/resource -> new/source/resource
      - old/source/translation -> new/source/translation
  - move old/source/index.html to new/source/boot/index.html
  - add this into new/source/boot/index.html just before `</head>`
```
  ${preBootJs}
  <script type="text/javascript" src="${appPath}boot.js"></script>
```
 - find out which libraries are used in the old application. For this have a look into `config.json` libraries section. Add all libraries found here with 
```
qx pkg update
qx pkg list  
qx pkg install library
```
Hopefully all needed libraries are converted.
 
 - find used theme in old/config.json and set this in new/compile.json
 - run `qx compile` and fix errors
 - run `qx serve` to run build in webserver and test it in your browser `http://localhost:8080/`
  
