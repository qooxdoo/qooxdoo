:: ************************************************************************
::
:: qooxdoo - the new era of web development
::
:: http://qooxdoo.org
::
:: Copyright:
::   2004-2007 1&1 Internet AG, Germany, http://www.1und1.de
::
:: License:
::   LGPL: http://www.gnu.org/licenses/lgpl.html
::   EPL: http://www.eclipse.org/org/documents/epl-v10.php
::   See the LICENSE file in the project's top-level directory for details.
::
:: Authors:
::   * Thomas Herchenroeder (thron7)
::
:: ********************************************************************* */
@echo off
rem
rem NAME
rem  startme.bat -- start script for qooxdoo Build Tool on Windows systems
rem
rem DESCRIPTION
rem  This script starts the qooxdoo Build Tool, a small application to control the
rem  build process of skeleton-based applications.
rem
rem  It has two basic functions, (a) to start a small Python-based web server, and
rem  (b) to launch a URL on that web server with any availabe browser. The URL
rem  will open the admin GUI (itself a qooxdoo application), which in turn will
rem  interact with the web server to perform various actions like saving
rem  configuraton settings and invoking build processes.
rem
rem CAVEATS
rem  - Port 8000 for the web server is hard-coded; if this port is occupied on
rem    your machine, you have to change it here and in the GUI Javascript source
rem    code (which implies you need a source version of this app).
rem  - The whole application is intentionally restricted to local usage (althrough
rem    it uses network connections); don't try it from a remote host
rem
rem
:: Config Section
  setlocal ENABLEDELAYEDEXPANSION
  set DEBUG=0
  set WebSvrWait=5
  set websrvPath=tool/buildtool/bin/cgiserver.py
  set rc=0
  set adminHost=127.0.0.1
  set adminPort=8000
  set adminPath=tool/buildtool/index.html
  set adminUrl=http://!adminHost!:!adminPort!/!adminPath!
  rem set adminUrl=http://127.0.0.1:8000/tool/buildtool/index.html
  set testUrl=http://127.0.0.1:8000/
  set pybin=python
  set tmpFile="%TEMP%.\qxtmp.txt"
:: find cygwin (needed for make etc.)
  echo. I try to find your cygwin installation (needed for make etc.)
  echo. ... this may take some moments
  call :_searchCygwin
  set CygwinPath >nul 2>&1
  if not !errorlevel!==0 (
    echo. I was unable to locate your cygwin installation.
    echo. We may be able to start the admin interface, but without cygwin you will
    echo. not be able run the build commands; shall I continue?
    call :_yesNo
    if !YesNo!==0 (
      echo. Ok, aborting ...
      goto:END
    ) else (
      echo. Ok, I'll do my very best ...
    )
    set YesNo=
  ) else (
    echo. Found cygwin as !CygwinPath!, containing bash
  )
:: cd to Makefile dir
  call :_checkDir

:: find python
  :: in cygwin
  set CygwinPath >nul 2>&1
  if !errorlevel!==0 (
    if exist !CygwinPath!\bin\python.exe (
      set pybin=!CygwinPath!\bin\python.exe
      goto:GotPython
    )
  )
  :: in path
  %pybin% -V >nul 2>&1
  if %errorlevel%==0 (
    goto:GotPython
  )
  :: in assoc
  call :_errReset
  assoc .py >nul
  if %errorlevel%==0 (
    :: start knows about .py
    set pybin=""
    goto:GotPython
  )
  :: no python - giving up
  echo.
  echo. Could not find python in your environment - aborting ...
  set rc=2
  goto:END

:: start mini web server
  :GotPython
  if %pybin%=="" (
    set pcmd=%websrvPath%
  ) else (
    set pcmd=%pybin% %websrvPath%
  )
  echo. Starting mini web server
  if %DEBUG%==1 (
    start "Use Ctrl-Break to terminate" %pcmd%
  ) else (
    start "Use Ctrl-Break to terminate" /b %pcmd% >nul 2>&1
  )
  echo. Waiting a few seconds for the web server
  :CheckWeb
  call :_checkWebServer
  if not !CheckWebServer!==1 (
    echo. Problems starting web server; aborting ...
    echo. Try invoking "python %websrvPath%". If that works,
    echo. open the URL %adminUrl%?cygwin=!CgwinPath! in your web browser.
    goto:END
  )
:: load admin url in browser
  echo. Launching admin url in browser
  start %adminUrl%?cygwin=!CygwinPath!
:: clean-up
  :END
  popd
  endlocal
  call :_shutdown
  exit /b %rc%

:_dot
  setlocal
  <nul (set/p xxx=%1)
  endlocal
  cmd /c exit /b 0
  goto:EOF

:_sleep
  setlocal
  ping -n %1 127.0.0.1 >nul
  endlocal
  goto:EOF

:_sleepDot
  setlocal
  for /l %%Y in (1,1,%1) do (
    call :_sleep 1
    call :_dot "."
  )
  call :_errReset
  echo.
  endlocal
  goto:EOF

:_errReset
  cmd /c exit /b 0
  goto:EOF

:_shutdown
  setlocal
  rem taskkill /f /im python.exe
  rem tasklist /fi "imagename eq python.exe"
  rem TODO: if you call this script on an existing shell, and you dont use
  ::  use ctrl-break, the python process will continue to run
  echo. Press Ctrl-Break^<RET^> to terminate this script ...
  pause >nul
  endlocal
  goto:EOF

