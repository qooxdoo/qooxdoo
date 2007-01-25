import sys

"""
checks whether the locale string is correct.
"""

errormsg = """
****************************************************************************
  WARNING
----------------------------------------------------------------------------
  The locale '%(locale)s' is defind in APPLICATION_LOCALES but not '%(lang)s'!
  Please add '%(lang)s' to APPLICATION_LOCALES.

  If a locale with a territory code is set ('%(locale)s'), the corrsponding
  locale without territory code must be added as well ('%(lang)s').
****************************************************************************
"""

def main():
	line = sys.stdin.read()
	locales = line.split()
	for locale in locales:
		if locale.find("_") >= 0:
			lang = locale.split("_")[0]
			if not lang in locales:
				print errormsg % {"lang": lang, "locale": locale}
				sys.exit(1)
	sys.exit(0)
	
if __name__ == "__main__":
	main()