#!/usr/bin/env python

import re




def generate(options):
  print "  * Processing input data..."

  typeFloat = re.compile("^([0-9\-]+\.[0-9]+)$")
  typeNumber = re.compile("^([0-9\-])$")

  settingsStr = ""

  # If you change this, change this in qx.Settings and qx.OO, too.
  settingsStr += 'if(typeof qx==="undefined"){var qx={_UNDEFINED:"undefined",_LOADSTART:(new Date).valueOf()};}'

  if options.addNewLines:
    settingsStr += "\n"

  # If you change this, change this in qx.Settings, too.
  settingsStr += 'if(typeof qx.Settings===qx._UNDEFINED){qx.Settings={_userSettings:{},_defaultSettings:{}};}'

  if options.addNewLines:
    settingsStr += "\n"

  for setting in options.defineRuntimeSetting:
    settingSplit = setting.split(":")
    settingKey = settingSplit.pop(0)
    settingValue = ":".join(settingSplit)

    settingKeySplit = settingKey.split(".")
    settingKeyName = settingKeySplit.pop()
    settingKeySpace = ".".join(settingKeySplit)

    checkStr = 'if(typeof qx.Settings._userSettings["%s"]===qx._UNDEFINED){qx.Settings._userSettings["%s"]={};}' % (settingKeySpace, settingKeySpace)
    if not checkStr in settingsStr:
      settingsStr += checkStr

      if options.addNewLines:
        settingsStr += "\n"

    settingsStr += 'qx.Settings._userSettings["%s"]["%s"]=' % (settingKeySpace, settingKeyName)

    if settingValue == "false" or settingValue == "true" or typeFloat.match(settingValue) or typeNumber.match(settingValue):
      settingsStr += '%s' % settingValue

    else:
      settingsStr += '"%s"' % settingValue.replace("\"", "\\\"")

    settingsStr += ";"

    if options.addNewLines:
      settingsStr += "\n"

  return settingsStr