:_SearchDir
  rem Searches directories from %1 ending in %2 and returns the path found, but
  rem only if a subdir of %3 exists (as a further criterion)
  setlocal
  set root=%1
  set dir=%2
  set subdir=%3
  rem echo. IN SUBROUTINE: %1
  for /r %root%\ /d %%G in (*%dir%) do (
    call :_dot "."
    if exist "%%G\%subdir%" (
      set myfound=%%G
      goto:f1SD
    ) 
  )
  :f1SD
  endlocal & set _SearchDirFound=%myfound%
  goto:EOF

:_searchCygwin
  rem Trying to locate a cygwin installation on the machine, using bash.exe
  rem as an criterion
  setlocal
  set dir=cygwin
  set test=bin\bash.exe
  call :_dot " ."

  :: try likely paths
  for %%L in (%ProgramFiles% %HOMEDRIVE% %SystemDrive%) do (
    call :_dot "."
    if exist "%%L\%dir%\%test%" (
      set myfound="%%L\%dir%"
      goto:f1End
    )
  )

  :: prompt user
  echo.
  echo. I cannot find a cygwin in the default locations. I can further search for it.
  echo. Can you provide the path to your cygwin installation? (If not, just hit Return
  echo. and I will continue to search).
  call :_readAndCheckCygwin
  set CygwinPath >nul 2>&1
  if !errorlevel!==0 (
    :: just to set myfound
    set myfound=!CygwinPath!
    goto:f1End
  ) else (
    :: prompt for confirmation before searching
    echo. Shall I do an exhaustive search for cygwin?
    call :_yesNo
    if !YesNo!==0 (
      goto:f1End
    ) else (
      echo. Ok, I'll continue searching ...
    )
  )

  :: do an exhaustive search of some paths
  rem for /f %%L in (admin\bin\drives.txt) do (
  for %%L in (%ProgramFiles% %HOMEDRIVE% %SystemDrive% c: d: e:) do (
    call :_dot "."
    call :_SearchDir "%%L" "%dir%" "%test%"
    set _SearchDirFound >nul 2>&1
    if !errorlevel!==0 (
      set myfound="!_SearchDirFound!"
      set _SearchDirFound=
      goto:f1End
    )
  )
  :f1End
  echo.
  endlocal & set CygwinPath=%myfound%
  goto:EOF

:_readAndCheckCygwin
  setlocal
  set/p cpath=Enter path to cygwin (quote paths with blanks): 
  if exist %cpath%\bin\bash.exe (
    set myfound=%cpath%
  ) else (
    echo. Sorry, but this doesn't look like a proper cygwin installation
  )
  endlocal & set CygwinPath=%myfound%
  goto:EOF

:_yesNo
  setlocal
  set/p answ=(Please enter [y]/n:) 
  if "%answ%"=="n" (
    set myfound=0
  ) else if "%answ%"=="N" (
    set myfound=0
  ) else (
    set myfound=1
  )
  endlocal & set YesNo=%myfound%
  goto:EOF

:_checkDir
  setlocal
  if not exist "Makefile" (
    echo. Changing directory
    pushd ..\..
    if not exist "Makefile" (
        echo. Looks like the wrong directory _no Makefile_ - aborting ...
        set rc=1
        goto:END
    )
  )
  endlocal
  goto:EOF

:_checkWebServer
  setlocal
  :: meth=0 no testing, just wait and return success
  :: meth=1 use telnet for testing
  :: meth=2 use wget for testing
  set useWait=0
  set myfound=0

  :: find a way to check the web server
  set CygwinPath >nul 2>&1
  if not !errorlevel!==0 (
    :: no cygwin
    set meth=0
  ) else (
    if exist !CygwinPath!\bin\wget.* (
      set meth=2
      :: the next is fragile, taking the first entry found for wget.*
      for /f %%F in ('dir /b !CygwinPath!\bin\wget.*') do (
        set wgetBin=%%F
        goto:f3End
      )
    ) else if exist !CygwinPath!\bin\telnet.exe (
      set meth=1
    ) else (
      set meth=0
    )
  )
  :f3End
  :: apply appropriate method
  if !meth!==0 (
    :: just sleep
    call :_sleepDot %WebSvrWait%
    :: since we do not really test, let's hope it is running
    set myfound=1
  ) else (
    :: do proper testing
    for /l %%H in (1,1,%WebSvrWait%) do (
      call :_testWeb %meth%
      if !TestWeb!==0 (
        :: there is a web connection
        set myfound=1
        goto:_webSvrFound
      ) else (
        call :_dot "."
        call :_sleep 1
      )
    )
  )

  :_webSvrFound
  echo.
  endlocal & set CheckWebServer=%myfound%
  goto:EOF

:_testWeb
  setlocal
  set meth=%1
  if !meth!==1 (
  ::telnet
    rem echo. Using TELNET
    echo "GET /" | !CygwinPath!\bin\telnet.exe 127.0.0.1 8000 >%tmpFile% 2>&1
    call :_errReset
    find /i "Connection refused" %tmpFile% >nul
    if not !errorlevel!==0 (
      :: connection
      set myfound=0
    ) else (
      set myfound=1
    )
  ) else if !meth!==2 (
  :: wget
    rem echo. Using WGET
    call :_errReset
    :: the file extension differs (between .exe and .xxx)
    !CygwinPath!\bin\!wgetBin! --spider --quiet %testUrl%
    if !errorlevel!==0 (
      :: connection
      set myfound=0
    ) else (
      set myfound=1
    )
  ) else (
    echo. Internal Error:_testWeb:unknown method !meth!
    set myfound=-1
  )
  endlocal & set TestWeb=%myfound%
  goto:EOF

:EOF
