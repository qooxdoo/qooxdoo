#!/usr/bin/env python
# -*- coding: utf-8 -*-
r"""A JSON syntax validator and formatter tool.

Requires demjson module.

"""
__author__ = "Deron Meranda <http://deron.meranda.us/>"
__date__ = "2011-04-01"
__version__ = "1.6"
__credits__ = """Copyright (c) 2006-2011 Deron E. Meranda <http://deron.meranda.us/>

Licensed under GNU LGPL (GNU Lesser General Public License) version 3.0
or later.  See LICENSE.txt included with this software.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
or <http://www.fsf.org/licensing/>.

"""


import sys

try:
    import demjson
except ImportError:
    sys.stderr.write("Can not import the demjson Python module.\n")
    sys.stderr.write("Try running:  easy_install demjson\n")
    sys.exit(1)



def lintcheck_data( jsondata, verbose=False, strict=True, reformat=False, input_encoding=None, output_encoding=None, escape_unicode=True, pfx='' ):
    success = False
    try:
        data = demjson.decode(jsondata, strict=strict, encoding=input_encoding)
    except demjson.JSONError, err:
        success = False
        if verbose:
            sys.stderr.write('%s%s\n' % (pfx, err.pretty_description()) )
    except UnicodeDecodeError, err:
        success = False
        if verbose:
            sys.stderr.write('%sFile is not text: %s\n' % (pfx, str(err) ))
    else:
        success = True
        if reformat == 'compactly':
            newjson = demjson.encode(data, compactly=True, encoding=output_encoding, escape_unicode=escape_unicode)
            sys.stdout.write(newjson)
        elif reformat:
            newjson = demjson.encode(data, compactly=False, encoding=output_encoding, escape_unicode=escape_unicode)
            sys.stdout.write(newjson)
            sys.stdout.write('\n')
	elif verbose:
            sys.stdout.write('%sok\n' % pfx)
    return success


def lintcheck( filename, verbose=False, strict=True, reformat=False, input_encoding=None, output_encoding=None, escape_unicode=True ):
    pfx = '%s: ' % filename
    try:
        fp = open( filename, 'rb' )
        jsondata = fp.read()
        fp.close()
    except IOError, err:
        sys.stderr.write('%s: %s\n' % (pfx, str(err)) )
        return False
    return lintcheck_data( jsondata, verbose=verbose, strict=strict, reformat=reformat,
                           input_encoding=input_encoding, output_encoding=output_encoding,
                           escape_unicode=escape_unicode, pfx=pfx )


main_usage = """Usage: jsonlint [-v] [-s|-S] [-f|-F] [-e codec] inputfile.json ...

There is NO OUTPUT by default. Use -v to see any warning details.

The return status will be 0 if the file is conforming JSON (per the
RFC 4627 specification), or non-zero otherwise.

Options are:
 -v | --verbose    Show details of lint checking
 -s | --strict     Be strict in what is considered conforming JSON (the default)
 -S | --nonstrict  Be loose in what is considered conforming JSON

 -f | --format     Reformat the JSON text (if conforming) to stdout
 -F | --format-compactly
        Reformat the JSON simlar to -f, but do so compactly by
        removing all unnecessary whitespace

 -e codec | --encoding=codec
 --input-encoding=codec
 --output-encoding=codec
         Set the input and output character encoding codec (e.g.,
         ascii, utf8, utf-16).  The -e will set both the input and
         output encodings to the same thing.  If not supplied, the
         input encoding is guessed according to the JSON
         specification.  The output encoding defaults to UTF-8, and is
         used when reformatting (via the -f or -F options).

When reformatting, all members of objects (associative arrays) are
always output in lexigraphical sort order.  The default output codec
is UTF-8, unless the -e option is provided.  Any Unicode characters
will be output as literal characters if the encoding permits,
otherwise they will be \u-escaped.  You can use "-e ascii" to force
all Unicode characters to be escaped.

Use 'jsonlint --version' to see versioning information.
Use 'jsonlint --copyright' to see author and copyright details.'

"""

def main( args ):
    import getopt
    success = True
    verbose = False
    strict = True
    reformat = False
    input_encoding = None
    output_encoding = 'utf-8'
    escape_unicode = False

    try:
        opts, args = getopt.getopt( args,
                                    'vfFe:sS',
                                    ['verbose',
                                     'format','format-compactly',
                                     'strict','nonstrict',
                                     'encoding=',
                                     'input-encoding=','output-encoding=',
                                     'help','version','copyright'] )
    except getopt.GetoptError:
        sys.stderr.write( main_usage )
        return 1
    for opt, val in opts:
        if opt in ('-h', '--help'):
            sys.stdout.write( main_usage )
            return 0
        elif opt == '--version':
            sys.stdout.write( 'jsonlint version %s (%s)\n' % (__version__, __date__) )
            sys.stdout.write( 'demjson version %s (%s)\n' % (demjson.__version__, demjson.__date__)  )
            return 0
        elif opt == '--copyright':
            sys.stdout.write( 'jsonlint is distributed as part of the "demjson" python package.\n\n' )
            sys.stdout.write( __credits__ )
            return 0
        elif opt in ('-v', '--verbose'):
            verbose = True
        elif opt in ('-s', '--strict'):
            strict = True
        elif opt in ('-S', '--nonstrict'):
            strict = False
        elif opt in ('-f', '--format'):
            reformat = True
        elif opt in ('-F', '--format-compactly'):
            reformat = 'compactly'
        elif opt in ('-e','--encoding'):
            input_encoding = val
            output_encoding = val
            escape_unicode = False
        elif opt in ('--output-encoding'):
            output_encoding = val
            escape_unicode = False
        elif opt in ('--input-encoding'):
            input_encoding = val
        else:
            sys.stderr.write('Unknown option %r\n' % opt)
            return 1
            
    if args:
        for fn in args:
            if not lintcheck( fn, verbose=verbose, reformat=reformat,
                              strict=strict,
                              input_encoding=input_encoding,
                              output_encoding=output_encoding,
                              escape_unicode=escape_unicode ):
                success = False
    else:
        jsondata = sys.stdin.read()
        if not lintcheck_data( jsondata, verbose=verbose, reformat=reformat,
                               strict=strict,
                               input_encoding=input_encoding,
                               output_encoding=output_encoding,
                               escape_unicode=escape_unicode,
                               pfx='<stdin>: ' ):
            success = False

    if not success:
        return 1
    return 0


if __name__ == '__main__':
    args = sys.argv[1:]
    rc = main( args )
    sys.exit(rc)
