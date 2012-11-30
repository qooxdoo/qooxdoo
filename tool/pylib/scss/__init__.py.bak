#!/usr/bin/env python
#-*- coding: utf-8 -*-
"""
pyScss, a Scss compiler for Python

@author     German M. Bravo (Kronuz) <german.mb@gmail.com>
@version    1.1.4
@see        https://github.com/Kronuz/pyScss
@copyright  (c) 2012 German M. Bravo (Kronuz)
@license    MIT License
            http://www.opensource.org/licenses/mit-license.php

pyScss compiles Scss, a superset of CSS that is more powerful, elegant and
easier to maintain than plain-vanilla CSS. The library acts as a CSS source code
preprocesor which allows you to use variables, nested rules, mixins, andhave
inheritance of rules, all with a CSS-compatible syntax which the preprocessor
then compiles to standard CSS.

Scss, as an extension of CSS, helps keep large stylesheets well-organized. It
borrows concepts and functionality from projects such as OOCSS and other similar
frameworks like as Sass. It's build on top of the original PHP xCSS codebase
structure but it's been completely rewritten, many bugs have been fixed and it
has been extensively extended to support almost the full range of Sass' Scss
syntax and functionality.

Bits of code in pyScss come from various projects:
Compass:
    (c) 2009 Christopher M. Eppstein
    http://compass-style.org/
Sass:
    (c) 2006-2009 Hampton Catlin and Nathan Weizenbaum
    http://sass-lang.com/
xCSS:
    (c) 2010 Anton Pawlik
    http://xcss.antpaw.org/docs/

"""

from scss_meta import BUILD_INFO, PROJECT, VERSION, REVISION, URL, AUTHOR, AUTHOR_EMAIL, LICENSE

__project__ = PROJECT
__version__ = VERSION
__author__ = AUTHOR + ' <' + AUTHOR_EMAIL + '>'
__license__ = LICENSE


################################################################################
# Configuration:

import os
PROJECT_ROOT = os.path.normpath(os.path.dirname(os.path.abspath(__file__)))
# Sass @import load_paths:
LOAD_PATHS = os.path.join(PROJECT_ROOT, 'sass/frameworks/')
# Assets path, where new sprite files are created:
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static/')
# Assets path, where new sprite files are created:
ASSETS_ROOT = os.path.join(PROJECT_ROOT, 'static/assets/')
# Urls for the static and assets:
STATIC_URL = '/static/'
ASSETS_URL = '/static/assets/'
VERBOSITY = 1
DEBUG = 0

import logging
log = logging.getLogger(__name__)

try:
    import cPickle as pickle
except ImportError:
    import pickle
import re
import sys
import time
import textwrap
from collections import deque
try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO

################################################################################
# Load C acceleration modules
locate_blocks = None
Scanner = None
try:
    from _speedups import locate_blocks, Scanner, NoMoreTokens
except ImportError:
    print >>sys.stderr, "Scanning acceleration disabled (_speedups not found)!"
    pass

################################################################################

profiling = {}

# units and conversions
_units = ['em', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc', 'deg', 'rad'
          'grad', 'ms', 's', 'hz', 'khz', '%']
_zero_units = ['em', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc']  # units that can be zeroed
_units_weights = {
    'em': 10,
    'mm': 10,
    'ms': 10,
    'hz': 10,
    '%': 100,
}
_conv = {
    'size': {
        'em': 13.0,
        'px': 1.0
    },
    'length': {
        'mm':  1.0,
        'cm':  10.0,
        'in':  25.4,
        'pt':  25.4 / 72,
        'pc':  25.4 / 6
    },
    'time': {
        'ms':  1.0,
        's':   1000.0
    },
    'freq': {
        'hz':  1.0,
        'khz': 1000.0
    },
    'any': {
        '%': 1.0 / 100
    }
}
_conv_type = {}
_conv_factor = {}
for t, m in _conv.items():
    for k, f in m.items():
        _conv_type[k] = t
        _conv_factor[k] = f
del t, m, k, f

# color literals
_colors = {
    'aliceblue': '#f0f8ff',
    'antiquewhite': '#faebd7',
    'aqua': '#00ffff',
    'aquamarine': '#7fffd4',
    'azure': '#f0ffff',
    'beige': '#f5f5dc',
    'bisque': '#ffe4c4',
    'black': '#000000',
    'blanchedalmond': '#ffebcd',
    'blue': '#0000ff',
    'blueviolet': '#8a2be2',
    'brown': '#a52a2a',
    'burlywood': '#deb887',
    'cadetblue': '#5f9ea0',
    'chartreuse': '#7fff00',
    'chocolate': '#d2691e',
    'coral': '#ff7f50',
    'cornflowerblue': '#6495ed',
    'cornsilk': '#fff8dc',
    'crimson': '#dc143c',
    'cyan': '#00ffff',
    'darkblue': '#00008b',
    'darkcyan': '#008b8b',
    'darkgoldenrod': '#b8860b',
    'darkgray': '#a9a9a9',
    'darkgreen': '#006400',
    'darkkhaki': '#bdb76b',
    'darkmagenta': '#8b008b',
    'darkolivegreen': '#556b2f',
    'darkorange': '#ff8c00',
    'darkorchid': '#9932cc',
    'darkred': '#8b0000',
    'darksalmon': '#e9967a',
    'darkseagreen': '#8fbc8f',
    'darkslateblue': '#483d8b',
    'darkslategray': '#2f4f4f',
    'darkturquoise': '#00ced1',
    'darkviolet': '#9400d3',
    'deeppink': '#ff1493',
    'deepskyblue': '#00bfff',
    'dimgray': '#696969',
    'dodgerblue': '#1e90ff',
    'firebrick': '#b22222',
    'floralwhite': '#fffaf0',
    'forestgreen': '#228b22',
    'fuchsia': '#ff00ff',
    'gainsboro': '#dcdcdc',
    'ghostwhite': '#f8f8ff',
    'gold': '#ffd700',
    'goldenrod': '#daa520',
    'gray': '#808080',
    'green': '#008000',
    'greenyellow': '#adff2f',
    'honeydew': '#f0fff0',
    'hotpink': '#ff69b4',
    'indianred': '#cd5c5c',
    'indigo': '#4b0082',
    'ivory': '#fffff0',
    'khaki': '#f0e68c',
    'lavender': '#e6e6fa',
    'lavenderblush': '#fff0f5',
    'lawngreen': '#7cfc00',
    'lemonchiffon': '#fffacd',
    'lightblue': '#add8e6',
    'lightcoral': '#f08080',
    'lightcyan': '#e0ffff',
    'lightgoldenrodyellow': '#fafad2',
    'lightgreen': '#90ee90',
    'lightgrey': '#d3d3d3',
    'lightpink': '#ffb6c1',
    'lightsalmon': '#ffa07a',
    'lightseagreen': '#20b2aa',
    'lightskyblue': '#87cefa',
    'lightslategray': '#778899',
    'lightsteelblue': '#b0c4de',
    'lightyellow': '#ffffe0',
    'lime': '#00ff00',
    'limegreen': '#32cd32',
    'linen': '#faf0e6',
    'magenta': '#ff00ff',
    'maroon': '#800000',
    'mediumaquamarine': '#66cdaa',
    'mediumblue': '#0000cd',
    'mediumorchid': '#ba55d3',
    'mediumpurple': '#9370db',
    'mediumseagreen': '#3cb371',
    'mediumslateblue': '#7b68ee',
    'mediumspringgreen': '#00fa9a',
    'mediumturquoise': '#48d1cc',
    'mediumvioletred': '#c71585',
    'midnightblue': '#191970',
    'mintcream': '#f5fffa',
    'mistyrose': '#ffe4e1',
    'moccasin': '#ffe4b5',
    'navajowhite': '#ffdead',
    'navy': '#000080',
    'oldlace': '#fdf5e6',
    'olive': '#808000',
    'olivedrab': '#6b8e23',
    'orange': '#ffa500',
    'orangered': '#ff4500',
    'orchid': '#da70d6',
    'palegoldenrod': '#eee8aa',
    'palegreen': '#98fb98',
    'paleturquoise': '#afeeee',
    'palevioletred': '#db7093',
    'papayawhip': '#ffefd5',
    'peachpuff': '#ffdab9',
    'peru': '#cd853f',
    'pink': '#ffc0cb',
    'plum': '#dda0dd',
    'powderblue': '#b0e0e6',
    'purple': '#800080',
    'red': '#ff0000',
    'rosybrown': '#bc8f8f',
    'royalblue': '#4169e1',
    'saddlebrown': '#8b4513',
    'salmon': '#fa8072',
    'sandybrown': '#f4a460',
    'seagreen': '#2e8b57',
    'seashell': '#fff5ee',
    'sienna': '#a0522d',
    'silver': '#c0c0c0',
    'skyblue': '#87ceeb',
    'slateblue': '#6a5acd',
    'slategray': '#708090',
    'snow': '#fffafa',
    'springgreen': '#00ff7f',
    'steelblue': '#4682b4',
    'tan': '#d2b48c',
    'teal': '#008080',
    'thistle': '#d8bfd8',
    'tomato': '#ff6347',
    'turquoise': '#40e0d0',
    'violet': '#ee82ee',
    'wheat': '#f5deb3',
    'white': '#ffffff',
    'whitesmoke': '#f5f5f5',
    'yellow': '#ffff00',
    'yellowgreen': '#9acd32'
}

_safe_strings = {
    '^doubleslash^': '//',
    '^bigcopen^': '/*',
    '^bigcclose^': '*/',
    '^doubledot^': ':',
    '^semicolon^': ';',
    '^curlybracketopen^': '{',
    '^curlybracketclosed^': '}',
}
_reverse_safe_strings = dict((v, k) for k, v in _safe_strings.items())
_safe_strings_re = re.compile('|'.join(map(re.escape, _safe_strings)))
_reverse_safe_strings_re = re.compile('|'.join(map(re.escape, _reverse_safe_strings)))

_default_scss_files = {}  # Files to be compiled ({file: content, ...})

_default_scss_index = {0: '<unknown>:0'}

_default_scss_vars = {
    '$BUILD_INFO': BUILD_INFO,
    '$PROJECT': PROJECT,
    '$VERSION': VERSION,
    '$REVISION': REVISION,
    '$URL': URL,
    '$AUTHOR': AUTHOR,
    '$AUTHOR_EMAIL': AUTHOR_EMAIL,
    '$LICENSE': LICENSE,

    # unsafe chars will be hidden as vars
    '$__doubleslash': '//',
    '$__bigcopen': '/*',
    '$__bigcclose': '*/',
    '$__doubledot': ':',
    '$__semicolon': ';',
    '$__curlybracketopen': '{',
    '$__curlybracketclosed': '}',

    # shortcuts (it's "a hidden feature" for now)
    'bg:': 'background:',
    'bgc:': 'background-color:',
}

_default_scss_opts = {
    'verbosity': VERBOSITY,
    'compress': 1,
    'compress_short_colors': 1,  # Converts things like #RRGGBB to #RGB
    'compress_reverse_colors': 1,  # Gets the shortest name of all for colors
    'short_colors': 0,  # Converts things like #RRGGBB to #RGB
    'reverse_colors': 0,  # Gets the shortest name of all for colors
}

SEPARATOR = '\x00'
_nl_re = re.compile(r'\s*\n\s*', re.MULTILINE)
_nl_num_re = re.compile(r'\n.+' + SEPARATOR, re.MULTILINE)
_nl_num_nl_re = re.compile(r'\n.+' + SEPARATOR + r'\s*\n', re.MULTILINE)

_short_color_re = re.compile(r'(?<!\w)#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3\b', re.IGNORECASE)
_long_color_re = re.compile(r'(?<!\w)#([a-f0-9]){2}([a-f0-9]){2}([a-f0-9]){2}\b', re.IGNORECASE)
_reverse_colors = dict((v, k) for k, v in _colors.items())
for long_k, v in _colors.items():
    # Calculate the different possible representations of a color:
    short_k = _short_color_re.sub(r'#\1\2\3', v).lower()
    rgb_k = _long_color_re.sub(lambda m: 'rgb(%d, %d, %d)' % (int(m.group(1), 16), int(m.group(2), 16), int(m.group(3), 16)), v)
    rgba_k = _long_color_re.sub(lambda m: 'rgba(%d, %d, %d, 1)' % (int(m.group(1), 16), int(m.group(2), 16), int(m.group(3), 16)), v)
    # get the shortest of all to use it:
    k = min([short_k, long_k, rgb_k, rgba_k], key=len)
    _reverse_colors[long_k] = k
    _reverse_colors[short_k] = k
    _reverse_colors[rgb_k] = k
    _reverse_colors[rgba_k] = k
_reverse_colors_re = re.compile(r'(?<![-\w.#$])(' + '|'.join(map(re.escape, _reverse_colors)) + r')(?![-\w])', re.IGNORECASE)
_colors_re = re.compile(r'(?<![-\w.#$])(' + '|'.join(map(re.escape, _colors)) + r')(?![-\w])', re.IGNORECASE)

_expr_glob_re = re.compile(r'''
    \#\{(.*?)\}                   # Global Interpolation only
''', re.VERBOSE)

_ml_comment_re = re.compile(r'\/\*(.*?)\*\/', re.DOTALL)
_sl_comment_re = re.compile(r'(?<!\burl[(])(?<!\w{2}:)\/\/.*')
_zero_units_re = re.compile(r'\b0(' + '|'.join(map(re.escape, _zero_units)) + r')(?!\w)', re.IGNORECASE)
_zero_re = re.compile(r'\b0\.(?=\d)')

_escape_chars_re = re.compile(r'([^-a-zA-Z0-9_])')
_variable_re = re.compile('^\\$[-a-zA-Z0-9_]+$')
_interpolate_re = re.compile(r'(#\{\s*)?(\$[-\w]+)(?(1)\s*\})')
_spaces_re = re.compile(r'\s+')
_expand_rules_space_re = re.compile(r'\s*{')
_collapse_properties_space_re = re.compile(r'([:#])\s*{')
_undefined_re = re.compile('^(?:\\$[-a-zA-Z0-9_]+|undefined)$')

_strings_re = re.compile(r'([\'"]).*?\1')
_blocks_re = re.compile(r'[{},;()\'"\n]')

_prop_split_re = re.compile(r'[:=]')
_skip_word_re = re.compile(r'-?[_\w\s#.,:%]*$|[-_\w#.,:%]*$', re.MULTILINE)
_has_code_re = re.compile('''
    (?:^|(?<=[{;}]))            # the character just before it should be a '{', a ';' or a '}'
    \s*                         # ...followed by any number of spaces
    (?:
        (?:
            \+
        |
            @include
        |
            @warn
        |
            @mixin
        |
            @function
        |
            @if
        |
            @else
        |
            @for
        |
            @each
        )
        (?![^(:;}]*['"])
    |
        @import
    )
''', re.VERBOSE)

FUNCTIONS_CSS2 = 'attr counter counters url rgb rect'
## CSS3
FUNCTIONS_UNITS = 'calc min max cycle'  # http://www.w3.org/TR/css3-values/
FUNCTIONS_COLORS = 'rgba hsl hsla'  # http://www.w3.org/TR/css3-color/
FUNCTIONS_FONTS = 'local format'  # http://www.w3.org/TR/css3-fonts/
# http://www.w3.org/TR/css3-images
FUNCTIONS_IMAGES = 'image element linear-gradient radial-gradient '\
                   'repeating-linear-gradient repeating-radial-gradient'
# http://www.w3.org/TR/css3-2d-transforms/
FUNCTIONS_2D = 'matrix translate translateX translateY scale '\
               'scale scaleX scaleY rotate skew skewX skewY'
# http://www.w3.org/TR/css3-3d-transforms/
FUNCTIONS_3D = 'matrix3d translate3d translateZ scale3d scaleZ rotate3d '\
               'rotateX rotateY rotateZ perspective'
# http://www.w3.org/TR/css3-transitions/
FUNCTIONS_TRANSITIONS = 'cubic-bezier'
# http://www.w3.org/TR/css3-animations/
FUNCTIONS_ANIMATIONS = ''  # has 'from' and 'to' block selectors, but no new function
FUNCTIONS_FILTER = 'grayscale blur sepia saturate opacity brightness contrast hue-rotate invert'
FUNCTIONS_OTHERS = 'from to mask'
VENDORS = '-[^-]+-.+'

_css_functions_re = re.compile(r'^(%s)$' % (
    '|'.join(' '.join([
        FUNCTIONS_CSS2,
        FUNCTIONS_UNITS,
        FUNCTIONS_COLORS,
        FUNCTIONS_FONTS,
        FUNCTIONS_IMAGES,
        FUNCTIONS_2D,
        FUNCTIONS_3D,
        FUNCTIONS_TRANSITIONS,
        FUNCTIONS_ANIMATIONS,
        FUNCTIONS_FILTER,
        FUNCTIONS_OTHERS,
        VENDORS,
    ]).split())))

FILEID = 0
POSITION = 1
CODESTR = 2
DEPS = 3
CONTEXT = 4
OPTIONS = 5
SELECTORS = 6
PROPERTIES = 7
PATH = 8
INDEX = 9
LINENO = 10
FINAL = 11
MEDIA = 12
RULE_VARS = {
    'FILEID': FILEID,
    'POSITION': POSITION,
    'CODESTR': CODESTR,
    'DEPS': DEPS,
    'CONTEXT': CONTEXT,
    'OPTIONS': OPTIONS,
    'SELECTORS': SELECTORS,
    'PROPERTIES': PROPERTIES,
    'PATH': PATH,
    'INDEX': INDEX,
    'LINENO': LINENO,
    'FINAL': FINAL,
    'MEDIA': MEDIA,
}


def spawn_rule(rule=None, **kwargs):
    if rule is None:
        rule = [None] * len(RULE_VARS)
        rule[DEPS] = set()
        rule[SELECTORS] = ''
        rule[PROPERTIES] = []
        rule[PATH] = './'
        rule[INDEX] = {0: '<unknown>'}
        rule[LINENO] = 0
        rule[FINAL] = False
    else:
        rule = list(rule)
    for k, v in kwargs.items():
        rule[RULE_VARS[k.upper()]] = v
    return rule


def print_timing(level=0):
    def _print_timing(func):
        if VERBOSITY:
            def wrapper(*arg):
                if VERBOSITY >= level:
                    t1 = time.time()
                    res = func(*arg)
                    t2 = time.time()
                    profiling.setdefault(func.func_name, 0)
                    profiling[func.func_name] += (t2 - t1)
                    return res
                else:
                    return func(*arg)
            return wrapper
        else:
            return func
    return _print_timing


# Profiler decorator
# import pstats
# import cProfile
# def profile(fn):
#     def wrapper(*args, **kwargs):
#         profiler = cProfile.Profile()
#         stream = StringIO()
#         profiler.enable()
#         try:
#             res = fn(*args, **kwargs)
#         finally:
#             profiler.disable()
#             stats = pstats.Stats(profiler, stream=stream)
#             stats.sort_stats('time')
#             print >>stream, ""
#             print >>stream, "=" * 100
#             print >>stream, "Stats:"
#             stats.print_stats()
#             print >>stream, "=" * 100
#             print >>stream, "Callers:"
#             stats.print_callers()
#             print >>stream, "=" * 100
#             print >>stream, "Callees:"
#             stats.print_callees()
#             print >>sys.stderr, stream.getvalue()
#             stream.close()
#         return res
#     return wrapper


def split_params(params):
    params = params.split(',') or []
    if params:
        final_params = []
        param = params.pop(0)
        try:
            while True:
                while param.count('(') != param.count(')'):
                    try:
                        param = param + ',' + params.pop(0)
                    except IndexError:
                        break
                final_params.append(param)
                param = params.pop(0)
        except IndexError:
            pass
        params = final_params
    return params


def dequote(s):
    if s and s[0] in ('"', "'") and s[-1] == s[0]:
        s = s[1:-1]
        s = unescape(s)
    return s


def depar(s):
    while s and s[0] == '(' and s[-1] == ')':
        s = s[1:-1]
    return s


################################################################################
# Scanner

if locate_blocks is None:
    def _strip_selprop(selprop, lineno):
        # Get the line number of the selector or property and strip all other
        # line numbers that might still be there (from multiline selectors)
        _lineno, _sep, selprop = selprop.partition(SEPARATOR)
        if _sep == SEPARATOR:
            _lineno = _lineno.strip(' \t\n;')
            try:
                lineno = int(_lineno)
            except ValueError:
                pass
        else:
            selprop = _lineno
        selprop = _nl_num_re.sub('\n', selprop)
        selprop = selprop.strip()
        return selprop, lineno

    def _strip(selprop):
        # Strip all line numbers, ignoring them in the way
        selprop, _ = _strip_selprop(selprop, None)
        return selprop

    def locate_blocks(codestr):
        """
        For processing CSS like strings.

        Either returns all selectors (that can be "smart" multi-lined, as
        long as it's joined by `,`, or enclosed in `(` and `)`) with its code block
        (the one between `{` and `}`, which can be nested), or the "lose" code
        (properties) that doesn't have any blocks.

        threshold is the number of blank lines before selectors are broken into
        pieces (properties).
        """
        lineno = 0

        par = 0
        instr = None
        depth = 0
        skip = False
        thin = None
        i = init = safe = lose = 0
        start = end = None

        for m in _blocks_re.finditer(codestr):
            i = m.start(0)
            c = codestr[i]
            if instr is not None:
                if c == instr:
                    instr = None  # A string ends (FIXME: needs to accept escaped characters)
            elif c in ('"', "'"):
                instr = c  # A string starts
            elif c == '(':  # parenthesis begins:
                par += 1
                thin = None
                safe = i + 1
            elif c == ')':  # parenthesis ends:
                par -= 1
            elif not par and not instr:
                if c == '{':  # block begins:
                    if depth == 0:
                        if i > 0 and codestr[i - 1] == '#':  # Do not process #{...} as blocks!
                            skip = True
                        else:
                            start = i
                            if thin is not None and _strip(codestr[thin:i]):
                                init = thin
                            if lose < init:
                                _property, lineno = _strip_selprop(codestr[lose:init], lineno)
                                if _property:
                                    yield lineno, _property, None
                                lose = init
                            thin = None
                    depth += 1
                elif c == '}':  # block ends:
                    if depth > 0:
                        depth -= 1
                        if depth == 0:
                            if not skip:
                                end = i
                                _selectors, lineno = _strip_selprop(codestr[init:start], lineno)
                                _codestr = codestr[start + 1:end].strip()
                                if _selectors:
                                    yield lineno, _selectors, _codestr
                                init = safe = lose = end + 1
                                thin = None
                            skip = False
                elif depth == 0:
                    if c == ';':  # End of property (or block):
                        init = i
                        if lose < init:
                            _property, lineno = _strip_selprop(codestr[lose:init], lineno)
                            if _property:
                                yield lineno, _property, None
                            init = safe = lose = i + 1
                        thin = None
                    elif c == ',':
                        if thin is not None and _strip(codestr[thin:i]):
                            init = thin
                        thin = None
                        safe = i + 1
                    elif c == '\n':
                        if thin is not None and _strip(codestr[thin:i]):
                            init = thin
                            thin = i + 1
                        elif thin is None and _strip(codestr[safe:i]):
                            thin = i + 1  # Step on thin ice, if it breaks, it breaks here
        if depth > 0:
            if not skip:
                _selectors, lineno = _strip_selprop(codestr[init:start], lineno)
                _codestr = codestr[start + 1:].strip()
                if _selectors:
                    yield lineno, _selectors, _codestr
                if par:
                    raise Exception("Missing closing parenthesis somewhere in block: '%s'" % _selectors)
                elif instr:
                    raise Exception("Missing closing string somewhere in block: '%s'" % _selectors)
                else:
                    raise Exception("Block never closed: '%s'" % _selectors)
        losestr = codestr[lose:]
        for _property in losestr.split(';'):
            _property, lineno = _strip_selprop(_property, lineno)
            if _property:
                yield lineno, _property, None


################################################################################


class Scss(object):
    # configuration:
    construct = 'self'

    def __init__(self, scss_vars=None, scss_opts=None, scss_files=None, super_selector=None):
        if super_selector:
            self.super_selector = super_selector + ' '
        else:
            self.super_selector = ''
        self._scss_vars = scss_vars
        self._scss_opts = scss_opts
        self._scss_files = scss_files
        self.reset()

    def get_scss_constants(self):
        scss_vars = self.scss_vars or {}
        return dict((k, v) for k, v in scss_vars.items() if k and (not k.startswith('$') or k.startswith('$') and k[1].isupper()))

    def get_scss_vars(self):
        scss_vars = self.scss_vars or {}
        return dict((k, v) for k, v in scss_vars.items() if k and not (not k.startswith('$') or k.startswith('$') and k[1].isupper()))

    def clean(self):
        self.children = deque()
        self.rules = []
        self._rules = {}
        self.parts = {}

    def reset(self, input_scss=None):
        if hasattr(CalculatorScanner, 'cleanup'):
            CalculatorScanner.cleanup()

        # Initialize
        self.css_files = []

        self.scss_vars = _default_scss_vars.copy()
        if self._scss_vars is not None:
            self.scss_vars.update(self._scss_vars)

        self.scss_opts = _default_scss_opts.copy()
        if self._scss_opts is not None:
            self.scss_opts.update(self._scss_opts)

        self.scss_files = {}
        self._scss_files_order = []
        for f, c in _default_scss_files.iteritems():
            if f not in self.scss_files:
                self._scss_files_order.append(f)
            self.scss_files[f] = c
        if self._scss_files is not None:
            for f, c in self._scss_files.iteritems():
                if f not in self.scss_files:
                    self._scss_files_order.append(f)
                self.scss_files[f] = c

        self._scss_index = _default_scss_index.copy()

        self._contexts = {}

        self.clean()

    #@profile
    @print_timing(2)
    def Compilation(self, scss_string=None, scss_file=None, super_selector=None):
        if super_selector:
            self.super_selector = super_selector + ' '
        if scss_string is not None:
            self._scss_files = {'<string %r>' % (scss_string.strip()[:50] + '...'): scss_string}
        elif scss_file is not None:
            self._scss_files = {scss_file: open(scss_file).read()}

        self.reset()

        # Compile
        for fileid in self._scss_files_order:
            codestr = self.scss_files[fileid]
            codestr = self.load_string(codestr, fileid)
            self.scss_files[fileid] = codestr
            rule = spawn_rule(fileid=fileid, codestr=codestr, context=self.scss_vars, options=self.scss_opts, index=self._scss_index)
            self.children.append(rule)

        # this will manage rule: child objects inside of a node
        self.parse_children()

        # this will manage rule: ' extends '
        self.parse_extends()

        # this will manage the order of the rules
        self.manage_order()

        self.parse_properties()

        all_rules = 0
        all_selectors = 0
        exceeded = ''
        final_cont = ''
        for fileid in self.css_files:
            fcont, total_rules, total_selectors = self.create_css(fileid)
            all_rules += total_rules
            all_selectors += total_selectors
            if not exceeded and all_selectors > 4095:
                exceeded = " (IE exceeded!)"
                log.error("Maximum number of supported selectors in Internet Explorer (4095) exceeded!")
            if self.scss_opts.get('debug_info', False):
                if fileid.startswith('<string '):
                    final_cont += "/* %s, add to %s%s selectors generated */\n" % (total_selectors, all_selectors, exceeded)
                else:
                    final_cont += "/* %s, add to %s%s selectors generated from '%s' */\n" % (total_selectors, all_selectors, exceeded, fileid)
            final_cont += fcont

        final_cont = self.post_process(final_cont)

        return final_cont
    compile = Compilation

    def load_string(self, codestr, filename=None):
        if filename is not None:
            codestr += '\n'

            idx = {
                'next_id': len(self._scss_index),
                'line': 1,
            }

            def _cnt(m):
                idx['line'] += 1
                lineno = '%s:%d' % (filename, idx['line'])
                next_id = idx['next_id']
                self._scss_index[next_id] = lineno
                idx['next_id'] += 1
                return '\n' + str(next_id) + SEPARATOR
            lineno = '%s:%d' % (filename, idx['line'])
            next_id = idx['next_id']
            self._scss_index[next_id] = lineno
            codestr = str(next_id) + SEPARATOR + _nl_re.sub(_cnt, codestr)

        # remove empty lines
        codestr = _nl_num_nl_re.sub('\n', codestr)

        # protects codestr: "..." strings
        codestr = _strings_re.sub(lambda m: _reverse_safe_strings_re.sub(lambda n: _reverse_safe_strings[n.group(0)], m.group(0)), codestr)

        # removes multiple line comments
        codestr = _ml_comment_re.sub('', codestr)

        # removes inline comments, but not :// (protocol)
        codestr = _sl_comment_re.sub('', codestr)

        codestr = _safe_strings_re.sub(lambda m: _safe_strings[m.group(0)], codestr)

        # expand the space in rules
        codestr = _expand_rules_space_re.sub(' {', codestr)

        # collapse the space in properties blocks
        codestr = _collapse_properties_space_re.sub(r'\1{', codestr)

        # to do math operations, we need to get the color's hex values (for color names):
        def _pp(m):
            v = m.group(0)
            return _colors.get(v, v)
        codestr = _colors_re.sub(_pp, codestr)

        return codestr

    def longest_common_prefix(self, seq1, seq2):
        start = 0
        common = 0
        length = min(len(seq1), len(seq2))
        while start < length:
            if seq1[start] != seq2[start]:
                break
            if seq1[start] == ' ':
                common = start + 1
            elif seq1[start] in ('#', ':', '.'):
                common = start
            start += 1
        return common

    def longest_common_suffix(self, seq1, seq2):
        seq1, seq2 = seq1[::-1], seq2[::-1]
        start = 0
        common = 0
        length = min(len(seq1), len(seq2))
        while start < length:
            if seq1[start] != seq2[start]:
                break
            if seq1[start] == ' ':
                common = start + 1
            elif seq1[start] in ('#', ':', '.'):
                common = start + 1
            start += 1
        return common

    def normalize_selectors(self, _selectors, extra_selectors=None, extra_parents=None):
        """
        Normalizes or extends selectors in a string.
        An optional extra parameter that can be a list of extra selectors to be
        added to the final normalized selectors string.
        """
        # Fixe tabs and spaces in selectors
        _selectors = _spaces_re.sub(' ', _selectors)

        if isinstance(extra_selectors, basestring):
            extra_selectors = extra_selectors.split(',')

        if isinstance(extra_parents, basestring):
            extra_parents = extra_parents.split('&')

        parents = set()
        if ' extends ' in _selectors:
            selectors = set()
            for key in _selectors.split(','):
                child, _, parent = key.partition(' extends ')
                child = child.strip()
                parent = parent.strip()
                selectors.add(child)
                parents.update(s.strip() for s in parent.split('&') if s.strip())
        else:
            selectors = set(s.strip() for s in _selectors.split(',') if s.strip())
        if extra_selectors:
            selectors.update(s.strip() for s in extra_selectors if s.strip())
        selectors.discard('')
        if not selectors:
            return ''
        if extra_parents:
            parents.update(s.strip() for s in extra_parents if s.strip())
        parents.discard('')
        if parents:
            return ','.join(sorted(selectors)) + ' extends ' + '&'.join(sorted(parents))
        return ','.join(sorted(selectors))

    def apply_vars(self, cont, context, options=None, rule=None, _dequote=False):
        if isinstance(cont, basestring) and '$' in cont:
            if cont in context:
                # Optimization: the full cont is a variable in the context,
                # flatten the interpolation and use it:
                while isinstance(cont, basestring) and cont in context:
                    _cont = context[cont]
                    if _cont == cont:
                        break
                    cont = _cont
            else:
                # Flatten the context (no variables mapping to variables)
                flat_context = {}
                for k, v in context.items():
                    while isinstance(v, basestring) and v in context:
                        _v = context[v]
                        if _v == v:
                            break
                        v = _v
                    flat_context[k] = v

                # Interpolate variables:
                def _av(m):
                    v = flat_context.get(m.group(2))
                    if v:
                        v = to_str(v)
                        if _dequote and m.group(1):
                            v = dequote(v)
                    elif v is not None:
                        v = to_str(v)
                    else:
                        v = m.group(0)
                    return v

                cont = _interpolate_re.sub(_av, cont)
        if options is not None:
            # ...apply math:
            cont = self.do_glob_math(cont, context, options, rule, _dequote)
        return cont

    @print_timing(3)
    def parse_children(self):
        pos = 0
        while True:
            try:
                rule = self.children.popleft()
            except:
                break
            # Check if the block has nested blocks and work it out:
            _selectors, _, _parents = rule[SELECTORS].partition(' extends ')
            _selectors = _selectors.split(',')
            _parents = set(_parents.split('&'))
            _parents.discard('')

            # manage children or expand children:
            _children = deque()
            self.manage_children(rule, _selectors, _parents, _children, None, rule[MEDIA])
            self.children.extendleft(_children)

            # prepare maps:
            if _parents:
                rule[SELECTORS] = ','.join(_selectors) + ' extends ' + '&'.join(_parents)
            rule[POSITION] = pos
            selectors = rule[SELECTORS]
            self.parts.setdefault(selectors, [])
            self.parts[selectors].append(rule)
            self.rules.append(rule)
            pos += 1

            #print >>sys.stderr, '='*80
            #for r in [rule]+list(self.children)[:5]: print >>sys.stderr, repr(r[POSITION]), repr(r[SELECTORS]), repr(r[CODESTR][:80]+('...' if len(r[CODESTR])>80 else ''))
            #for r in [rule]+list(self.children)[:5]: print >>sys.stderr, repr(r[POSITION]), repr(r[SELECTORS]), repr(r[CODESTR][:80]+('...' if len(r[CODESTR])>80 else '')), dict((k, v) for k, v in r[CONTEXT].items() if k.startswith('$') and not k.startswith('$__')), dict(r[PROPERTIES]).keys()

    @print_timing(4)
    def manage_children(self, rule, p_selectors, p_parents, p_children, scope, media):
        for c_lineno, c_property, c_codestr in locate_blocks(rule[CODESTR]):
            if '@return' in rule[OPTIONS]:
                return
            # Rules preprocessing...
            if c_property.startswith('+'):  # expands a '+' at the beginning of a rule as @include
                c_property = '@include ' + c_property[1:]
                try:
                    if '(' not in c_property or c_property.index(':') < c_property.index('('):
                        c_property = c_property.replace(':', '(', 1)
                        if '(' in c_property:
                            c_property += ')'
                except ValueError:
                    pass
            elif c_property.startswith('='):  # expands a '=' at the beginning of a rule as @mixin
                c_property = '@mixin' + c_property[1:]
            elif c_property == '@prototype ':  # Remove '@prototype '
                c_property = c_property[11:]
            ####################################################################
            if c_property.startswith('@'):
                code, name = (c_property.split(None, 1) + [''])[:2]
                code = code.lower()
                if code == '@warn':
                    name = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
                    log.warn(dequote(to_str(name)))
                elif code == '@print':
                    name = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
                    print >>sys.stderr, dequote(to_str(name))
                elif code == '@raw':
                    name = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
                    print >>sys.stderr, repr(name)
                elif code == '@dump_context':
                    log.info(repr(rule[CONTEXT]))
                elif code == '@dump_options':
                    log.info(repr(rule[OPTIONS]))
                elif code == '@debug':
                    global DEBUG
                    name = name.strip()
                    if name.lower() in ('1', 'true', 't', 'yes', 'y', 'on'):
                        name = 1
                    elif name.lower() in ('0', 'false', 'f', 'no', 'n', 'off', 'undefined'):
                        name = 0
                    DEBUG = name
                    log.info("Debug mode is %s", 'On' if DEBUG else 'Off')
                elif code == '@option':
                    self._settle_options(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif code == '@content':
                    self._do_content(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif code == '@import':
                    self._do_import(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif code == '@extend':
                    name = self.apply_vars(name, rule[CONTEXT], rule[OPTIONS], rule)
                    p_parents.update(p.strip() for p in name.replace(',', '&').split('&'))
                    p_parents.discard('')
                elif c_codestr is not None and code in ('@mixin', '@function'):
                    self._do_functions(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif code == '@return':
                    ret = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
                    rule[OPTIONS]['@return'] = ret
                elif code == '@include':
                    self._do_include(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif c_codestr is not None and (code == '@if' or c_property.startswith('@else if ')):
                    self._do_if(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif c_codestr is not None and code == '@else':
                    self._do_else(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif c_codestr is not None and code == '@for':
                    self._do_for(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif c_codestr is not None and code == '@each':
                    self._do_each(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                # elif c_codestr is not None and code == '@while':
                #     self._do_while(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                elif c_codestr is not None and code in ('@variables', '@vars'):
                    self._get_variables(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr)
                elif c_codestr is not None and code == '@media':
                    _media = (media or []) + [name]
                    rule[CODESTR] = self.construct + ' {' + c_codestr + '}'
                    self.manage_children(rule, p_selectors, p_parents, p_children, scope, _media)
                elif c_codestr is None:
                    rule[PROPERTIES].append((c_lineno, c_property, None))
                elif scope is None:  # needs to have no scope to crawl down the nested rules
                    self._nest_rules(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr)
            ####################################################################
            # Properties
            elif c_codestr is None:
                self._get_properties(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr)
            # Nested properties
            elif c_property.endswith(':'):
                rule[CODESTR] = c_codestr
                self.manage_children(rule, p_selectors, p_parents, p_children, (scope or '') + c_property[:-1] + '-', media)
            ####################################################################
            # Nested rules
            elif scope is None:  # needs to have no scope to crawl down the nested rules
                self._nest_rules(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr)

    @print_timing(10)
    def _settle_options(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        for option in name.split(','):
            option, value = (option.split(':', 1) + [''])[:2]
            option = option.strip().lower()
            value = value.strip()
            if option:
                if value.lower() in ('1', 'true', 't', 'yes', 'y', 'on'):
                    value = 1
                elif value.lower() in ('0', 'false', 'f', 'no', 'n', 'off', 'undefined'):
                    value = 0
                rule[OPTIONS][option] = value

    @print_timing(10)
    def _do_functions(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @mixin and @function
        """
        if name:
            funct, params, _ = name.partition('(')
            funct = funct.strip()
            params = split_params(depar(params + _))
            defaults = {}
            new_params = []
            for param in params:
                param, _, default = param.partition(':')
                param = param.strip()
                default = default.strip()
                if param:
                    new_params.append(param)
                    if default:
                        default = self.apply_vars(default, rule[CONTEXT], None, rule)
                        defaults[param] = default
            context = rule[CONTEXT].copy()
            for p in new_params:
                context.pop(p, None)
            mixin = [list(new_params), defaults, self.apply_vars(c_codestr, context, None, rule)]
            if code == '@function':
                def _call(mixin):
                    def __call(R, *args, **kwargs):
                        m_params = mixin[0]
                        m_vars = rule[CONTEXT].copy()
                        m_vars.update(mixin[1])
                        m_codestr = mixin[2]
                        for i, a in enumerate(args):
                            m_vars[m_params[i]] = a
                        m_vars.update(kwargs)
                        _options = rule[OPTIONS].copy()
                        _rule = spawn_rule(R, codestr=m_codestr, context=m_vars, options=_options, deps=set(), properties=[], final=False, lineno=c_lineno)
                        self.manage_children(_rule, p_selectors, p_parents, p_children, (scope or '') + '', R[MEDIA])
                        ret = _rule[OPTIONS].pop('@return', '')
                        return ret
                    return __call
                _mixin = _call(mixin)
                _mixin.mixin = mixin
                mixin = _mixin
            # Insert as many @mixin options as the default parameters:
            while len(new_params):
                rule[OPTIONS]['%s %s:%d' % (code, funct, len(new_params))] = mixin
                param = new_params.pop()
                if param not in defaults:
                    break
            if not new_params:
                rule[OPTIONS][code + ' ' + funct + ':0'] = mixin

    @print_timing(10)
    def _do_include(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @include, for @mixins
        """
        funct, params, _ = name.partition('(')
        funct = funct.strip()
        funct = self.do_glob_math(funct, rule[CONTEXT], rule[OPTIONS], rule, True)
        params = split_params(depar(params + _))
        new_params = {}
        num_args = 0
        for param in params:
            varname, _, param = param.partition(':')
            if param:
                param = param.strip()
                varname = varname.strip()
            else:
                param = varname.strip()
                varname = num_args
                if param:
                    num_args += 1
            if param:
                new_params[varname] = param
        mixin = rule[OPTIONS].get('@mixin %s:%s' % (funct, num_args))
        if not mixin:
            # Fallback to single parmeter:
            mixin = rule[OPTIONS].get('@mixin %s:1' % (funct,))
            if mixin and all(map(lambda o: isinstance(o, int), new_params.keys())):
                new_params = {0: ', '.join(new_params.values())}
        if mixin:
            m_params = mixin[0]
            m_vars = mixin[1].copy()
            m_codestr = mixin[2]
            for varname, value in new_params.items():
                try:
                    m_param = m_params[varname]
                except:
                    m_param = varname
                value = self.calculate(value, rule[CONTEXT], rule[OPTIONS], rule)
                m_vars[m_param] = value
            for p in m_params:
                if p not in new_params:
                    if isinstance(m_vars[p], basestring):
                        value = self.calculate(m_vars[p], m_vars, rule[OPTIONS], rule)
                        m_vars[p] = value
            _context = rule[CONTEXT].copy()
            _context.update(m_vars)
            _rule = spawn_rule(rule, codestr=m_codestr, context=_context, lineno=c_lineno)
            _rule[OPTIONS]['@content'] = c_codestr
            self.manage_children(_rule, p_selectors, p_parents, p_children, scope, media)
        else:
            log.error("Required mixin not found: %s:%d (%s)", funct, num_args, rule[INDEX][rule[LINENO]])

    @print_timing(10)
    def _do_content(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @content
        """
        if '@content' not in rule[OPTIONS]:
            log.error("Content string not found for @content (%s)", rule[INDEX][rule[LINENO]])
        c_codestr = rule[OPTIONS].pop('@content', '')
        rule[CODESTR] = c_codestr
        self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)

    @print_timing(10)
    def _do_import(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @import
        Load and import mixins and functions and rules
        """
        full_filename = None
        i_codestr = None
        if '..' not in name and '://' not in name and 'url(' not in name:  # Protect against going to prohibited places...
            names = name.split(',')
            for name in names:
                name = dequote(name.strip())
                if '@import ' + name not in rule[OPTIONS]:  # If already imported in this scope, skip...
                    unsupported = []
                    load_paths = []
                    try:
                        i_codestr = self.scss_files[name]
                    except KeyError:
                        filename = os.path.basename(name)
                        dirname = os.path.dirname(name)
                        i_codestr = None

                        # TODO: Convert global LOAD_PATHS to a list. Use it directly.
                        # Doing the above will break backwards compatibility!
                        if hasattr(LOAD_PATHS, 'split'):
                            load_path_list = LOAD_PATHS.split(',')  # Old style
                        else:
                            load_path_list = LOAD_PATHS  # New style

                        for path in ['./'] + load_path_list:
                            for basepath in ['./', os.path.dirname(rule[PATH])]:
                                i_codestr = None
                                full_path = os.path.realpath(os.path.join(path, basepath, dirname))
                                if full_path not in load_paths:
                                    try:
                                        full_filename = os.path.join(full_path, '_' + filename)
                                        i_codestr = open(full_filename + '.scss').read()
                                        full_filename += '.scss'
                                    except IOError:
                                        if os.path.exists(full_filename + '.sass'):
                                            unsupported.append(full_filename + '.sass')
                                        try:
                                            full_filename = os.path.join(full_path, filename)
                                            i_codestr = open(full_filename + '.scss').read()
                                            full_filename += '.scss'
                                        except IOError:
                                            if os.path.exists(full_filename + '.sass'):
                                                unsupported.append(full_filename + '.sass')
                                            try:
                                                full_filename = os.path.join(full_path, '_' + filename)
                                                i_codestr = open(full_filename).read()
                                            except IOError:
                                                try:
                                                    full_filename = os.path.join(full_path, filename)
                                                    i_codestr = open(full_filename).read()
                                                except IOError:
                                                    pass
                                    if i_codestr is not None:
                                        break
                                    else:
                                        load_paths.append(full_path)
                            if i_codestr is not None:
                                break
                        if i_codestr is None:
                            i_codestr = self._do_magic_import(rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name)
                        i_codestr = self.scss_files[name] = i_codestr and self.load_string(i_codestr, full_filename)
                        if name not in self.scss_files:
                            self._scss_files_order.append(name)
                    if i_codestr is None:
                        load_paths = load_paths and "\nLoad paths:\n\t%s" % "\n\t".join(load_paths) or ''
                        unsupported = unsupported and "\nPossible matches (for unsupported file format SASS):\n\t%s" % "\n\t".join(unsupported) or ''
                        log.warn("File to import not found or unreadable: '%s' (%s)%s%s", filename, rule[INDEX][rule[LINENO]], load_paths, unsupported)
                    else:
                        _rule = spawn_rule(rule, codestr=i_codestr, path=full_filename, lineno=c_lineno)
                        self.manage_children(_rule, p_selectors, p_parents, p_children, scope, media)
                        rule[OPTIONS]['@import ' + name] = True
        else:
            rule[PROPERTIES].append((c_lineno, c_property, None))

    @print_timing(10)
    def _do_magic_import(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @import for sprite-maps
        Imports magic sprite map directories
        """
        if callable(STATIC_ROOT):
            files = sorted(STATIC_ROOT(name))
        else:
            glob_path = os.path.join(STATIC_ROOT, name)
            files = glob.glob(glob_path)
            files = sorted((file[len(STATIC_ROOT):], None) for file in files)

        if files:
            # Build magic context
            map_name = os.path.normpath(os.path.dirname(name)).replace('\\', '_').replace('/', '_')
            kwargs = {}

            def setdefault(var, val):
                _var = '$' + map_name + '-' + var
                if _var in rule[CONTEXT]:
                    kwargs[var] = interpolate(rule[CONTEXT][_var], rule)
                else:
                    rule[CONTEXT][_var] = val
                    kwargs[var] = interpolate(val, rule)
                return rule[CONTEXT][_var]

            setdefault('sprite-base-class', StringValue('.' + map_name + '-sprite'))
            setdefault('sprite-dimensions', BooleanValue(False))
            position = setdefault('position', NumberValue(0, '%'))
            spacing = setdefault('spacing', NumberValue(0))
            repeat = setdefault('repeat', StringValue('no-repeat'))
            names = tuple(os.path.splitext(os.path.basename(file))[0] for file, storage in files)
            for n in names:
                setdefault(n + '-position', position)
                setdefault(n + '-spacing', spacing)
                setdefault(n + '-repeat', repeat)
            sprite_map = _sprite_map(name, **kwargs)
            rule[CONTEXT]['$' + map_name + '-' + 'sprites'] = sprite_map
            ret = '''
                @import "compass/utilities/sprites/base";

                // All sprites should extend this class
                // The %(map_name)s-sprite mixin will do so for you.
                #{$%(map_name)s-sprite-base-class} {
                    background: $%(map_name)s-sprites;
                }

                // Use this to set the dimensions of an element
                // based on the size of the original image.
                @mixin %(map_name)s-sprite-dimensions($name) {
                    @include sprite-dimensions($%(map_name)s-sprites, $name);
                }

                // Move the background position to display the sprite.
                @mixin %(map_name)s-sprite-position($name, $offset-x: 0, $offset-y: 0) {
                    @include sprite-position($%(map_name)s-sprites, $name, $offset-x, $offset-y);
                }

                // Extends the sprite base class and set the background position for the desired sprite.
                // It will also apply the image dimensions if $dimensions is true.
                @mixin %(map_name)s-sprite($name, $dimensions: $%(map_name)s-sprite-dimensions, $offset-x: 0, $offset-y: 0) {
                    @extend #{$%(map_name)s-sprite-base-class};
                    @include sprite($%(map_name)s-sprites, $name, $dimensions, $offset-x, $offset-y);
                }

                @mixin %(map_name)s-sprites($sprite-names, $dimensions: $%(map_name)s-sprite-dimensions) {
                    @include sprites($%(map_name)s-sprites, $sprite-names, $%(map_name)s-sprite-base-class, $dimensions);
                }

                // Generates a class for each sprited image.
                @mixin all-%(map_name)s-sprites($dimensions: $%(map_name)s-sprite-dimensions) {
                    @include %(map_name)s-sprites(%(sprites)s, $dimensions);
                }
            ''' % {'map_name': map_name, 'sprites': ' '.join(names)}
            return ret

    @print_timing(10)
    def _do_if(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @if and @else if
        """
        if code != '@if':
            if '@if' not in rule[OPTIONS]:
                log.error("@else with no @if (%s)", rule[INDEX][rule[LINENO]])
            val = not rule[OPTIONS].get('@if', True)
            name = c_property[9:].strip()
        else:
            val = True
        if val:
            val = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
            val = bool(False if not val or isinstance(val, basestring) and (val in ('0', 'false', 'undefined') or _variable_re.match(val)) else val)
            if val:
                rule[CODESTR] = c_codestr
                self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)
            rule[OPTIONS]['@if'] = val

    @print_timing(10)
    def _do_else(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @else
        """
        if '@if' not in rule[OPTIONS]:
            log.error("@else with no @if (%s)", rule[INDEX][rule[LINENO]])
        val = rule[OPTIONS].pop('@if', True)
        if not val:
            rule[CODESTR] = c_codestr
            self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)

    @print_timing(10)
    def _do_for(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @for
        """
        var, _, name = name.partition(' from ')
        frm, _, through = name.partition(' through ')
        if not through:
            frm, _, through = frm.partition(' to ')
        frm = self.calculate(frm, rule[CONTEXT], rule[OPTIONS], rule)
        through = self.calculate(through, rule[CONTEXT], rule[OPTIONS], rule)
        try:
            frm = int(float(frm))
            through = int(float(through))
        except ValueError:
            pass
        else:
            if frm > through:
                frm, through = through, frm
                rev = reversed
            else:
                rev = lambda x: x
            var = var.strip()
            var = self.do_glob_math(var, rule[CONTEXT], rule[OPTIONS], rule, True)

            for i in rev(range(frm, through + 1)):
                rule[CODESTR] = c_codestr
                rule[CONTEXT][var] = str(i)
                self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)

    @print_timing(10)
    def _do_each(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
        """
        Implements @each
        """
        var, _, name = name.partition(' in ')
        name = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
        if name:
            name = ListValue(name)
            var = var.strip()
            var = self.do_glob_math(var, rule[CONTEXT], rule[OPTIONS], rule, True)

            for n, v in name.items():
                v = to_str(v)
                rule[CODESTR] = c_codestr
                rule[CONTEXT][var] = v
                if not isinstance(n, int):
                    rule[CONTEXT][n] = v
                self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)

    # @print_timing(10)
    # def _do_while(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr, code, name):
    #     THIS DOES NOT WORK AS MODIFICATION OF INNER VARIABLES ARE NOT KNOWN AT THIS POINT!!
    #     """
    #     Implements @while
    #     """
    #     first_val = None
    #     while True:
    #         val = self.calculate(name, rule[CONTEXT], rule[OPTIONS], rule)
    #         val = bool(False if not val or isinstance(val, basestring) and (val in ('0', 'false', 'undefined') or _variable_re.match(val)) else val)
    #         if first_val is None:
    #             first_val = val
    #         if not val:
    #             break
    #         rule[CODESTR] = c_codestr
    #         self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)
    #     rule[OPTIONS]['@if'] = first_val

    @print_timing(10)
    def _get_variables(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr):
        """
        Implements @variables and @vars
        """
        _rule = list(rule)
        _rule[CODESTR] = c_codestr
        _rule[PROPERTIES] = rule[CONTEXT]
        self.manage_children(_rule, p_selectors, p_parents, p_children, scope, media)

    @print_timing(10)
    def _get_properties(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr):
        """
        Implements properties and variables extraction and assignment
        """
        prop, value = (_prop_split_re.split(c_property, 1) + [None])[:2]
        try:
            is_var = (c_property[len(prop)] == '=')
        except IndexError:
            is_var = False
        prop = prop.strip()
        prop = self.do_glob_math(prop, rule[CONTEXT], rule[OPTIONS], rule, True)
        if prop:
            if value:
                value = value.strip()
                value = self.calculate(value, rule[CONTEXT], rule[OPTIONS], rule)
            _prop = (scope or '') + prop
            if is_var or prop.startswith('$') and value is not None:
                in_context = rule[CONTEXT].get(_prop)
                is_defined = not (in_context is None or isinstance(in_context, basestring) and _undefined_re.match(in_context))
                if isinstance(value, basestring):
                    if '!default' in value:
                        if is_defined:
                            value = None
                        if value is not None:
                            value = value.replace('!default', '').replace('  ', ' ').strip()
                    if value is not None and prop.startswith('$') and prop[1].isupper():
                        if is_defined:
                            log.warn("Constant %r redefined", prop)
                elif isinstance(value, ListValue):
                    value = ListValue(value)
                    for k, v in value.value.items():
                        if v == '!default':
                            if is_defined:
                                value = None
                            if value is not None:
                                del value.value[k]
                                value = value.first() if len(value) == 1 else value
                            break
                if value is not None:
                    rule[CONTEXT][_prop] = value
            else:
                _prop = self.apply_vars(_prop, rule[CONTEXT], rule[OPTIONS], rule, True)
                rule[PROPERTIES].append((c_lineno, _prop, to_str(value) if value is not None else None))

    @print_timing(10)
    def _nest_rules(self, rule, p_selectors, p_parents, p_children, scope, media, c_lineno, c_property, c_codestr):
        """
        Implements Nested CSS rules
        """
        if c_property == self.construct and rule[MEDIA] == media:
            rule[CODESTR] = c_codestr
            self.manage_children(rule, p_selectors, p_parents, p_children, scope, media)
        else:
            c_property = self.apply_vars(c_property, rule[CONTEXT], rule[OPTIONS], rule, True)

            c_selectors = self.normalize_selectors(c_property)
            c_selectors, _, c_parents = c_selectors.partition(' extends ')

            better_selectors = set()
            c_selectors = c_selectors.split(',')
            for c_selector in c_selectors:
                for p_selector in p_selectors:
                    if c_selector == self.construct:
                        better_selectors.add(p_selector)
                    elif '&' in c_selector:  # Parent References
                        better_selectors.add(c_selector.replace('&', p_selector))
                    elif p_selector:
                        better_selectors.add(p_selector + ' ' + c_selector)
                    else:
                        better_selectors.add(c_selector)
            better_selectors = ','.join(sorted(better_selectors))

            if c_parents:
                parents = set(p.strip() for p in c_parents.split('&'))
                parents.discard('')
                if parents:
                    better_selectors += ' extends ' + '&'.join(sorted(parents))

            _rule = spawn_rule(rule, codestr=c_codestr, deps=set(), context=rule[CONTEXT].copy(), options=rule[OPTIONS].copy(), selectors=better_selectors, properties=[], final=False, media=media, lineno=c_lineno)

            p_children.appendleft(_rule)

    @print_timing(4)
    def link_with_parents(self, parent, c_selectors, c_rules):
        """
        Link with a parent for the current child rule.
        If parents found, returns a list of parent rules to the child
        """
        parent_found = None
        for p_selectors, p_rules in self.parts.items():
            _p_selectors, _, _ = p_selectors.partition(' extends ')
            _p_selectors = _p_selectors.split(',')

            new_selectors = set()
            found = False

            # Finds all the parent selectors and parent selectors with another
            # bind selectors behind. For example, if `.specialClass extends .baseClass`,
            # and there is a `.baseClass` selector, the extension should create
            # `.specialClass` for that rule, but if there's also a `.baseClass a`
            # it also should create `.specialClass a`
            for p_selector in _p_selectors:
                if parent in p_selector:
                    # get the new child selector to add (same as the parent selector but with the child name)
                    # since selectors can be together, separated with # or . (i.e. something.parent) check that too:
                    for c_selector in c_selectors.split(','):
                        # Get whatever is different between the two selectors:
                        _c_selector, _parent = c_selector, parent
                        lcp = self.longest_common_prefix(_c_selector, _parent)
                        if lcp:
                            _c_selector = _c_selector[lcp:]
                            _parent = _parent[lcp:]
                        lcs = self.longest_common_suffix(_c_selector, _parent)
                        if lcs:
                            _c_selector = _c_selector[:-lcs]
                            _parent = _parent[:-lcs]
                        if _c_selector and _parent:
                            # Get the new selectors:
                            prev_symbol = '(?<![%#.:])' if _parent[0] in ('%', '#', '.', ':') else r'(?<![-\w%#.:])'
                            post_symbol = r'(?![-\w])'
                            new_parent = re.sub(prev_symbol + _parent + post_symbol, _c_selector, p_selector)
                            if p_selector != new_parent:
                                new_selectors.add(new_parent)
                                found = True

            if found:
                # add parent:
                parent_found = parent_found or []
                parent_found.extend(p_rules)

            if new_selectors:
                new_selectors = self.normalize_selectors(p_selectors, new_selectors)
                # rename node:
                if new_selectors != p_selectors:
                    del self.parts[p_selectors]
                    self.parts.setdefault(new_selectors, [])
                    self.parts[new_selectors].extend(p_rules)

                deps = set()
                # save child dependencies:
                for c_rule in c_rules or []:
                    c_rule[SELECTORS] = c_selectors  # re-set the SELECTORS for the rules
                    deps.add(c_rule[POSITION])

                for p_rule in p_rules:
                    p_rule[SELECTORS] = new_selectors  # re-set the SELECTORS for the rules
                    p_rule[DEPS].update(deps)  # position is the "index" of the object

        return parent_found

    @print_timing(3)
    def parse_extends(self):
        """
        For each part, create the inheritance parts from the ' extends '
        """
        # To be able to manage multiple extends, you need to
        # destroy the actual node and create many nodes that have
        # mono extend. The first one gets all the css rules
        for _selectors, rules in self.parts.items():
            if ' extends ' in _selectors:
                selectors, _, parent = _selectors.partition(' extends ')
                parents = parent.split('&')
                del self.parts[_selectors]
                for parent in parents:
                    new_selectors = selectors + ' extends ' + parent
                    self.parts.setdefault(new_selectors, [])
                    self.parts[new_selectors].extend(rules)
                    rules = []  # further rules extending other parents will be empty

        cnt = 0
        parents_left = True
        while parents_left and cnt < 10:
            cnt += 1
            parents_left = False
            for _selectors in self.parts.keys():
                selectors, _, parent = _selectors.partition(' extends ')
                if parent:
                    parents_left = True
                    if _selectors not in self.parts:
                        continue  # Nodes might have been renamed while linking parents...

                    rules = self.parts[_selectors]

                    del self.parts[_selectors]
                    self.parts.setdefault(selectors, [])
                    self.parts[selectors].extend(rules)

                    parents = self.link_with_parents(parent, selectors, rules)

                    if parents is None:
                        log.warn("Parent rule not found: %s", parent)
                    else:
                        # from the parent, inherit the context and the options:
                        new_context = {}
                        new_options = {}
                        for parent in parents:
                            new_context.update(parent[CONTEXT])
                            new_options.update(parent[OPTIONS])
                        for rule in rules:
                            _new_context = new_context.copy()
                            _new_context.update(rule[CONTEXT])
                            rule[CONTEXT] = _new_context
                            _new_options = new_options.copy()
                            _new_options.update(rule[OPTIONS])
                            rule[OPTIONS] = _new_options

    @print_timing(3)
    def manage_order(self):
        # order rules according with their dependencies
        for rule in self.rules:
            if rule[POSITION] is not None:
                rule[DEPS].add(rule[POSITION] + 1)
                # This moves the rules just above the topmost dependency during the sorted() below:
                rule[POSITION] = min(rule[DEPS])
        self.rules = sorted(self.rules, key=lambda o: o[POSITION])

    @print_timing(3)
    def parse_properties(self):
        self.css_files = []
        self._rules = {}
        css_files = set()
        old_fileid = None
        for rule in self.rules:
            #print >>sys.stderr, rule[FILEID], rule[POSITION], [ c for c in rule[CONTEXT] if c[1] != '_' ], rule[OPTIONS].keys(), rule[SELECTORS], rule[DEPS]
            if rule[POSITION] is not None and rule[PROPERTIES]:
                fileid = rule[FILEID]
                self._rules.setdefault(fileid, [])
                self._rules[fileid].append(rule)
                if old_fileid != fileid:
                    old_fileid = fileid
                    if fileid not in css_files:
                        css_files.add(fileid)
                        self.css_files.append(fileid)

    @print_timing(3)
    def create_css(self, fileid=None):
        """
        Generate the final CSS string
        """
        if fileid:
            rules = self._rules.get(fileid) or []
        else:
            rules = self.rules

        compress = self.scss_opts.get('compress', True)
        if compress:
            sc, sp, tb, nl = False, '', '', ''
        else:
            sc, sp, tb, nl = True, ' ', '  ', '\n'

        scope = set()
        return self._create_css(rules, scope, sc, sp, tb, nl, not compress and self.scss_opts.get('debug_info', False))

    def _create_css(self, rules, scope=None, sc=True, sp=' ', tb='  ', nl='\n', debug_info=False):
        scope = set() if scope is None else scope

        open_selectors = False
        skip_selectors = False
        old_selectors = None
        open_media = False
        old_media = None
        old_property = None

        wrap = textwrap.TextWrapper(break_long_words=False)
        wrap.wordsep_re = re.compile(r'(?<=,)(\s*)')
        wrap = wrap.wrap

        total_rules = 0
        total_selectors = 0

        result = ''
        for rule in rules:
            #print >>sys.stderr, rule[FILEID], rule[MEDIA], rule[POSITION], [ c for c in rule[CONTEXT] if not c.startswith('$__') ], rule[OPTIONS].keys(), rule[SELECTORS], rule[DEPS]
            if rule[POSITION] is not None and rule[PROPERTIES]:
                selectors = rule[SELECTORS]
                media = rule[MEDIA]
                _tb = tb if old_media else ''
                if old_media != media or media is not None:
                    if open_selectors:
                        if not skip_selectors:
                            if not sc:
                                if result[-1] == ';':
                                    result = result[:-1]
                            result += _tb + '}' + nl
                        open_selectors = False
                        skip_selectors = False
                    if open_media:
                        if not sc:
                            if result[-1] == ';':
                                result = result[:-1]
                        result += '}' + nl
                        open_media = False
                    if media:
                        result += '@media ' + (' and ').join(set(media)) + sp + '{' + nl
                        open_media = True
                    old_media = media
                    old_selectors = None  # force entrance to add a new selector
                _tb = tb if media else ''
                if old_selectors != selectors or selectors is not None:
                    if open_selectors:
                        if not skip_selectors:
                            if not sc:
                                if result[-1] == ';':
                                    result = result[:-1]
                            result += _tb + '}' + nl
                        open_selectors = False
                        skip_selectors = False
                    if selectors:
                        _selectors = [s for s in selectors.split(',') if '%' not in s]
                        if _selectors:
                            total_rules += 1
                            total_selectors += len(_selectors)
                            if debug_info:
                                _lineno = rule[LINENO]
                                line = rule[INDEX][_lineno]
                                filename, lineno = line.rsplit(':', 1)
                                real_filename, real_lineno = filename, lineno
                                # Walk up to a non-library file:
                                # while _lineno >= 0:
                                #     path, name = os.path.split(line)
                                #     if not name.startswith('_'):
                                #         filename, lineno = line.rsplit(':', 1)
                                #         break
                                #     line = rule[INDEX][_lineno]
                                #     _lineno -= 1
                                sass_debug_info = ''
                                if filename.startswith('<string '):
                                    filename = '<unknown>'
                                if real_filename.startswith('<string '):
                                    real_filename = '<unknown>'
                                if real_filename != filename or real_lineno != lineno:
                                    if debug_info == 'comments':
                                        sass_debug_info += '/* file: %s, line: %s */' % (real_filename, real_lineno) + nl
                                    else:
                                        real_filename = _escape_chars_re.sub(r'\\\1', real_filename)
                                        sass_debug_info += "@media -sass-debug-info{filename{font-family:file\:\/%s;}line{font-family:'%s';}}" % (real_filename, real_lineno) + nl
                                if debug_info == 'comments':
                                    sass_debug_info += '/* file: %s, line: %s */' % (filename, lineno) + nl
                                else:
                                    filename = _escape_chars_re.sub(r'\\\1', filename)
                                    sass_debug_info += "@media -sass-debug-info{filename{font-family:file\:\/%s;}line{font-family:'%s';}}" % (filename, lineno) + nl
                                result += sass_debug_info
                            selector = (',' + sp).join('%s%s' % (self.super_selector, s) for s in _selectors) + sp + '{'
                            if nl:
                                selector = nl.join(wrap(selector))
                            result += _tb + selector + nl
                        else:
                            skip_selectors = True
                        open_selectors = True
                    old_selectors = selectors
                    scope = set()
                if selectors:
                    _tb += tb
                if rule[OPTIONS].get('verbosity', 0) > 1:
                    result += _tb + '/* file: ' + rule[FILEID] + ' */' + nl
                    if rule[CONTEXT]:
                        result += _tb + '/* vars:' + nl
                        for k, v in rule[CONTEXT].items():
                            result += _tb + _tb + k + ' = ' + v + ';' + nl
                        result += _tb + '*/' + nl
                if not skip_selectors:
                    result += self._print_properties(rule[PROPERTIES], scope, [old_property], sc, sp, _tb, nl, wrap)

        if open_media:
            _tb = tb
        else:
            _tb = ''
        if open_selectors and not skip_selectors:
            if not sc:
                if result[-1] == ';':
                    result = result[:-1]
            result += _tb + '}' + nl

        if open_media:
            if not sc:
                if result[-1] == ';':
                    result = result[:-1]
            result += '}' + nl

        return (result, total_rules, total_selectors)

    def _print_properties(self, properties, scope=None, old_property=None, sc=True, sp=' ', _tb='', nl='\n', wrap=None):
        if wrap is None:
            wrap = textwrap.TextWrapper(break_long_words=False)
            wrap.wordsep_re = re.compile(r'(?<=,)(\s*)')
            wrap = wrap.wrap
        result = ''
        old_property = [None] if old_property is None else old_property
        scope = set() if scope is None else scope
        for lineno, prop, value in properties:
            if value is not None:
                if nl:
                    value = (nl + _tb + _tb).join(wrap(value))
                property = prop + ':' + sp + value
            else:
                property = prop
            if '!default' in property:
                property = property.replace('!default', '').replace('  ', ' ').strip()
                if prop in scope:
                    continue
            if old_property[0] != property:
                old_property[0] = property
                scope.add(prop)
                old_property[0] = property
                result += _tb + property + ';' + nl
        return result

    def calculate(self, _base_str, context, options, rule):
        better_expr_str = _base_str

        if _skip_word_re.match(better_expr_str) and '- ' not in better_expr_str and ' and ' not in better_expr_str and ' or ' not in better_expr_str and 'not ' not in better_expr_str:
            return better_expr_str

        rule = list(rule)
        rule[CONTEXT] = context
        rule[OPTIONS] = options

        better_expr_str = self.do_glob_math(better_expr_str, context, options, rule)

        better_expr_str = eval_expr(better_expr_str, rule, True)

        if better_expr_str is None:
            better_expr_str = self.apply_vars(_base_str, context, options, rule)

        return better_expr_str

    def _calculate_expr(self, context, options, rule, _dequote):
        def __calculate_expr(result):
            _group0 = result.group(1)
            _base_str = _group0
            better_expr_str = eval_expr(_base_str, rule)

            if better_expr_str is None:
                better_expr_str = self.apply_vars(_base_str, context, options, rule)
            elif _dequote:
                better_expr_str = dequote(str(better_expr_str))
            else:
                better_expr_str = str(better_expr_str)

            return better_expr_str
        return __calculate_expr

    def do_glob_math(self, cont, context, options, rule, _dequote=False):
        cont = str(cont)
        if '#{' not in cont:
            return cont
        cont = _expr_glob_re.sub(self._calculate_expr(context, options, rule, _dequote), cont)
        return cont

    @print_timing(3)
    def post_process(self, cont):
        compress = self.scss_opts.get('compress', 1) and 'compress_' or ''
        # short colors:
        if self.scss_opts.get(compress + 'short_colors', 1):
            cont = _short_color_re.sub(r'#\1\2\3', cont)
        # color names:
        if self.scss_opts.get(compress + 'reverse_colors', 1):
            cont = _reverse_colors_re.sub(lambda m: _reverse_colors[m.group(0).lower()], cont)
        if compress:
            # zero units out (i.e. 0px or 0em -> 0):
            cont = _zero_units_re.sub('0', cont)
            # remove zeros before decimal point (i.e. 0.3 -> .3)
            cont = _zero_re.sub('.', cont)
        return cont


import random
import hashlib
import base64
import datetime
import mimetypes
import glob
import math
import operator
import colorsys

try:
    from PIL import Image, ImageDraw
except ImportError:
    try:
        import Image, ImageDraw
    except:
        Image = None


################################################################################


def to_str(num):
    if isinstance(num, dict):
        s = sorted(num.items())
        sp = num.get('_', '')
        return (sp + ' ').join(to_str(v) for n, v in s if n != '_')
    elif isinstance(num, float):
        num = ('%0.03f' % round(num, 3)).rstrip('0').rstrip('.')
        return num
    elif isinstance(num, bool):
        return 'true' if num else 'false'
    elif num is None:
        return ''
    return str(num)


def to_float(num):
    if isinstance(num, (float, int)):
        return float(num)
    num = to_str(num)
    if num and num[-1] == '%':
        return float(num[:-1]) / 100.0
    else:
        return float(num)


hex2rgba = {
    9: lambda c: (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), int(c[7:9], 16)),
    7: lambda c: (int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16), 1.0),
    5: lambda c: (int(c[1] * 2, 16), int(c[2] * 2, 16), int(c[3] * 2, 16), int(c[4] * 2, 16)),
    4: lambda c: (int(c[1] * 2, 16), int(c[2] * 2, 16), int(c[3] * 2, 16), 1.0),
}


def escape(s):
    return re.sub(r'''(["'])''', r'\\\1', s)


def unescape(s):
    return re.sub(r'''\\(['"])''', r'\1', s)


################################################################################
# Sass/Compass Library Functions:


def _rgb(r, g, b, type='rgb'):
    return _rgba(r, g, b, 1.0, type)


def _rgba(r, g, b, a, type='rgba'):
    c = NumberValue(r), NumberValue(g), NumberValue(b), NumberValue(a)

    col = [c[i].value * 255.0 if (c[i].unit == '%' or c[i].value > 0 and c[i].value <= 1) else
            0.0 if c[i].value < 0 else
            255.0 if c[i].value > 255 else
            c[i].value
            for i in range(3)
          ]
    col += [0.0 if c[3].value < 0 else 1.0 if c[3].value > 1 else c[3].value]
    col += [type]
    return ColorValue(col)


def _color_type(color, a, type):
    color = ColorValue(color).value
    a = NumberValue(a).value if a is not None else color[3]
    col = list(color[:3])
    col += [0.0 if a < 0 else 1.0 if a > 1 else a]
    col += [type]
    return ColorValue(col)


def _rgb2(color):
    return _color_type(color, 1.0, 'rgb')


def _rgba2(color, a=None):
    return _color_type(color, a, 'rgba')


def _hsl2(color):
    return _color_type(color, 1.0, 'hsl')


def _hsla2(color, a=None):
    return _color_type(color, a, 'hsla')


def _ie_hex_str(color):
    c = ColorValue(color).value
    return StringValue('#%02X%02X%02X%02X' % (round(c[3] * 255), round(c[0]), round(c[1]), round(c[2])))


def _hsl(h, s, l, type='hsl'):
    return _hsla(h, s, l, 1.0, type)


def _hsla(h, s, l, a, type='hsla'):
    c = NumberValue(h), NumberValue(s), NumberValue(l), NumberValue(a)
    col = [c[0] if (c[0].unit == '%' and c[0].value > 0 and c[0].value <= 1) else (c[0].value % 360.0) / 360.0]
    col += [0.0 if cl <= 0 else 1.0 if cl >= 1.0 else cl
            for cl in [
                c[i].value if (c[i].unit == '%' or c[i].value > 0 and c[i].value <= 1) else
                c[i].value / 100.0
                for i in range(1, 4)
              ]
           ]
    col += [type]
    c = [c * 255.0 for c in colorsys.hls_to_rgb(col[0], 0.999999 if col[2] == 1 else col[2], 0.999999 if col[1] == 1 else col[1])] + [col[3], type]
    col = ColorValue(c)
    return col


def __rgba_op(op, color, r, g, b, a):
    color = ColorValue(color)
    c = color.value
    a = [
        None if r is None else NumberValue(r).value,
        None if g is None else NumberValue(g).value,
        None if b is None else NumberValue(b).value,
        None if a is None else NumberValue(a).value,
    ]
    # Do the additions:
    c = [op(c[i], a[i]) if op is not None and a[i] is not None else a[i] if a[i] is not None else c[i] for i in range(4)]
    # Validations:
    r = 255.0, 255.0, 255.0, 1.0
    c = [0.0 if c[i] < 0 else r[i] if c[i] > r[i] else c[i] for i in range(4)]
    color.value = tuple(c)
    return color


def _opacify(color, amount):
    return __rgba_op(operator.__add__, color, 0, 0, 0, amount)


def _transparentize(color, amount):
    return __rgba_op(operator.__sub__, color, 0, 0, 0, amount)


def __hsl_op(op, color, h, s, l):
    color = ColorValue(color)
    c = color.value
    h = None if h is None else NumberValue(h)
    s = None if s is None else NumberValue(s)
    l = None if l is None else NumberValue(l)
    a = [
        None if h is None else h.value / 360.0,
        None if s is None else s.value / 100.0 if s.unit != '%' and s.value >= 1 else s.value,
        None if l is None else l.value / 100.0 if l.unit != '%' and l.value >= 1 else l.value,
    ]
    # Convert to HSL:
    h, l, s = list(colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0))
    c = h, s, l
    # Do the additions:
    c = [0.0 if c[i] < 0 else 1.0 if c[i] > 1 else op(c[i], a[i]) if op is not None and a[i] is not None else a[i] if a[i] is not None else c[i] for i in range(3)]
    # Validations:
    c[0] = (c[0] * 360.0) % 360
    r = 360.0, 1.0, 1.0
    c = [0.0 if c[i] < 0 else r[i] if c[i] > r[i] else c[i] for i in range(3)]
    # Convert back to RGB:
    c = colorsys.hls_to_rgb(c[0] / 360.0, 0.999999 if c[2] == 1 else c[2], 0.999999 if c[1] == 1 else c[1])
    color.value = (c[0] * 255.0, c[1] * 255.0, c[2] * 255.0, color.value[3])
    return color


def _lighten(color, amount):
    return __hsl_op(operator.__add__, color, 0, 0, amount)


def _darken(color, amount):
    return __hsl_op(operator.__sub__, color, 0, 0, amount)


def _saturate(color, amount):
    return __hsl_op(operator.__add__, color, 0, amount, 0)


def _desaturate(color, amount):
    return __hsl_op(operator.__sub__, color, 0, amount, 0)


def _grayscale(color):
    return __hsl_op(operator.__sub__, color, 0, 100.0, 0)


def _adjust_hue(color, degrees):
    return __hsl_op(operator.__add__, color, degrees, 0, 0)


def _complement(color):
    return __hsl_op(operator.__add__, color, 180.0, 0, 0)


def _invert(color):
    """
    Returns the inverse (negative) of a color.
    The red, green, and blue values are inverted, while the opacity is left alone.
    """
    col = ColorValue(color)
    c = col.value
    c[0] = 255.0 - c[0]
    c[1] = 255.0 - c[1]
    c[2] = 255.0 - c[2]
    return col


def _adjust_lightness(color, amount):
    return __hsl_op(operator.__add__, color, 0, 0, amount)


def _adjust_saturation(color, amount):
    return __hsl_op(operator.__add__, color, 0, amount, 0)


def _scale_lightness(color, amount):
    return __hsl_op(operator.__mul__, color, 0, 0, amount)


def _scale_saturation(color, amount):
    return __hsl_op(operator.__mul__, color, 0, amount, 0)


def _asc_color(op, color, saturation=None, lightness=None, red=None, green=None, blue=None, alpha=None):
    if lightness or saturation:
        color = __hsl_op(op, color, 0, saturation, lightness)
    if red or green or blue or alpha:
        color = __rgba_op(op, color, red, green, blue, alpha)
    return color


def _adjust_color(color, saturation=None, lightness=None, red=None, green=None, blue=None, alpha=None):
    return _asc_color(operator.__add__, color, saturation, lightness, red, green, blue, alpha)


def _scale_color(color, saturation=None, lightness=None, red=None, green=None, blue=None, alpha=None):
    return _asc_color(operator.__mul__, color, saturation, lightness, red, green, blue, alpha)


def _change_color(color, saturation=None, lightness=None, red=None, green=None, blue=None, alpha=None):
    return _asc_color(None, color, saturation, lightness, red, green, blue, alpha)


def _mix(color1, color2, weight=None):
    """
    Mixes together two colors. Specifically, takes the average of each of the
    RGB components, optionally weighted by the given percentage.
    The opacity of the colors is also considered when weighting the components.

    Specifically, takes the average of each of the RGB components,
    optionally weighted by the given percentage.
    The opacity of the colors is also considered when weighting the components.

    The weight specifies the amount of the first color that should be included
    in the returned color.
    50%, means that half the first color
        and half the second color should be used.
    25% means that a quarter of the first color
        and three quarters of the second color should be used.

    For example:

        mix(#f00, #00f) => #7f007f
        mix(#f00, #00f, 25%) => #3f00bf
        mix(rgba(255, 0, 0, 0.5), #00f) => rgba(63, 0, 191, 0.75)

    """
    # This algorithm factors in both the user-provided weight
    # and the difference between the alpha values of the two colors
    # to decide how to perform the weighted average of the two RGB values.
    #
    # It works by first normalizing both parameters to be within [-1, 1],
    # where 1 indicates "only use color1", -1 indicates "only use color 0",
    # and all values in between indicated a proportionately weighted average.
    #
    # Once we have the normalized variables w and a,
    # we apply the formula (w + a)/(1 + w*a)
    # to get the combined weight (in [-1, 1]) of color1.
    # This formula has two especially nice properties:
    #
    #   * When either w or a are -1 or 1, the combined weight is also that number
    #     (cases where w * a == -1 are undefined, and handled as a special case).
    #
    #   * When a is 0, the combined weight is w, and vice versa
    #
    # Finally, the weight of color1 is renormalized to be within [0, 1]
    # and the weight of color2 is given by 1 minus the weight of color1.
    #
    # Algorithm from the Sass project: http://sass-lang.com/

    c1 = ColorValue(color1).value
    c2 = ColorValue(color2).value
    p = NumberValue(weight).value if weight is not None else 0.5
    p = 0.0 if p < 0 else 1.0 if p > 1 else p

    w = p * 2 - 1
    a = c1[3] - c2[3]

    w1 = ((w if (w * a == -1) else (w + a) / (1 + w * a)) + 1) / 2.0

    w2 = 1 - w1
    q = [w1, w1, w1, p]
    r = [w2, w2, w2, 1 - p]

    color = ColorValue(None).merge(c1).merge(c2)
    color.value = [c1[i] * q[i] + c2[i] * r[i] for i in range(4)]

    return color


def _red(color):
    c = ColorValue(color).value
    return NumberValue(c[0])


def _green(color):
    c = ColorValue(color).value
    return NumberValue(c[1])


def _blue(color):
    c = ColorValue(color).value
    return NumberValue(c[2])


def _alpha(color):
    c = ColorValue(color).value
    return NumberValue(c[3])


def _hue(color):
    c = ColorValue(color).value
    h, l, s = colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0)
    ret = NumberValue(h * 360.0)
    ret.units = {'deg': _units_weights.get('deg', 1), '_': 'deg'}
    return ret


def _saturation(color):
    c = ColorValue(color).value
    h, l, s = colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0)
    ret = NumberValue(s)
    ret.units = {'%': _units_weights.get('%', 1), '_': '%'}
    return ret


def _lightness(color):
    c = ColorValue(color).value
    h, l, s = colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0)
    ret = NumberValue(l)
    ret.units = {'%': _units_weights.get('%', 1), '_': '%'}
    return ret


def __color_stops(percentages, *args):
    if len(args) == 1:
        if isinstance(args[0], (list, tuple, ListValue)):
            return ListValue(args[0]).values()
        elif isinstance(args[0], (StringValue, basestring)):
            color_stops = []
            colors = split_params(args[0].value)
            for color in colors:
                color = color.strip()
                if color.startswith('color-stop('):
                    s, c = split_params(color[11:].rstrip(')'))
                    s = s.strip()
                    c = c.strip()
                else:
                    c, s = color.split()
                color_stops.append((to_float(s), c))
            return color_stops

    colors = []
    stops = []
    prev_color = False
    for c in args:
        if isinstance(c, ListValue):
            for i, c in c.items():
                if isinstance(c, ColorValue):
                    if prev_color:
                        stops.append(None)
                    colors.append(c)
                    prev_color = True
                elif isinstance(c, NumberValue):
                    stops.append(c)
                    prev_color = False
        else:
            if isinstance(c, ColorValue):
                if prev_color:
                    stops.append(None)
                colors.append(c)
                prev_color = True
            elif isinstance(c, NumberValue):
                stops.append(NumberValue(c))
                prev_color = False
    if prev_color:
        stops.append(None)
    stops = stops[:len(colors)]
    if percentages:
        max_stops = max(s and (s.value if s.unit != '%' else None) or None for s in stops)
    else:
        max_stops = max(s and (s if s.unit != '%' else None) or None for s in stops)
    stops = [s and (s.value / max_stops if s.unit != '%' else s.value) for s in stops]
    stops[0] = 0

    init = 0
    start = None
    for i, s in enumerate(stops + [1.0]):
        if s is None:
            if start is None:
                start = i
            end = i
        else:
            final = s
            if start is not None:
                stride = (final - init) / (end - start + 1 + (1 if i < len(stops) else 0))
                for j in range(start, end + 1):
                    stops[j] = init + stride * (j - start + 1)
            init = final
            start = None

    if not max_stops or percentages:
        stops = [NumberValue(s, '%') for s in stops]
    else:
        stops = [s * max_stops for s in stops]
    return zip(stops, colors)


def _grad_color_stops(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    color_stops = __color_stops(True, *args)
    ret = ', '.join(['color-stop(%s, %s)' % (to_str(s), c) for s, c in color_stops])
    return StringValue(ret)


def __grad_end_position(radial, color_stops):
    return __grad_position(-1, 100, radial, color_stops)


def __grad_position(index, default, radial, color_stops):
    try:
        stops = NumberValue(color_stops[index][0])
        if radial and stops.unit != 'px' and (index == 0 or index == -1 or index == len(color_stops) - 1):
            log.warn("Webkit only supports pixels for the start and end stops for radial gradients. Got %s", stops)
    except IndexError:
        stops = NumberValue(default)
    return stops


def _grad_end_position(*color_stops):
    color_stops = __color_stops(False, *color_stops)
    return NumberValue(__grad_end_position(False, color_stops))


def _color_stops(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    color_stops = __color_stops(False, *args)
    ret = ', '.join(['%s %s' % (c, to_str(s)) for s, c in color_stops])
    return StringValue(ret)


def _color_stops_in_percentages(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    color_stops = __color_stops(True, *args)
    ret = ', '.join(['%s %s' % (c, to_str(s)) for s, c in color_stops])
    return StringValue(ret)


def _get_gradient_position_and_angle(args):
    for arg in args:
        if isinstance(arg, (StringValue, NumberValue, basestring)):
            _arg = [arg]
        elif isinstance(arg, (list, tuple, ListValue)):
            _arg = arg
        else:
            continue
        ret = None
        skip = False
        for a in _arg:
            if isinstance(a, ColorValue):
                skip = True
                break
            elif isinstance(a, NumberValue):
                ret = arg
        if skip:
            continue
        if ret is not None:
            return ret
        for seek in (
            'center',
            'top', 'bottom',
            'left', 'right',
        ):
            if seek in _arg:
                return arg
    return None


def _get_gradient_shape_and_size(args):
    for arg in args:
        if isinstance(arg, (StringValue, NumberValue, basestring)):
            _arg = [arg]
        elif isinstance(arg, (list, tuple, ListValue)):
            _arg = arg
        else:
            continue
        for seek in (
            'circle', 'ellipse',
            'closest-side', 'closest-corner',
            'farthest-side', 'farthest-corner',
            'contain', 'cover',
        ):
            if seek in _arg:
                return arg
    return None


def _get_gradient_color_stops(args):
    color_stops = []
    for arg in args:
        if isinstance(arg, ColorValue):
            color_stops.append(arg)
        elif isinstance(arg, (list, tuple, ListValue)):
            for a in arg:
                if isinstance(a, ColorValue):
                    color_stops.append(arg)
                    break
    return color_stops or None


def _radial_gradient(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()

    position_and_angle = _get_gradient_position_and_angle(args)
    shape_and_size = _get_gradient_shape_and_size(args)
    color_stops = _get_gradient_color_stops(args)
    color_stops = __color_stops(False, *color_stops)

    args = [
        _position(position_and_angle) if position_and_angle is not None else None,
        shape_and_size if shape_and_size is not None else None,
    ]
    args.extend('%s %s' % (c, to_str(s)) for s, c in color_stops)

    to__s = 'radial-gradient(' + ', '.join(to_str(a) for a in args or [] if a is not None) + ')'
    ret = StringValue(to__s)

    def to__css2():
        return StringValue('')
    ret.to__css2 = to__css2

    def to__moz():
        return StringValue('-moz-' + to__s)
    ret.to__moz = to__moz

    def to__pie():
        log.warn("PIE does not support radial-gradient.")
        return StringValue('-pie-radial-gradient(unsupported)')
    ret.to__pie = to__pie

    def to__webkit():
        return StringValue('-webkit-' + to__s)
    ret.to__webkit = to__webkit

    def to__owg():
        args = [
            'radial',
            _grad_point(position_and_angle) if position_and_angle is not None else 'center',
            '0',
            _grad_point(position_and_angle) if position_and_angle is not None else 'center',
            __grad_end_position(True, color_stops),
        ]
        args.extend('color-stop(%s, %s)' % (to_str(s), c) for s, c in color_stops)
        ret = '-webkit-gradient(' + ', '.join(to_str(a) for a in args or [] if a is not None) + ')'
        return StringValue(ret)
    ret.to__owg = to__owg

    def to__svg():
        return _radial_svg_gradient(color_stops, position_and_angle or 'center')
    ret.to__svg = to__svg

    return ret


def _linear_gradient(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()

    position_and_angle = _get_gradient_position_and_angle(args)
    color_stops = _get_gradient_color_stops(args)
    color_stops = __color_stops(False, *color_stops)

    args = [
        _position(position_and_angle) if position_and_angle is not None else None,
    ]
    args.extend('%s %s' % (c, to_str(s)) for s, c in color_stops)

    to__s = 'linear-gradient(' + ', '.join(to_str(a) for a in args or [] if a is not None) + ')'
    ret = StringValue(to__s)

    def to__css2():
        return StringValue('')
    ret.to__css2 = to__css2

    def to__moz():
        return StringValue('-moz-' + to__s)
    ret.to__moz = to__moz

    def to__pie():
        return StringValue('-pie-' + to__s)
    ret.to__pie = to__pie

    def to__ms():
        return StringValue('-ms-' + to__s)
    ret.to__ms = to__ms

    def to__o():
        return StringValue('-o-' + to__s)
    ret.to__o = to__o

    def to__webkit():
        return StringValue('-webkit-' + to__s)
    ret.to__webkit = to__webkit

    def to__owg():
        args = [
            'linear',
            _position(position_and_angle or 'center top'),
            _opposite_position(position_and_angle or 'center top'),
        ]
        args.extend('color-stop(%s, %s)' % (to_str(s), c) for s, c in color_stops)
        ret = '-webkit-gradient(' + ', '.join(to_str(a) for a in args or [] if a is not None) + ')'
        return StringValue(ret)
    ret.to__owg = to__owg

    def to__svg():
        return _linear_svg_gradient(color_stops, position_and_angle or 'top')
    ret.to__svg = to__svg

    return ret


def _radial_svg_gradient(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    color_stops = args
    center = None
    if isinstance(args[-1], (StringValue, NumberValue, basestring)):
        center = args[-1]
        color_stops = args[:-1]
    color_stops = __color_stops(False, *color_stops)
    cx, cy = zip(*_grad_point(center).items())[1]
    r = __grad_end_position(True, color_stops)
    svg = __radial_svg(color_stops, cx, cy, r)
    url = 'data:' + 'image/svg+xml' + ';base64,' + base64.b64encode(svg)
    inline = 'url("%s")' % escape(url)
    return StringValue(inline)


def _linear_svg_gradient(*args):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    color_stops = args
    start = None
    if isinstance(args[-1], (StringValue, NumberValue, basestring)):
        start = args[-1]
        color_stops = args[:-1]
    color_stops = __color_stops(False, *color_stops)
    x1, y1 = zip(*_grad_point(start).items())[1]
    x2, y2 = zip(*_grad_point(_opposite_position(start)).items())[1]
    svg = __linear_svg(color_stops, x1, y1, x2, y2)
    url = 'data:' + 'image/svg+xml' + ';base64,' + base64.b64encode(svg)
    inline = 'url("%s")' % escape(url)
    return StringValue(inline)


def __color_stops_svg(color_stops):
    ret = ''.join('<stop offset="%s" stop-color="%s"/>' % (to_str(s), c) for s, c in color_stops)
    return ret


def __svg_template(gradient):
    ret = '<?xml version="1.0" encoding="utf-8"?>\
<svg version="1.1" xmlns="http://www.w3.org/2000/svg">\
<defs>%s</defs>\
<rect x="0" y="0" width="100%%" height="100%%" fill="url(#grad)" />\
</svg>' % gradient
    return ret


def __linear_svg(color_stops, x1, y1, x2, y2):
    gradient = '<linearGradient id="grad" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (
        to_str(NumberValue(x1)),
        to_str(NumberValue(y1)),
        to_str(NumberValue(x2)),
        to_str(NumberValue(y2)),
        __color_stops_svg(color_stops)
    )
    return __svg_template(gradient)


def __radial_svg(color_stops, cx, cy, r):
    gradient = '<radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="%s" cy="%s" r="%s">%s</radialGradient>' % (
        to_str(NumberValue(cx)),
        to_str(NumberValue(cy)),
        to_str(NumberValue(r)),
        __color_stops_svg(color_stops)
    )
    return __svg_template(gradient)


################################################################################
# Compass like functionality for sprites and images:
sprite_maps = {}
sprite_images = {}


def _sprite_map(g, **kwargs):
    """
    Generates a sprite map from the files matching the glob pattern.
    Uses the keyword-style arguments passed in to control the placement.
    """
    g = StringValue(g).value

    if not Image:
        raise Exception("Images manipulation require PIL")

    if g in sprite_maps:
        sprite_maps[glob]['*'] = datetime.datetime.now()
    elif '..' not in g:  # Protect against going to prohibited places...
        vertical = (kwargs.get('direction', 'vertical') == 'vertical')
        repeat = StringValue(kwargs.get('repeat', 'no-repeat'))
        position = NumberValue(kwargs.get('position', 0))
        collapse_x = NumberValue(kwargs.get('collapse_x', 0))
        collapse_y = NumberValue(kwargs.get('collapse_y', 0))
        if position and position > -1 and position < 1:
            position.units = {'%': _units_weights.get('%', 1), '_': '%'}

        dst_colors = kwargs.get('dst_color')
        if isinstance(dst_colors, ListValue):
            dst_colors = [list(ColorValue(v).value[:3]) for n, v in dst_colors.items() if v]
        else:
            dst_colors = [list(ColorValue(dst_colors).value[:3])] if dst_colors else []

        src_colors = kwargs.get('src_color')
        if isinstance(src_colors, ListValue):
            src_colors = [tuple(ColorValue(v).value[:3]) if v else (0, 0, 0) for n, v in src_colors.items()]
        else:
            src_colors = [tuple(ColorValue(src_colors).value[:3]) if src_colors else (0, 0, 0)]

        len_colors = max(len(dst_colors), len(src_colors))
        dst_colors = (dst_colors * len_colors)[:len_colors]
        src_colors = (src_colors * len_colors)[:len_colors]

        spacing = kwargs.get('spacing', 0)
        if isinstance(spacing, ListValue):
            spacing = [int(NumberValue(v).value) for n, v in spacing.items()]
        else:
            spacing = [int(NumberValue(spacing).value)]
        spacing = (spacing * 4)[:4]

        if callable(STATIC_ROOT):
            glob_path = g
            rfiles = files = sorted(STATIC_ROOT(g))
        else:
            glob_path = os.path.join(STATIC_ROOT, g)
            files = glob.glob(glob_path)
            files = sorted((f, None) for f in files)
            rfiles = [(f[len(STATIC_ROOT):], s) for f, s in files]

        if not files:
            log.error("Nothing found at '%s'", glob_path)
            return StringValue(None)

        times = []
        for file, storage in files:
            try:
                d_obj = storage.modified_time(file)
                times.append(int(time.mktime(d_obj.timetuple())))
            except:
                times.append(int(os.path.getmtime(file)))

        map_name = os.path.normpath(os.path.dirname(g)).replace('\\', '_').replace('/', '_')
        key = list(zip(*files)[0]) + times + [repr(kwargs)]
        key = map_name + '-' + base64.urlsafe_b64encode(hashlib.md5(repr(key)).digest()).rstrip('=').replace('-', '_')
        asset_file = key + '.png'
        asset_path = os.path.join(ASSETS_ROOT, asset_file)

        if os.path.exists(asset_path + '.cache'):
            asset, map, sizes = pickle.load(open(asset_path + '.cache'))
            sprite_maps[asset] = map
        else:
            def images():
                for file, storage in files:
                    yield Image.open(storage.open(file)) if storage is not None else Image.open(file)
            names = tuple(os.path.splitext(os.path.basename(file))[0] for file, storage in files)
            positions = []
            spacings = []
            tot_spacings = []
            for name in names:
                name = name.replace('-', '_')
                _position = kwargs.get(name + '_position')
                if _position is None:
                    _position = position
                else:
                    _position = NumberValue(_position)
                    if _position and _position > -1 and _position < 1:
                        _position.units = {'%': _units_weights.get('%', 1), '_': '%'}
                positions.append(_position)
                _spacing = kwargs.get(name + '_spacing')
                if _spacing is None:
                    _spacing = spacing
                else:
                    if isinstance(_spacing, ListValue):
                        _spacing = [int(NumberValue(v).value) for n, v in _spacing.items()]
                    else:
                        _spacing = [int(NumberValue(_spacing).value)]
                    _spacing = (_spacing * 4)[:4]
                spacings.append(_spacing)
                if _position and _position.unit != '%':
                    if vertical:
                        if _position > 0:
                            tot_spacings.append((_spacing[0], _spacing[1], _spacing[2], _spacing[3] + _position))
                    else:
                        if _position > 0:
                            tot_spacings.append((_spacing[0] + _position, _spacing[1], _spacing[2], _spacing[3]))
                else:
                    tot_spacings.append(_spacing)

            sizes = tuple((collapse_x or image.size[0], collapse_y or image.size[1]) for image in images())

            _spacings = zip(*tot_spacings)
            if vertical:
                width = max(zip(*sizes)[0]) + max(_spacings[1]) + max(_spacings[3])
                height = sum(zip(*sizes)[1]) + sum(_spacings[0]) + sum(_spacings[2])
            else:
                width = sum(zip(*sizes)[0]) + sum(_spacings[1]) + sum(_spacings[3])
                height = max(zip(*sizes)[1]) + max(_spacings[0]) + max(_spacings[2])

            new_image = Image.new(
                mode='RGBA',
                size=(width, height),
                color=(0, 0, 0, 0)
            )

            offsets_x = []
            offsets_y = []
            offset = 0
            for i, image in enumerate(images()):
                spacing = spacings[i]
                position = positions[i]
                iwidth, iheight = image.size
                width, height = sizes[i]
                if vertical:
                    if position and position.unit == '%':
                        x = width * position.value - (spacing[3] + height + spacing[1])
                    elif position.value < 0:
                        x = width + position.value - (spacing[3] + height + spacing[1])
                    else:
                        x = position.value
                    offset += spacing[0]
                    for i, dst_color in enumerate(dst_colors):
                        src_color = src_colors[i]
                        pixdata = image.load()
                        for _y in xrange(image.size[1]):
                            for _x in xrange(image.size[0]):
                                pixel = pixdata[_x, _y]
                                if pixel[:3] == src_color:
                                    pixdata[_x, _y] = tuple([int(c) for c in dst_color] + [pixel[3] if len(pixel) == 4 else 255])
                    if iwidth != width or iheight != height:
                        cy = 0
                        while cy < iheight:
                            cx = 0
                            while cx < iwidth:
                                cropped_image = image.crop((cx, cy, cx + width, cy + height))
                                new_image.paste(cropped_image, (int(x + spacing[3]), offset), cropped_image)
                                cx += width
                            cy += height
                    else:
                        new_image.paste(image, (int(x + spacing[3]), offset))
                    offsets_x.append(x)
                    offsets_y.append(offset - spacing[0])
                    offset += height + spacing[2]
                else:
                    if position and position.unit == '%':
                        y = height * position.value - (spacing[0] + height + spacing[2])
                    elif position.value < 0:
                        y = height + position.value - (spacing[0] + height + spacing[2])
                    else:
                        y = position.value
                    offset += spacing[3]
                    for i, dst_color in enumerate(dst_colors):
                        src_color = src_colors[i]
                        pixdata = image.load()
                        for _y in xrange(image.size[1]):
                            for _x in xrange(image.size[0]):
                                pixel = pixdata[_x, _y]
                                if pixel[:3] == src_color:
                                    pixdata[_x, _y] = tuple([int(c) for c in dst_color] + [pixel[3] if len(pixel) == 4 else 255])
                    if iwidth != width or iheight != height:
                        cy = 0
                        while cy < iheight:
                            cx = 0
                            while cx < iwidth:
                                cropped_image = image.crop((cx, cy, cx + width, cy + height))
                                new_image.paste(cropped_image, (offset, int(y + spacing[0])), cropped_image)
                                cx += width
                            cy += height
                    else:
                        new_image.paste(image, (offset, int(y + spacing[0])))
                    offsets_x.append(offset - spacing[3])
                    offsets_y.append(y)
                    offset += width + spacing[1]

            try:
                new_image.save(asset_path)
            except IOError:
                log.exception("Error while saving image")
            filetime = int(time.mktime(datetime.datetime.now().timetuple()))

            url = '%s%s?_=%s' % (ASSETS_URL, asset_file, filetime)
            asset = 'url("%s") %s' % (escape(url), repeat)
            # Use the sorted list to remove older elements (keep only 500 objects):
            if len(sprite_maps) > 1000:
                for a in sorted(sprite_maps, key=lambda a: sprite_maps[a]['*'], reverse=True)[500:]:
                    del sprite_maps[a]
            # Add the new object:
            map = dict(zip(names, zip(sizes, rfiles, offsets_x, offsets_y)))
            map['*'] = datetime.datetime.now()
            map['*f*'] = asset_file
            map['*k*'] = key
            map['*n*'] = map_name
            map['*t*'] = filetime
            pickle.dump((asset, map, zip(files, sizes)), open(asset_path + '.cache', 'w'))
            sprite_maps[asset] = map
        for file, size in sizes:
            sprite_images[file] = size
    ret = StringValue(asset)
    return ret


def _grid_image(left_gutter, width, right_gutter, height, columns=1, grid_color=None, baseline_color=None, background_color=None, inline=False):
    if not Image:
        raise Exception("Images manipulation require PIL")
    if grid_color == None:
        grid_color = (120, 170, 250, 15)
    else:
        c = ColorValue(grid_color).value
        grid_color = (c[0], c[1], c[2], int(c[3] * 255.0))
    if baseline_color == None:
        baseline_color = (120, 170, 250, 30)
    else:
        c = ColorValue(baseline_color).value
        baseline_color = (c[0], c[1], c[2], int(c[3] * 255.0))
    if background_color == None:
        background_color = (0, 0, 0, 0)
    else:
        c = ColorValue(background_color).value
        background_color = (c[0], c[1], c[2], int(c[3] * 255.0))
    _height = int(height) if height >= 1 else int(height * 1000.0)
    _width = int(width) if width >= 1 else int(width * 1000.0)
    _left_gutter = int(left_gutter) if left_gutter >= 1 else int(left_gutter * 1000.0)
    _right_gutter = int(right_gutter) if right_gutter >= 1 else int(right_gutter * 1000.0)
    if _height <= 0 or _width <= 0 or _left_gutter <= 0 or _right_gutter <= 0:
        raise ValueError
    _full_width = (_left_gutter + _width + _right_gutter)
    new_image = Image.new(
        mode='RGBA',
        size=(_full_width * int(columns), _height),
        color=background_color
    )
    draw = ImageDraw.Draw(new_image)
    for i in range(int(columns)):
        draw.rectangle((i * _full_width + _left_gutter, 0, i * _full_width + _left_gutter + _width - 1, _height - 1),  fill=grid_color)
    if _height > 1:
        draw.rectangle((0, _height - 1, _full_width * int(columns) - 1, _height - 1),  fill=baseline_color)
    if not inline:
        grid_name = 'grid_'
        if left_gutter:
            grid_name += str(int(left_gutter)) + '+'
        grid_name += str(int(width))
        if right_gutter:
            grid_name += '+' + str(int(right_gutter))
        if height and height > 1:
            grid_name += 'x' + str(int(height))
        key = (columns, grid_color, baseline_color, background_color)
        key = grid_name + '-' + base64.urlsafe_b64encode(hashlib.md5(repr(key)).digest()).rstrip('=').replace('-', '_')
        asset_file = key + '.png'
        asset_path = os.path.join(ASSETS_ROOT, asset_file)
        try:
            new_image.save(asset_path)
        except IOError:
            log.exception("Error while saving image")
            inline = True  # Retry inline version
        url = '%s%s' % (ASSETS_URL, asset_file)
    if inline:
        output = StringIO()
        new_image.save(output, format='PNG')
        contents = output.getvalue()
        output.close()
        url = 'data:image/png;base64,' + base64.b64encode(contents)
    inline = 'url("%s")' % escape(url)
    return StringValue(inline)


def _image_color(color, width=1, height=1):
    if not Image:
        raise Exception("Images manipulation require PIL")
    c = ColorValue(color).value
    w = int(NumberValue(width).value)
    h = int(NumberValue(height).value)
    if w <= 0 or h <= 0:
        raise ValueError
    new_image = Image.new(
        mode='RGB' if c[3] == 1 else 'RGBA',
        size=(w, h),
        color=(c[0], c[1], c[2], int(c[3] * 255.0))
    )
    output = StringIO()
    new_image.save(output, format='PNG')
    contents = output.getvalue()
    output.close()
    mime_type = 'image/png'
    url = 'data:' + mime_type + ';base64,' + base64.b64encode(contents)
    inline = 'url("%s")' % escape(url)
    return StringValue(inline)


def _sprite_map_name(map):
    """
    Returns the name of a sprite map The name is derived from the folder than
    contains the sprites.
    """
    map = StringValue(map).value
    sprite_map = sprite_maps.get(map)
    if not sprite_map:
        log.error("No sprite map found: %s", map)
    if sprite_map:
        return StringValue(sprite_map['*n*'])
    return StringValue(None)


def _sprite_file(map, sprite):
    """
    Returns the relative path (from the images directory) to the original file
    used when construction the sprite. This is suitable for passing to the
    image_width and image_height helpers.
    """
    map = StringValue(map).value
    sprite_name = StringValue(sprite).value
    sprite_map = sprite_maps.get(map)
    sprite = sprite_map and sprite_map.get(sprite_name)
    if not sprite_map:
        log.error("No sprite map found: %s", map)
    elif not sprite:
        log.error("No sprite found: %s in %s", sprite_name, sprite_map['*n*'])
    if sprite:
        return QuotedStringValue(sprite[1][0])
    return StringValue(None)


def _sprites(map):
    map = StringValue(map).value
    sprite_map = sprite_maps.get(map, {})
    return ListValue(sorted(s for s in sprite_map if not s.startswith('*')))


def _sprite(map, sprite, offset_x=None, offset_y=None):
    """
    Returns the image and background position for use in a single shorthand
    property
    """
    map = StringValue(map).value
    sprite_name = StringValue(sprite).value
    sprite_map = sprite_maps.get(map)
    sprite = sprite_map and sprite_map.get(sprite_name)
    if not sprite_map:
        log.error("No sprite map found: %s", map)
    elif not sprite:
        log.error("No sprite found: %s in %s", sprite_name, sprite_map['*n*'])
    if sprite:
        url = '%s%s?_=%s' % (ASSETS_URL, sprite_map['*f*'], sprite_map['*t*'])
        x = NumberValue(offset_x or 0, 'px')
        y = NumberValue(offset_y or 0, 'px')
        if not x or (x <= -1 or x >= 1) and x.unit != '%':
            x -= sprite[2]
        if not y or (y <= -1 or y >= 1) and y.unit != '%':
            y -= sprite[3]
        pos = "url(%s) %s %s" % (escape(url), x, y)
        return StringValue(pos)
    return StringValue('0 0')


def _sprite_url(map):
    """
    Returns a url to the sprite image.
    """
    map = StringValue(map).value
    sprite_map = sprite_maps.get(map)
    if not sprite_map:
        log.error("No sprite map found: %s", map)
    if sprite_map:
        url = '%s%s?_=%s' % (ASSETS_URL, sprite_map['*f*'], sprite_map['*t*'])
        url = "url(%s)" % escape(url)
        return StringValue(url)
    return StringValue(None)


def _sprite_position(map, sprite, offset_x=None, offset_y=None):
    """
    Returns the position for the original image in the sprite.
    This is suitable for use as a value to background-position.
    """
    map = StringValue(map).value
    sprite_name = StringValue(sprite).value
    sprite_map = sprite_maps.get(map)
    sprite = sprite_map and sprite_map.get(sprite_name)
    if not sprite_map:
        log.error("No sprite map found: %s", map)
    elif not sprite:
        log.error("No sprite found: %s in %s", sprite_name, sprite_map['*n*'])
    if sprite:
        x = None
        if offset_x is not None and not isinstance(offset_x, NumberValue):
            x = str(offset_x)
        if x not in ('left', 'right', 'center'):
            if x:
                offset_x = None
            x = NumberValue(offset_x or 0, 'px')
            if not x or (x <= -1 or x >= 1) and x.unit != '%':
                x -= sprite[2]
        y = None
        if offset_y is not None and not isinstance(offset_y, NumberValue):
            y = str(offset_y)
        if y not in ('top', 'bottom', 'center'):
            if y:
                offset_y = None
            y = NumberValue(offset_y or 0, 'px')
            if not y or (y <= -1 or y >= 1) and y.unit != '%':
                y -= sprite[3]
        pos = '%s %s' % (x, y)
        return StringValue(pos)
    return StringValue('0 0')


def _background_noise(intensity=None, opacity=None, size=None, monochrome=False, inline=False):
    if not Image:
        raise Exception("Images manipulation require PIL")

    intensity = intensity and NumberValue(intensity).value
    if not intensity or intensity < 0 or intensity > 1:
        intensity = 0.5

    opacity = opacity and NumberValue(opacity).value
    if not opacity or opacity < 0 or opacity > 1:
        opacity = 0.08

    size = size and int(NumberValue(size).value)
    if not size or size < 1 or size > 512:
        size = 200

    monochrome = bool(monochrome)

    new_image = Image.new(
        mode='RGBA',
        size=(size, size)
    )

    pixdata = new_image.load()
    for i in range(0, int(round(intensity * size ** 2))):
        x = random.randint(1, size)
        y = random.randint(1, size)
        r = random.randint(0, 255)
        a = int(round(random.randint(0, 255) * opacity))
        color = (r, r, r, a) if monochrome else (r, random.randint(0, 255), random.randint(0, 255), a)
        pixdata[x - 1, y - 1] = color

    if not inline:
        key = (intensity, opacity, size, monochrome)
        asset_file = 'noise_%s%sx%s+%s+%s' % ('mono_' if monochrome else '', size, size, to_str(intensity).replace('.', '_'), to_str(opacity).replace('.', '_'))
        asset_file = asset_file + '-' + base64.urlsafe_b64encode(hashlib.md5(repr(key)).digest()).rstrip('=').replace('-', '_')
        asset_file = asset_file + '.png'
        asset_path = os.path.join(ASSETS_ROOT, asset_file)
        try:
            new_image.save(asset_path)
        except IOError:
            log.exception("Error while saving image")
            inline = True  # Retry inline version
        url = '%s%s' % (ASSETS_URL, asset_file)
    if inline:
        output = StringIO()
        new_image.save(output, format='PNG')
        contents = output.getvalue()
        output.close()
        url = 'data:image/png;base64,' + base64.b64encode(contents)

    inline = 'url("%s")' % escape(url)
    return StringValue(inline)


def add_cache_buster(url, mtime):
    fragment = url.split('#')
    query = fragment[0].split('?')
    if len(query) > 1 and query[1] != '':
        cb = '&_=%s' % (mtime)
        url = '?'.join(query) + cb
    else:
        cb = '?_=%s' % (mtime)
        url = query[0] + cb
    if len(fragment) > 1:
        url += '#' + fragment[1]
    return url


def _stylesheet_url(path, only_path=False, cache_buster=True):
    """
    Generates a path to an asset found relative to the project's css directory.
    Passing a true value as the second argument will cause the only the path to
    be returned instead of a `url()` function
    """
    filepath = StringValue(path).value
    if callable(STATIC_ROOT):
        try:
            _file, _storage = list(STATIC_ROOT(filepath))[0]
            d_obj = _storage.modified_time(_file)
            filetime = int(time.mktime(d_obj.timetuple()))
        except:
            filetime = 'NA'
    else:
        _path = os.path.join(STATIC_ROOT, filepath)
        if os.path.exists(_path):
            filetime = int(os.path.getmtime(_path))
        else:
            filetime = 'NA'
    BASE_URL = STATIC_URL

    url = '%s%s' % (BASE_URL, filepath)
    if cache_buster:
        url = add_cache_buster(url, filetime)
    if not only_path:
        url = 'url("%s")' % (url)
    return StringValue(url)


def __font_url(path, only_path=False, cache_buster=True, inline=False):
    filepath = StringValue(path).value
    path = None
    if callable(STATIC_ROOT):
        try:
            _file, _storage = list(STATIC_ROOT(filepath))[0]
            d_obj = _storage.modified_time(_file)
            filetime = int(time.mktime(d_obj.timetuple()))
            if inline:
                path = _storage.open(_file)
        except:
            filetime = 'NA'
    else:
        _path = os.path.join(STATIC_ROOT, filepath)
        if os.path.exists(_path):
            filetime = int(os.path.getmtime(_path))
            if inline:
                path = open(_path, 'rb')
        else:
            filetime = 'NA'
    BASE_URL = STATIC_URL

    if path and inline:
        mime_type = mimetypes.guess_type(filepath)[0]
        url = 'data:' + mime_type + ';base64,' + base64.b64encode(path.read())
    else:
        url = '%s%s' % (BASE_URL, filepath)
        if cache_buster:
            url = add_cache_buster(url, filetime)

    if not only_path:
        url = 'url("%s")' % escape(url)
    return StringValue(url)


def __font_files(args, inline):
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    n = 0
    params = [[], []]
    for arg in args:
        if isinstance(arg, ListValue):
            if len(arg) == 2:
                if n % 2 == 1:
                    params[1].append(None)
                    n += 1
                params[0].append(arg[0])
                params[1].append(arg[1])
                n += 2
            else:
                for arg2 in arg:
                    params[n % 2].append(arg2)
                    n += 1
        else:
            params[n % 2].append(arg)
            n += 1
    len0 = len(params[0])
    len1 = len(params[1])
    if len1 < len0:
        params[1] += [None] * (len0 - len1)
    elif len0 < len1:
        params[0] += [None] * (len1 - len0)
    fonts = []
    for font, format in zip(params[0], params[1]):
        if format:
            fonts.append('%s format("%s")' % (__font_url(font, inline=inline), StringValue(format).value))
        else:
            fonts.append(__font_url(font, inline=inline))
    return ListValue(fonts)


def _font_url(path, only_path=False, cache_buster=True):
    """
    Generates a path to an asset found relative to the project's font directory.
    Passing a true value as the second argument will cause the only the path to
    be returned instead of a `url()` function
    """
    return __font_url(path, only_path, cache_buster, False)


def _font_files(*args):
    return __font_files(args, inline=False)


def _inline_font_files(*args):
    return __font_files(args, inline=True)


def __image_url(path, only_path=False, cache_buster=True, dst_color=None, src_color=None, inline=False, mime_type=None, spacing=None, collapse_x=None, collapse_y=None):
    """
    src_color - a list of or a single color to be replaced by each corresponding dst_color colors
    spacing - spaces to be added to the image
    collapse_x, collapse_y - collapsable (layered) image of the given size (x, y)
    """
    if inline or dst_color or spacing:
        if not Image:
            raise Exception("Images manipulation require PIL")
    filepath = StringValue(path).value
    mime_type = inline and (StringValue(mime_type).value or mimetypes.guess_type(filepath)[0])
    path = None
    if callable(STATIC_ROOT):
        try:
            _file, _storage = list(STATIC_ROOT(filepath))[0]
            d_obj = _storage.modified_time(_file)
            filetime = int(time.mktime(d_obj.timetuple()))
            if inline or dst_color or spacing:
                path = _storage.open(_file)
        except:
            filetime = 'NA'
    else:
        _path = os.path.join(STATIC_ROOT, filepath)
        if os.path.exists(_path):
            filetime = int(os.path.getmtime(_path))
            if inline or dst_color or spacing:
                path = open(_path, 'rb')
        else:
            filetime = 'NA'
    BASE_URL = STATIC_URL
    if path:
        dst_colors = dst_color
        if isinstance(dst_colors, ListValue):
            dst_colors = [list(ColorValue(v).value[:3]) for n, v in dst_colors.items() if v]
        else:
            dst_colors = [list(ColorValue(dst_colors).value[:3])] if dst_colors else []

        src_colors = src_color
        if isinstance(src_colors, ListValue):
            src_colors = [tuple(ColorValue(v).value[:3]) if v else (0, 0, 0) for n, v in src_colors.items()]
        else:
            src_colors = [tuple(ColorValue(src_colors).value[:3]) if src_colors else (0, 0, 0)]

        len_colors = max(len(dst_colors), len(src_colors))
        dst_colors = (dst_colors * len_colors)[:len_colors]
        src_colors = (src_colors * len_colors)[:len_colors]

        if isinstance(spacing, ListValue):
            spacing = [int(NumberValue(v).value) for n, v in spacing.items()]
        else:
            spacing = [int(NumberValue(spacing).value)]
        spacing = (spacing * 4)[:4]

        file_name, file_ext = os.path.splitext(os.path.normpath(filepath).replace('\\', '_').replace('/', '_'))
        key = (filetime, src_color, dst_color, spacing)
        key = file_name + '-' + base64.urlsafe_b64encode(hashlib.md5(repr(key)).digest()).rstrip('=').replace('-', '_')
        asset_file = key + file_ext
        asset_path = os.path.join(ASSETS_ROOT, asset_file)

        if os.path.exists(asset_path):
            filepath = asset_file
            BASE_URL = ASSETS_URL
            if inline:
                path = open(asset_path, 'rb')
                url = 'data:' + mime_type + ';base64,' + base64.b64encode(path.read())
            else:
                url = '%s%s' % (BASE_URL, filepath)
                if cache_buster:
                    filetime = int(os.path.getmtime(asset_path))
                    url = add_cache_buster(url, filetime)
        else:
            image = Image.open(path)
            width, height = collapse_x or image.size[0], collapse_y or image.size[1]
            new_image = Image.new(
                mode='RGBA',
                size=(width + spacing[1] + spacing[3], height + spacing[0] + spacing[2]),
                color=(0, 0, 0, 0)
            )
            for i, dst_color in enumerate(dst_colors):
                src_color = src_colors[i]
                pixdata = image.load()
                for _y in xrange(image.size[1]):
                    for _x in xrange(image.size[0]):
                        pixel = pixdata[_x, _y]
                        if pixel[:3] == src_color:
                            pixdata[_x, _y] = tuple([int(c) for c in dst_color] + [pixel[3] if len(pixel) == 4 else 255])
            iwidth, iheight = image.size
            if iwidth != width or iheight != height:
                cy = 0
                while cy < iheight:
                    cx = 0
                    while cx < iwidth:
                        cropped_image = image.crop((cx, cy, cx + width, cy + height))
                        new_image.paste(cropped_image, (int(spacing[3]), int(spacing[0])), cropped_image)
                        cx += width
                    cy += height
            else:
                new_image.paste(image, (int(spacing[3]), int(spacing[0])))

            if not inline:
                try:
                    new_image.save(asset_path)
                    filepath = asset_file
                    BASE_URL = ASSETS_URL
                    if cache_buster:
                        filetime = int(os.path.getmtime(asset_path))
                except IOError:
                    log.exception("Error while saving image")
                    inline = True  # Retry inline version
                url = '%s%s' % (ASSETS_URL, asset_file)
                if cache_buster:
                    url = add_cache_buster(url, filetime)
            if inline:
                output = StringIO()
                new_image.save(output, format='PNG')
                contents = output.getvalue()
                output.close()
                url = 'data:' + mime_type + ';base64,' + base64.b64encode(contents)
    else:
        url = '%s%s' % (BASE_URL, filepath)
        if cache_buster:
            url = add_cache_buster(url, filetime)

    if not only_path:
        url = 'url("%s")' % escape(url)
    return StringValue(url)


def _inline_image(image, mime_type=None, dst_color=None, src_color=None, spacing=None, collapse_x=None, collapse_y=None):
    """
    Embeds the contents of a file directly inside your stylesheet, eliminating
    the need for another HTTP request. For small files such images or fonts,
    this can be a performance benefit at the cost of a larger generated CSS
    file.
    """
    return __image_url(image, False, False, dst_color, src_color, True, mime_type, spacing, collapse_x, collapse_y)


def _image_url(path, only_path=False, cache_buster=True, dst_color=None, src_color=None, spacing=None, collapse_x=None, collapse_y=None):
    """
    Generates a path to an asset found relative to the project's images
    directory.
    Passing a true value as the second argument will cause the only the path to
    be returned instead of a `url()` function
    """
    return __image_url(path, only_path, cache_buster, dst_color, src_color, False, None, spacing, collapse_x, collapse_y)


def _image_width(image):
    """
    Returns the width of the image found at the path supplied by `image`
    relative to your project's images directory.
    """
    if not Image:
        raise Exception("Images manipulation require PIL")
    file = StringValue(image).value
    path = None
    try:
        width = sprite_images[file][0]
    except KeyError:
        width = 0
        if callable(STATIC_ROOT):
            try:
                _file, _storage = list(STATIC_ROOT(file))[0]
                path = _storage.open(_file)
            except:
                pass
        else:
            _path = os.path.join(STATIC_ROOT, file)
            if os.path.exists(_path):
                path = open(_path, 'rb')
        if path:
            image = Image.open(path)
            size = image.size
            width = size[0]
            sprite_images[file] = size
    return NumberValue(width, 'px')


def _image_height(image):
    """
    Returns the height of the image found at the path supplied by `image`
    relative to your project's images directory.
    """
    if not Image:
        raise Exception("Images manipulation require PIL")
    file = StringValue(image).value
    path = None
    try:
        height = sprite_images[file][1]
    except KeyError:
        height = 0
        if callable(STATIC_ROOT):
            try:
                _file, _storage = list(STATIC_ROOT(file))[0]
                path = _storage.open(_file)
            except:
                pass
        else:
            _path = os.path.join(STATIC_ROOT, file)
            if os.path.exists(_path):
                path = open(_path, 'rb')
        if path:
            image = Image.open(path)
            size = image.size
            height = size[1]
            sprite_images[file] = size
    return NumberValue(height, 'px')


################################################################################


def __position(opposite, p):
    pos = []
    hrz = vrt = None
    nums = [v for v in p if isinstance(v, NumberValue)]

    if 'left' in p:
        hrz = 'right' if opposite else 'left'
    elif 'right' in p:
        hrz = 'left' if opposite else 'right'
    elif 'center' in p:
        hrz = 'center'

    if 'top' in p:
        vrt = 'bottom' if opposite else 'top'
    elif 'bottom' in p:
        vrt = 'top' if opposite else 'bottom'
    elif 'center' in p:
        hrz = 'center'

    if hrz == vrt:
        vrt = None

    if hrz is not None:
        pos.append(hrz)
    elif len(nums):
        pos.append(nums.pop(0))
    if vrt is not None:
        pos.append(vrt)
    elif len(nums):
        pos.append(nums.pop(0))
    return ListValue(pos + nums)


def _position(p):
    return __position(False, p)


def _opposite_position(p):
    return __position(True, p)


def _grad_point(*p):
    pos = set()
    hrz = vrt = NumberValue(0.5, '%')
    for _p in p:
        pos.update(StringValue(_p).value.split())
    if 'left' in pos:
        hrz = NumberValue(0, '%')
    elif 'right' in pos:
        hrz = NumberValue(1, '%')
    if 'top' in pos:
        vrt = NumberValue(0, '%')
    elif 'bottom' in pos:
        vrt = NumberValue(1, '%')
    return ListValue(v for v in (hrz, vrt) if v is not None)


################################################################################


def __compass_list(*args):
    separator = None
    if len(args) == 1 and isinstance(args[0], (list, tuple, ListValue)):
        args = ListValue(args[0]).values()
    else:
        separator = ','
    ret = ListValue(args)
    if separator:
        ret['_'] = separator
    return ret


def __compass_space_list(*lst):
    """
    If the argument is a list, it will return a new list that is space delimited
    Otherwise it returns a new, single element, space-delimited list.
    """
    ret = __compass_list(*lst)
    ret.value.pop('_', None)
    return ret


def _blank(*objs):
    """Returns true when the object is false, an empty string, or an empty list"""
    for o in objs:
        if bool(o):
            return BooleanValue(False)
    return BooleanValue(True)


def _compact(*args):
    """Returns a new list after removing any non-true values"""
    ret = {}
    if len(args) == 1:
        args = args[0]
        if isinstance(args, ListValue):
            args = args.value
        if isinstance(args, dict):
            for i, item in args.items():
                if False if isinstance(item, basestring) and _undefined_re.match(item) else bool(item):
                    ret[i] = item
        elif False if isinstance(args, basestring) and _undefined_re.match(args) else bool(args):
            ret[0] = args
    else:
        ret['_'] = ','
        for i, item in enumerate(args):
            if False if isinstance(item, basestring) and _undefined_re.match(item) else bool(item):
                ret[i] = item
    if isinstance(args, ListValue):
        args = args.value
    if isinstance(args, dict):
        separator = args.get('_', None)
        if separator is not None:
            ret['_'] = separator
    return ListValue(ret)


def _reject(lst, *values):
    """Removes the given values from the list"""
    ret = {}
    if not isinstance(lst, ListValue):
        lst = ListValue(lst)
    lst = lst.value
    if len(values) == 1:
        values = values[0]
        if isinstance(values, ListValue):
            values = values.value.values()
    for i, item in lst.items():
        if item not in values:
            ret[i] = item
    separator = lst.get('_', None)
    if separator is not None:
        ret['_'] = separator
    return ListValue(ret)


def __compass_slice(lst, start_index, end_index=None):
    start_index = NumberValue(start_index).value
    end_index = NumberValue(end_index).value if end_index is not None else None
    ret = {}
    lst = ListValue(lst).value
    for i, item in lst.items():
        if not isinstance(i, int):
            if i == '_':
                ret[i] = item
        elif i > start_index and end_index is None or i <= end_index:
            ret[i] = item
    return ListValue(ret)


def _first_value_of(*lst):
    if len(lst) == 1 and isinstance(lst[0], (list, tuple, ListValue)):
        lst = ListValue(lst[0])
    ret = ListValue(lst).first()
    return ret.__class__(ret)


def _nth(lst, n=1):
    """
    Return the Nth item in the string
    """
    n = StringValue(n).value
    lst = ListValue(lst).value
    try:
        n = int(float(n)) - 1
        n = n % len(lst)
    except:
        if n.lower() == 'first':
            n = 0
        elif n.lower() == 'last':
            n = -1
    try:
        ret = lst[n]
    except KeyError:
        lst = [v for k, v in sorted(lst.items()) if isinstance(k, int)]
        try:
            ret = lst[n]
        except:
            ret = ''
    return ret.__class__(ret)


def _join(lst1, lst2, separator=None):
    ret = ListValue(lst1)
    lst2 = ListValue(lst2).value
    lst_len = len(ret.value)
    ret.value.update((k + lst_len if isinstance(k, int) else k, v) for k, v in lst2.items())
    if separator is not None:
        separator = StringValue(separator).value
        if separator:
            ret.value['_'] = separator
    return ret


def _length(*lst):
    if len(lst) == 1 and isinstance(lst[0], (list, tuple, ListValue)):
        lst = ListValue(lst[0]).values()
    lst = ListValue(lst)
    return NumberValue(len(lst))


def _max(*lst):
    if len(lst) == 1 and isinstance(lst[0], (list, tuple, ListValue)):
        lst = ListValue(lst[0]).values()
    lst = ListValue(lst).value
    return max(lst.values())


def _min(*lst):
    if len(lst) == 1 and isinstance(lst[0], (list, tuple, ListValue)):
        lst = ListValue(lst[0]).values()
    lst = ListValue(lst).value
    return min(lst.values())


def _append(lst, val, separator=None):
    separator = separator and StringValue(separator).value
    ret = ListValue(lst, separator)
    val = ListValue(val)
    for v in val:
        ret.value[len(ret)] = v
    return ret


################################################################################


def _prefixed(prefix, *args):
    to_fnct_str = 'to_' + to_str(prefix).replace('-', '_')
    for arg in args:
        if isinstance(arg, ListValue):
            for k, iarg in arg.value.items():
                if hasattr(iarg, to_fnct_str):
                    return BooleanValue(True)
        else:
            if hasattr(arg, to_fnct_str):
                return BooleanValue(True)
    return BooleanValue(False)


def _prefix(prefix, *args):
    to_fnct_str = 'to_' + to_str(prefix).replace('-', '_')
    args = list(args)
    for i, arg in enumerate(args):
        if isinstance(arg, ListValue):
            _value = {}
            for k, iarg in arg.value.items():
                to_fnct = getattr(iarg, to_fnct_str, None)
                if to_fnct:
                    _value[k] = to_fnct()
                else:
                    _value[k] = iarg
            args[i] = ListValue(_value)
        else:
            to_fnct = getattr(arg, to_fnct_str, None)
            if to_fnct:
                args[i] = to_fnct()
    if len(args) == 1:
        return args[0]
    return ListValue(args, ',')


def __moz(*args):
    return _prefix('_moz', *args)


def __svg(*args):
    return _prefix('_svg', *args)


def __css2(*args):
    return _prefix('_css2', *args)


def __pie(*args):
    return _prefix('_pie', *args)


def __webkit(*args):
    return _prefix('_webkit', *args)


def __owg(*args):
    return _prefix('_owg', *args)


def __khtml(*args):
    return _prefix('_khtml', *args)


def __ms(*args):
    return _prefix('_ms', *args)


def __o(*args):
    return _prefix('_o', *args)

################################################################################


def _percentage(value):
    value = NumberValue(value)
    value.units = {'%': _units_weights.get('%', 1), '_': '%'}
    return value


def _unitless(value):
    value = NumberValue(value)
    return BooleanValue(not bool(value.unit))


def _unquote(*args):
    return StringValue(' '.join([StringValue(s).value for s in args]))


def _quote(*args):
    return QuotedStringValue(' '.join([StringValue(s).value for s in args]))


def _pi():
    return NumberValue(math.pi)


def _comparable(number1, number2):
    n1, n2 = NumberValue(number1), NumberValue(number2)
    type1 = _conv_type.get(n1.unit)
    type2 = _conv_type.get(n2.unit)
    return BooleanValue(type1 == type2)


def _type_of(obj):  # -> bool, number, string, color, list
    if isinstance(obj, BooleanValue):
        return StringValue('bool')
    if isinstance(obj, NumberValue):
        return StringValue('number')
    if isinstance(obj, ColorValue):
        return StringValue('color')
    if isinstance(obj, ListValue):
        return StringValue('list')
    if isinstance(obj, basestring) and _variable_re.match(obj):
        return StringValue('undefined')
    return StringValue('string')


def _if(condition, if_true, if_false=''):
    condition = bool(False if not condition or isinstance(condition, basestring) and (condition in ('0', 'false', 'undefined') or _variable_re.match(condition)) else condition)
    return if_true.__class__(if_true) if condition else if_true.__class__(if_false)


def _unit(number):  # -> px, em, cm, etc.
    unit = NumberValue(number).unit
    return StringValue(unit)


__elements_of_type_block = 'address, article, aside, blockquote, center, dd, details, dir, div, dl, dt, fieldset, figcaption, figure, footer, form, frameset, h1, h2, h3, h4, h5, h6, header, hgroup, hr, isindex, menu, nav, noframes, noscript, ol, p, pre, section, summary, ul'
__elements_of_type_inline = 'a, abbr, acronym, audio, b, basefont, bdo, big, br, canvas, cite, code, command, datalist, dfn, em, embed, font, i, img, input, kbd, keygen, label, mark, meter, output, progress, q, rp, rt, ruby, s, samp, select, small, span, strike, strong, sub, sup, textarea, time, tt, u, var, video, wbr'
__elements_of_type_table = 'table'
__elements_of_type_list_item = 'li'
__elements_of_type_table_row_group = 'tbody'
__elements_of_type_table_header_group = 'thead'
__elements_of_type_table_footer_group = 'tfoot'
__elements_of_type_table_row = 'tr'
__elements_of_type_table_cel = 'td, th'
__elements_of_type_html5_block = 'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section, summary'
__elements_of_type_html5_inline = 'audio, canvas, command, datalist, embed, keygen, mark, meter, output, progress, rp, rt, ruby, time, video, wbr'
__elements_of_type_html5 = 'article, aside, audio, canvas, command, datalist, details, embed, figcaption, figure, footer, header, hgroup, keygen, mark, menu, meter, nav, output, progress, rp, rt, ruby, section, summary, time, video, wbr'
__elements_of_type = {
    'block': dict(enumerate(sorted(__elements_of_type_block.replace(' ', '').split(',')))),
    'inline': dict(enumerate(sorted(__elements_of_type_inline.replace(' ', '').split(',')))),
    'table': dict(enumerate(sorted(__elements_of_type_table.replace(' ', '').split(',')))),
    'list-item': dict(enumerate(sorted(__elements_of_type_list_item.replace(' ', '').split(',')))),
    'table-row-group': dict(enumerate(sorted(__elements_of_type_table_row_group.replace(' ', '').split(',')))),
    'table-header-group': dict(enumerate(sorted(__elements_of_type_table_header_group.replace(' ', '').split(',')))),
    'table-footer-group': dict(enumerate(sorted(__elements_of_type_table_footer_group.replace(' ', '').split(',')))),
    'table-row': dict(enumerate(sorted(__elements_of_type_table_footer_group.replace(' ', '').split(',')))),
    'table-cell': dict(enumerate(sorted(__elements_of_type_table_footer_group.replace(' ', '').split(',')))),
    'html5-block': dict(enumerate(sorted(__elements_of_type_html5_block.replace(' ', '').split(',')))),
    'html5-inline': dict(enumerate(sorted(__elements_of_type_html5_inline.replace(' ', '').split(',')))),
    'html5': dict(enumerate(sorted(__elements_of_type_html5.replace(' ', '').split(',')))),
}


def _elements_of_type(display):
    d = StringValue(display)
    ret = __elements_of_type.get(d.value, None)
    if ret is None:
        raise Exception("Elements of type '%s' not found!" % d.value)
    ret['_'] = ','
    return ListValue(ret)


def _nest(*arguments):
    if isinstance(arguments[0], ListValue):
        lst = arguments[0].values()
    else:
        lst = StringValue(arguments[0]).value.split(',')
    ret = [s.strip() for s in lst if s.strip()]
    for arg in arguments[1:]:
        if isinstance(arg, ListValue):
            lst = arg.values()
        else:
            lst = StringValue(arg).value.split(',')
        new_ret = []
        for s in lst:
            s = s.strip()
            if s:
                for r in ret:
                    new_ret.append(r + ' ' + s)
        ret = new_ret
    ret = sorted(set(ret))
    ret = dict(enumerate(ret))
    ret['_'] = ','
    return ret


def _append_selector(selector, to_append):
    if isinstance(selector, ListValue):
        lst = selector.values()
    else:
        lst = StringValue(selector).value.split(',')
    to_append = StringValue(to_append).value.strip()
    ret = sorted(set(s.strip() + to_append for s in lst if s.strip()))
    ret = dict(enumerate(ret))
    ret['_'] = ','
    return ret


def _headers(frm=None, to=None):
    if frm and to is None:
        if isinstance(frm, StringValue) and frm.value.lower() == 'all':
            frm = 1
            to = 6
        else:
            frm = 1
            try:
                to = int(getattr(frm, 'value', frm))
            except ValueError:
                to = 6
    else:
        try:
            frm = 1 if frm is None else int(getattr(frm, 'value', frm))
        except ValueError:
            frm = 1
        try:
            to = 6 if to is None else int(getattr(to, 'value', to))
        except ValueError:
            to = 6
    ret = ['h' + str(i) for i in range(frm, to + 1)]
    ret = dict(enumerate(ret))
    ret['_'] = ','
    return ret


def _enumerate(prefix, frm, through, separator='-'):
    prefix = StringValue(prefix).value
    separator = StringValue(separator).value
    try:
        frm = int(getattr(frm, 'value', frm))
    except ValueError:
        frm = 1
    try:
        through = int(getattr(through, 'value', through))
    except ValueError:
        through = frm
    if frm > through:
        frm, through = through, frm
        rev = reversed
    else:
        rev = lambda x: x
    if prefix:
        ret = [prefix + separator + str(i) for i in rev(range(frm, through + 1))]
    else:
        ret = [NumberValue(i) for i in rev(range(frm, through + 1))]
    ret = dict(enumerate(ret))
    ret['_'] = ','
    return ret


def _range(frm, through=None):
    if through is None:
        through = frm
        frm = 1
    return _enumerate(None, frm, through)


################################################################################
# Specific to pyScss parser functions:


def _convert_to(value, type):
    return value.convert_to(type)


def _inv(sign, value):
    if isinstance(value, NumberValue):
        return value * -1
    elif isinstance(value, BooleanValue):
        return not value
    val = StringValue(value)
    val.value = sign + val.value
    return val


################################################################################
# pyScss data types:


class ParserValue(object):
    def __init__(self, value):
        self.value = value


class Value(object):
    @staticmethod
    def _operatorOperands(tokenlist):
        "generator to extract operators and operands in pairs"
        it = iter(tokenlist)
        while 1:
            try:
                yield (it.next(), it.next())
            except StopIteration:
                break

    @staticmethod
    def _merge_type(a, b):
        if a.__class__ == b.__class__:
            return a.__class__
        if isinstance(a, QuotedStringValue) or isinstance(b, QuotedStringValue):
            return QuotedStringValue
        return StringValue

    @staticmethod
    def _wrap(fn):
        """
        Wrapper function to allow calling any function
        using Value objects as parameters.
        """
        def _func(*args):
            merged = None
            _args = []
            for arg in args:
                if merged.__class__ != arg.__class__:
                    if merged is None:
                        merged = arg.__class__(None)
                    else:
                        merged = Value._merge_type(merged, arg)(None)
                merged.merge(arg)
                if isinstance(arg, Value):
                    arg = arg.value
                _args.append(arg)
            merged.value = fn(*_args)
            return merged
        return _func

    @classmethod
    def _do_bitops(cls, first, second, op):
        first = StringValue(first)
        second = StringValue(second)
        k = op(first.value, second.value)
        return first if first.value == k else second

    def __repr__(self):
        return '<%s: %s>' % (self.__class__.__name__, repr(self.value))

    def __lt__(self, other):
        return self._do_cmps(self, other, operator.__lt__)

    def __le__(self, other):
        return self._do_cmps(self, other, operator.__le__)

    def __eq__(self, other):
        return self._do_cmps(self, other, operator.__eq__)

    def __ne__(self, other):
        return self._do_cmps(self, other, operator.__ne__)

    def __gt__(self, other):
        return self._do_cmps(self, other, operator.__gt__)

    def __ge__(self, other):
        return self._do_cmps(self, other, operator.__ge__)

    def __cmp__(self, other):
        return self._do_cmps(self, other, operator.__cmp__)

    def __rcmp__(self, other):
        return self._do_cmps(other, self, operator.__cmp__)

    def __and__(self, other):
        return self._do_bitops(self, other, operator.__and__)

    def __or__(self, other):
        return self._do_bitops(self, other, operator.__or__)

    def __xor__(self, other):
        return self._do_bitops(self, other, operator.__xor__)

    def __rand__(self, other):
        return self._do_bitops(other, self, operator.__rand__)

    def __ror__(self, other):
        return self._do_bitops(other, self, operator.__ror__)

    def __rxor__(self, other):
        return self._do_bitops(other, self, operator.__rxor__)

    def __nonzero__(self):
        return bool(self.value)

    def __add__(self, other):
        return self._do_op(self, other, operator.__add__)

    def __radd__(self, other):
        return self._do_op(other, self, operator.__add__)

    def __div__(self, other):
        return self._do_op(self, other, operator.__div__)

    def __rdiv__(self, other):
        return self._do_op(other, self, operator.__div__)

    def __sub__(self, other):
        return self._do_op(self, other, operator.__sub__)

    def __rsub__(self, other):
        return self._do_op(other, self, operator.__sub__)

    def __mul__(self, other):
        return self._do_op(self, other, operator.__mul__)

    def __rmul__(self, other):
        return self._do_op(other, self, operator.__mul__)

    def convert_to(self, type):
        return self.value.convert_to(type)

    def merge(self, obj):
        if isinstance(obj, Value):
            self.value = obj.value
        else:
            self.value = obj
        return self


class BooleanValue(Value):
    def __init__(self, tokens):
        self.tokens = tokens
        if tokens is None:
            self.value = False
        elif isinstance(tokens, ParserValue):
            self.value = (tokens.value.lower() == 'true')
        elif isinstance(tokens, BooleanValue):
            self.value = tokens.value
        elif isinstance(tokens, NumberValue):
            self.value = bool(tokens.value)
        elif isinstance(tokens, (float, int)):
            self.value = bool(tokens)
        else:
            self.value = to_str(tokens).lower() in ('true', '1', 'on', 'yes', 't', 'y') or bool(tokens)

    def __hash__(self):
        return hash(self.value)

    def __str__(self):
        return 'true' if self.value else 'false'

    @classmethod
    def _do_cmps(cls, first, second, op):
        first = first.value if isinstance(first, Value) else first
        second = second.value if isinstance(second, Value) else second
        if first in ('true', '1', 'on', 'yes', 't', 'y'):
            first = True
        elif first in ('false', '0', 'off', 'no', 'f', 'n', 'undefined'):
            first = False
        if second in ('true', '1', 'on', 'yes', 't', 'y'):
            second = True
        elif second in ('false', '0', 'off', 'no', 'f', 'n', 'undefined'):
            second = False
        return op(first, second)

    @classmethod
    def _do_op(cls, first, second, op):
        if isinstance(first, ListValue) and isinstance(second, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                try:
                    ret.value[k] = op(ret.value[k], second.value[k])
                except KeyError:
                    pass
            return ret
        if isinstance(first, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                ret.value[k] = op(ret.value[k], second)
            return ret
        if isinstance(second, ListValue):
            ret = ListValue(second)
            for k, v in ret.items():
                ret.value[k] = op(first, ret.value[k])
            return ret

        first = BooleanValue(first)
        second = BooleanValue(second)
        val = op(first.value, second.value)
        ret = BooleanValue(None).merge(first).merge(second)
        ret.value = val
        return ret

    def merge(self, obj):
        obj = BooleanValue(obj)
        self.value = obj.value
        return self


class NumberValue(Value):
    def __init__(self, tokens, type=None):
        self.tokens = tokens
        self.units = {}
        if tokens is None:
            self.value = 0.0
        elif isinstance(tokens, ParserValue):
            self.value = float(tokens.value)
        elif isinstance(tokens, NumberValue):
            self.value = tokens.value
            self.units = tokens.units.copy()
            if tokens.units:
                type = None
        elif isinstance(tokens, (StringValue, basestring)):
            tokens = getattr(tokens, 'value', tokens)
            if _undefined_re.match(tokens):
                raise ValueError("Value is not a Number! (%s)" % tokens)
            try:
                if tokens and tokens[-1] == '%':
                    self.value = to_float(tokens[:-1]) / 100.0
                    self.units = {'%': _units_weights.get('%', 1), '_': '%'}
                else:
                    self.value = to_float(tokens)
            except ValueError:
                raise ValueError("Value is not a Number! (%s)" % tokens)
        elif isinstance(tokens, (int, float)):
            self.value = float(tokens)
        elif isinstance(tokens, (list, tuple)):
            raise ValueError("Value is not a Number! (%r)" % list(tokens))
        elif isinstance(tokens, (dict, ListValue)):
            raise ValueError("Value is not a Number! (%r)" % tokens.values())
        else:
            raise ValueError("Value is not a Number! (%s)" % tokens)
        if type is not None:
            self.units = {type: _units_weights.get(type, 1), '_': type}

    def __hash__(self):
        return hash((self.value, frozenset(self.units.items())))

    def __repr__(self):
        return '<%s: %s, %s>' % (self.__class__.__name__, repr(self.value), repr(self.units))

    def __int__(self):
        return int(self.value)

    def __float__(self):
        return float(self.value)

    def __str__(self):
        unit = self.unit
        val = self.value / _conv_factor.get(unit, 1.0)
        val = to_str(val) + unit
        return val

    @classmethod
    def _do_cmps(cls, first, second, op):
        try:
            first = NumberValue(first)
            second = NumberValue(second)
        except ValueError:
            return op(getattr(first, 'value', first), getattr(second, 'value', second))
        first_type = _conv_type.get(first.unit)
        second_type = _conv_type.get(second.unit)
        if first_type == second_type or first_type is None or second_type is None:
            return op(first.value, second.value)
        else:
            return op(first_type, second_type)

    @classmethod
    def _do_op(cls, first, second, op):
        if isinstance(first, ListValue) and isinstance(second, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                try:
                    ret.value[k] = op(ret.value[k], second.value[k])
                except KeyError:
                    pass
            return ret
        if isinstance(first, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                ret.value[k] = op(ret.value[k], second)
            return ret
        if isinstance(second, ListValue):
            ret = ListValue(second)
            for k, v in ret.items():
                ret.value[k] = op(first, ret.value[k])
            return ret

        if isinstance(first, basestring):
            first = StringValue(first)
        elif isinstance(first, (int, float)):
            first = NumberValue(first)
        if isinstance(second, basestring):
            second = StringValue(second)
        elif isinstance(second, (int, float)):
            second = NumberValue(second)

        if op in (operator.__div__, operator.__sub__):
            if isinstance(first, QuotedStringValue):
                first = NumberValue(first)
            if isinstance(second, QuotedStringValue):
                second = NumberValue(second)
        elif op == operator.__mul__:
            if isinstance(first, NumberValue) and isinstance(second, QuotedStringValue):
                first.value = int(first.value)
                val = op(second.value, first.value)
                return second.__class__(val)
            if isinstance(first, QuotedStringValue) and isinstance(second, NumberValue):
                second.value = int(second.value)
                val = op(first.value, second.value)
                return first.__class__(val)

        if not isinstance(first, NumberValue) or not isinstance(second, NumberValue):
            return op(first.value if isinstance(first, NumberValue) else first, second.value if isinstance(second, NumberValue) else second)

        first_unit = first.unit
        second_unit = second.unit
        if op == operator.__add__ or op == operator.__sub__:
            if first_unit == '%' and not second_unit:
                second.units = {'%': _units_weights.get('%', 1), '_': '%'}
                second.value /= 100.0
            elif first_unit == '%' and second_unit != '%':
                first = NumberValue(second) * first.value
            elif second_unit == '%' and not first_unit:
                first.units = {'%': _units_weights.get('%', 1), '_': '%'}
                first.value /= 100.0
            elif second_unit == '%' and first_unit != '%':
                second = NumberValue(first) * second.value

        val = op(first.value, second.value)

        ret = NumberValue(None).merge(first)
        ret = ret.merge(second)
        ret.value = val
        return ret

    def merge(self, obj):
        obj = NumberValue(obj)
        self.value = obj.value
        for unit, val in obj.units.items():
            if unit != '_':
                self.units.setdefault(unit, 0)
                self.units[unit] += val
        unit = obj.unit
        if _units_weights.get(self.units.get('_'), 1) <= _units_weights.get(unit, 1):
            self.units['_'] = unit
        return self

    def convert_to(self, type):
        val = self.value
        if not self.unit:
            val *= _conv_factor.get(type, 1.0)
        ret = NumberValue(val)
        if type == 'deg':
            ret.value = ret.value % 360.0
        ret.units = {type: _units_weights.get(type, 1), '_': type}
        return ret

    @property
    def unit(self):
        unit = ''
        if self.units:
            if '_'in self.units:
                units = self.units.copy()
                _unit = units.pop('_')
                units.setdefault(_unit, 0)
                units[_unit] += _units_weights.get(_unit, 1)  # Give more weight to the first unit ever set
            else:
                units = self.units
            units = sorted(units, key=units.get)
            while len(units):
                unit = units.pop()
                if unit:
                    break
        return unit


class ListValue(Value):
    def __init__(self, tokens, separator=None):
        self.tokens = tokens
        if tokens is None:
            self.value = {}
        elif isinstance(tokens, ParserValue):
            self.value = self._reorder_list(tokens.value)
        elif isinstance(tokens, ListValue):
            self.value = tokens.value.copy()
        elif isinstance(tokens, Value):
            self.value = {0: tokens}
        elif isinstance(tokens, dict):
            self.value = self._reorder_list(tokens)
        elif isinstance(tokens, (list, tuple)):
            self.value = dict(enumerate(tokens))
        else:
            if isinstance(tokens, StringValue):
                tokens = tokens.value
            tokens = to_str(tokens)
            lst = [i for i in tokens.split() if i]
            if len(lst) == 1:
                lst = [i.strip() for i in lst[0].split(',') if i.strip()]
                if len(lst) > 1:
                    separator = ',' if separator is None else separator
                else:
                    lst = [tokens]
            self.value = dict(enumerate(lst))
        if separator is None:
            separator = self.value.pop('_', None)
        if separator:
            self.value['_'] = separator

    def __hash__(self):
        return hash((frozenset(self.value.items())))

    @classmethod
    def _do_cmps(cls, first, second, op):
        try:
            first = ListValue(first)
            second = ListValue(second)
        except ValueError:
            return op(getattr(first, 'value', first), getattr(second, 'value', second))
        return op(first.value, second.value)

    @classmethod
    def _do_op(cls, first, second, op):
        if isinstance(first, ListValue) and isinstance(second, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                try:
                    ret.value[k] = op(ret.value[k], second.value[k])
                except KeyError:
                    pass
            return ret
        if isinstance(first, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                ret.value[k] = op(ret.value[k], second)
            return ret
        if isinstance(second, ListValue):
            ret = ListValue(second)

            for k, v in ret.items():
                ret.value[k] = op(first, ret.value[k])
            return ret

    def _reorder_list(self, lst):
        return dict((i if isinstance(k, int) else k, v) for i, (k, v) in enumerate(sorted(lst.items())))

    def __nonzero__(self):
        return len(self)

    def __len__(self):
        return len(self.value) - (1 if '_' in self.value else 0)

    def __str__(self):
        return to_str(self.value)

    def __tuple__(self):
        return tuple(sorted((k, v) for k, v in self.value.items() if k != '_'))

    def __iter__(self):
        return iter(self.values())

    def values(self):
        return zip(*self.items())[1]

    def keys(self):
        return zip(*self.items())[1]

    def items(self):
        return sorted((k, v) for k, v in self.value.items() if k != '_')

    def first(self):
        for v in self.values():
            if isinstance(v, basestring) and _undefined_re.match(v):
                continue
            if bool(v):
                return v
        return v


class ColorValue(Value):
    def __init__(self, tokens):
        self.tokens = tokens
        self.value = (0, 0, 0, 1)
        self.types = {}
        if tokens is None:
            self.value = (0, 0, 0, 1)
        elif isinstance(tokens, ParserValue):
            hex = tokens.value
            self.value = hex2rgba[len(hex)](hex)
            self.types = {'rgba': 1}
        elif isinstance(tokens, ColorValue):
            self.value = tokens.value
            self.types = tokens.types.copy()
        elif isinstance(tokens, NumberValue):
            val = tokens.value
            self.value = (val, val, val, 1)
        elif isinstance(tokens, (list, tuple)):
            c = tokens[:4]
            r = 255.0, 255.0, 255.0, 1.0
            c = [0.0 if c[i] < 0 else r[i] if c[i] > r[i] else c[i] for i in range(4)]
            self.value = tuple(c)
            type = tokens[-1]
            if type in ('rgb', 'rgba', 'hsl', 'hsla'):
                self.types = {type: 1}
        elif isinstance(tokens, (int, float)):
            val = float(tokens)
            self.value = (val, val, val, 1)
        else:
            if isinstance(tokens, StringValue):
                tokens = tokens.value
            tokens = to_str(tokens)
            tokens.replace(' ', '').lower()
            if _undefined_re.match(tokens):
                raise ValueError("Value is not a Color! (%s)" % tokens)
            try:
                self.value = hex2rgba[len(tokens)](tokens)
            except:
                try:
                    val = to_float(tokens)
                    self.value = (val, val, val, 1)
                except ValueError:
                    try:
                        type, _, colors = tokens.partition('(')
                        colors = colors.rstrip(')')
                        if type in ('rgb', 'rgba'):
                            c = tuple(colors.split(','))
                            try:
                                c = [to_float(c[i]) for i in range(4)]
                                col = [0.0 if c[i] < 0 else 255.0 if c[i] > 255 else c[i] for i in range(3)]
                                col += [0.0 if c[3] < 0 else 1.0 if c[3] > 1 else c[3]]
                                self.value = tuple(col)
                                self.types = {type: 1}
                            except:
                                raise ValueError("Value is not a Color! (%s)" % tokens)
                        elif type in ('hsl', 'hsla'):
                            c = colors.split(',')
                            try:
                                c = [to_float(c[i]) for i in range(4)]
                                col = [c[0] % 360.0] / 360.0
                                col += [0.0 if c[i] < 0 else 1.0 if c[i] > 1 else c[i] for i in range(1, 4)]
                                self.value = tuple([c * 255.0 for c in colorsys.hls_to_rgb(col[0], 0.999999 if col[2] == 1 else col[2], 0.999999 if col[1] == 1 else col[1])] + [col[3]])
                                self.types = {type: 1}
                            except:
                                raise ValueError("Value is not a Color! (%s)" % tokens)
                        else:
                            raise ValueError("Value is not a Color! (%s)" % tokens)
                    except:
                        raise ValueError("Value is not a Color! (%s)" % tokens)

    def __hash__(self):
        return hash((tuple(self.value), frozenset(self.types.items())))

    def __repr__(self):
        return '<%s: %s, %s>' % (self.__class__.__name__, repr(self.value), repr(self.types))

    def __str__(self):
        type = self.type
        c = self.value
        if type == 'hsl' or type == 'hsla' and c[3] == 1:
            h, l, s = colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0)
            return 'hsl(%s, %s%%, %s%%)' % (to_str(h * 360.0), to_str(s * 100.0), to_str(l * 100.0))
        if type == 'hsla':
            h, l, s = colorsys.rgb_to_hls(c[0] / 255.0, c[1] / 255.0, c[2] / 255.0)
            return 'hsla(%s, %s%%, %s%%, %s)' % (to_str(h * 360.0), to_str(s * 100.0), to_str(l * 100.0), to_str(c[3]))
        r, g, b = to_str(c[0]), to_str(c[1]), to_str(c[2])
        _, _, r = r.partition('.')
        _, _, g = g.partition('.')
        _, _, b = b.partition('.')
        if c[3] == 1:
            if len(r) > 2 or len(g) > 2 or len(b) > 2:
                return 'rgb(%s%%, %s%%, %s%%)' % (to_str(c[0] * 100.0 / 255.0), to_str(c[1] * 100.0 / 255.0), to_str(c[2] * 100.0 / 255.0))
            return '#%02x%02x%02x' % (round(c[0]), round(c[1]), round(c[2]))
        if len(r) > 2 or len(g) > 2 or len(b) > 2:
            return 'rgba(%s%%, %s%%, %s%%, %s)' % (to_str(c[0] * 100.0 / 255.0), to_str(c[1] * 100.0 / 255.0), to_str(c[2] * 100.0 / 255.0), to_str(c[3]))
        return 'rgba(%d, %d, %d, %s)' % (round(c[0]), round(c[1]), round(c[2]), to_str(c[3]))

    @classmethod
    def _do_cmps(cls, first, second, op):
        try:
            first = ColorValue(first)
            second = ColorValue(second)
        except ValueError:
            return op(getattr(first, 'value', first), getattr(second, 'value', second))
        return op(first.value, second.value)

    @classmethod
    def _do_op(cls, first, second, op):
        if isinstance(first, ListValue) and isinstance(second, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                try:
                    ret.value[k] = op(ret.value[k], second.value[k])
                except KeyError:
                    pass
            return ret
        if isinstance(first, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                ret.value[k] = op(ret.value[k], second)
            return ret
        if isinstance(second, ListValue):
            ret = ListValue(second)
            for k, v in ret.items():
                ret.value[k] = op(first, ret.value[k])
            return ret

        first = ColorValue(first)
        second = ColorValue(second)
        val = [op(first.value[i], second.value[i]) for i in range(4)]
        val[3] = (first.value[3] + second.value[3]) / 2
        c = val
        r = 255.0, 255.0, 255.0, 1.0
        c = [0.0 if c[i] < 0 else r[i] if c[i] > r[i] else c[i] for i in range(4)]
        ret = ColorValue(None).merge(first).merge(second)
        ret.value = tuple(c)
        return ret

    def merge(self, obj):
        obj = ColorValue(obj)
        self.value = obj.value
        for type, val in obj.types.items():
            self.types.setdefault(type, 0)
            self.types[type] += val
        return self

    def convert_to(self, type):
        val = self.value
        ret = ColorValue(val)
        ret.types[type] = 1
        return ret

    @property
    def type(self):
        type = ''
        if self.types:
            types = sorted(self.types, key=self.types.get)
            while len(types):
                type = types.pop()
                if type:
                    break
        return type


class QuotedStringValue(Value):
    def __init__(self, tokens):
        self.tokens = tokens
        if tokens is None:
            self.value = ''
        elif isinstance(tokens, ParserValue):
            self.value = dequote(tokens.value)
        elif isinstance(tokens, QuotedStringValue):
            self.value = tokens.value
        else:
            self.value = to_str(tokens)

    def __hash__(self):
        return hash((True, self.value))

    def convert_to(self, type):
        return QuotedStringValue(self.value + type)

    def __str__(self):
        return '"%s"' % escape(self.value)

    @classmethod
    def _do_cmps(cls, first, second, op):
        first = QuotedStringValue(first)
        second = QuotedStringValue(second)
        return op(first.value, second.value)

    @classmethod
    def _do_op(cls, first, second, op):
        if isinstance(first, ListValue) and isinstance(second, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                try:
                    ret.value[k] = op(ret.value[k], second.value[k])
                except KeyError:
                    pass
            return ret
        if isinstance(first, ListValue):
            ret = ListValue(first)
            for k, v in ret.items():
                ret.value[k] = op(ret.value[k], second)
            return ret
        if isinstance(second, ListValue):
            ret = ListValue(second)
            for k, v in ret.items():
                ret.value[k] = op(first, ret.value[k])
            return ret

        first = QuotedStringValue(first)
        first_value = first.value
        if op == operator.__mul__:
            second = NumberValue(second)
            second_value = int(second.value)
        else:
            second = QuotedStringValue(second)
            second_value = second.value
        val = op(first_value, second_value)
        ret = QuotedStringValue(None).merge(first).merge(second)
        ret.value = val
        return ret

    def merge(self, obj):
        obj = QuotedStringValue(obj)
        self.value = obj.value
        return self


class StringValue(QuotedStringValue):
    def __hash__(self):
        return hash((False, self.value))

    def __str__(self):
        return self.value

    def __add__(self, other):
        if isinstance(other, ListValue):
            return self._do_op(self, other, operator.__add__)
        string_class = StringValue
        if self.__class__ == QuotedStringValue or other.__class__ == QuotedStringValue:
            string_class = QuotedStringValue
        other = string_class(other)
        if not isinstance(other, (QuotedStringValue, basestring)):
            return string_class(self.value + '+' + other.value)
        return string_class(self.value + other.value)

    def __radd__(self, other):
        if isinstance(other, ListValue):
            return self._do_op(other, self, operator.__add__)
        string_class = StringValue
        if self.__class__ == QuotedStringValue or other.__class__ == QuotedStringValue:
            string_class = QuotedStringValue
        other = string_class(other)
        if not isinstance(other, (QuotedStringValue, basestring)):
            return string_class(other.value + '+' + self.value)
        return string_class(other.value + self.value)

# Parser/functions map:
fnct = {
    'grid-image:4': _grid_image,
    'grid-image:5': _grid_image,
    'image-color:1': _image_color,
    'image-color:2': _image_color,
    'image-color:3': _image_color,
    'sprite-map:1': _sprite_map,
    'sprite-names:1': _sprites,
    'sprites:1': _sprites,
    'sprite:2': _sprite,
    'sprite:3': _sprite,
    'sprite:4': _sprite,
    'sprite-map-name:1': _sprite_map_name,
    'sprite-file:2': _sprite_file,
    'sprite-url:1': _sprite_url,
    'sprite-position:2': _sprite_position,
    'sprite-position:3': _sprite_position,
    'sprite-position:4': _sprite_position,
    'background-noise:0': _background_noise,
    'background-noise:1': _background_noise,
    'background-noise:2': _background_noise,
    'background-noise:3': _background_noise,
    'background-noise:4': _background_noise,

    'image-url:1': _image_url,
    'image-url:2': _image_url,
    'image-url:3': _image_url,
    'image-url:4': _image_url,
    'image-url:5': _image_url,
    'inline-image:1': _inline_image,
    'inline-image:2': _inline_image,
    'image-width:1': _image_width,
    'image-height:1': _image_height,

    'stylesheet-url:1': _stylesheet_url,
    'stylesheet-url:2': _stylesheet_url,

    'font-url:1': _font_url,
    'font-url:2': _font_url,

    'font-files:n': _font_files,
    'inline-font-files:n': _inline_font_files,

    'opposite-position:n': _opposite_position,
    'grad-point:n': _grad_point,
    'grad-end-position:n': _grad_end_position,
    'color-stops:n': _color_stops,
    'color-stops-in-percentages:n': _color_stops_in_percentages,
    'grad-color-stops:n': _grad_color_stops,
    'radial-gradient:n': _radial_gradient,
    'linear-gradient:n': _linear_gradient,
    'radial-svg-gradient:n': _radial_svg_gradient,
    'linear-svg-gradient:n': _linear_svg_gradient,

    'opacify:2': _opacify,
    'fadein:2': _opacify,
    'fade-in:2': _opacify,
    'transparentize:2': _transparentize,
    'fadeout:2': _transparentize,
    'fade-out:2': _transparentize,
    'lighten:2': _lighten,
    'darken:2': _darken,
    'saturate:2': _saturate,
    'desaturate:2': _desaturate,
    'grayscale:1': _grayscale,
    'greyscale:1': _grayscale,
    'adjust-hue:2': _adjust_hue,
    'adjust-lightness:2': _adjust_lightness,
    'adjust-saturation:2': _adjust_saturation,
    'scale-lightness:2': _scale_lightness,
    'scale-saturation:2': _scale_saturation,
    'adjust-color:n': _adjust_color,
    'scale-color:n': _scale_color,
    'change-color:n': _change_color,
    'spin:2': _adjust_hue,
    'complement:1': _complement,
    'invert:1': _invert,
    'mix:2': _mix,
    'mix:3': _mix,
    'hsl:3': _hsl,
    'hsl:1': _hsl2,
    'hsla:1': _hsla2,
    'hsla:2': _hsla2,
    'hsla:4': _hsla,
    'rgb:3': _rgb,
    'rgb:1': _rgb2,
    'rgba:1': _rgba2,
    'rgba:2': _rgba2,
    'rgba:4': _rgba,
    'ie-hex-str:1': _ie_hex_str,

    'red:1': _red,
    'green:1': _green,
    'blue:1': _blue,
    'alpha:1': _alpha,
    'opacity:1': _alpha,
    'hue:1': _hue,
    'saturation:1': _saturation,
    'lightness:1': _lightness,

    'prefixed:n': _prefixed,
    'prefix:n': _prefix,
    '-moz:n': __moz,
    '-svg:n': __svg,
    '-css2:n': __css2,
    '-pie:n': __pie,
    '-webkit:n': __webkit,
    '-owg:n': __owg,
    '-ms:n': __ms,
    '-o:n': __o,

    '-compass-list:n': __compass_list,
    '-compass-space-list:n': __compass_space_list,
    'blank:n': _blank,
    'compact:n': _compact,
    'reject:n': _reject,
    '-compass-slice:3': __compass_slice,
    'nth:2': _nth,
    'max:n': _max,
    'min:n': _min,
    '-compass-nth:2': _nth,
    'first-value-of:n': _first_value_of,
    'join:2': _join,
    'join:3': _join,
    'length:n': _length,
    '-compass-list-size:n': _length,
    'append:2': _append,
    'append:3': _append,

    'nest:n': _nest,
    'append-selector:2': _append_selector,
    'headers:0': _headers,
    'headers:1': _headers,
    'headers:2': _headers,
    'headings:0': _headers,
    'headings:1': _headers,
    'headings:2': _headers,
    'enumerate:3': _enumerate,
    'enumerate:4': _enumerate,
    'range:1': _range,
    'range:2': _range,

    'percentage:1': _percentage,
    'unitless:1': _unitless,
    'unit:1': _unit,
    'if:2': _if,
    'if:3': _if,
    'type-of:1': _type_of,
    'comparable:2': _comparable,
    'elements-of-type:1': _elements_of_type,
    'quote:n': _quote,
    'unquote:n': _unquote,
    'escape:1': _unquote,
    'e:1': _unquote,

    'sin:1': Value._wrap(math.sin),
    'cos:1': Value._wrap(math.cos),
    'tan:1': Value._wrap(math.tan),
    'abs:1': Value._wrap(abs),
    'round:1': Value._wrap(round),
    'ceil:1': Value._wrap(math.ceil),
    'floor:1': Value._wrap(math.floor),
    'pi:0': _pi,
}
for u in _units:
    fnct[u + ':2'] = _convert_to


def interpolate(v, R):
    C, O = R[CONTEXT], R[OPTIONS]
    vi = C.get(v, v)
    if v != vi and isinstance(vi, basestring):
        _vi = eval_expr(vi, R, True)
        if _vi is not None:
            vi = _vi
    return vi


def call(name, args, R, is_function=True):
    C, O = R[CONTEXT], R[OPTIONS]
    # Function call:
    _name = name.replace('_', '-')
    s = args and args.value.items() or []
    _args = [v for n, v in s if isinstance(n, int)]
    _kwargs = dict((str(n[1:]).replace('-', '_'), v) for n, v in s if not isinstance(n, int) and n != '_')
    _fn_a = '%s:%d' % (_name, len(_args))
    #print >>sys.stderr, '#', _fn_a, _args, _kwargs
    _fn_n = '%s:n' % _name
    try:
        fn = O and O.get('@function ' + _fn_a)
        if fn:
            node = fn(R, *_args, **_kwargs)
        else:
            fn = fnct.get(_fn_a) or fnct[_fn_n]
            node = fn(*_args, **_kwargs)
    except KeyError:
        sp = args and args.value.get('_') or ''
        if is_function:
            if not _css_functions_re.match(_name):
                log.error("Required function not found: %s (%s)", _fn_a, R[INDEX][R[LINENO]])
            _args = (sp + ' ').join(to_str(v) for n, v in s if isinstance(n, int))
            _kwargs = (sp + ' ').join('%s: %s' % (n, to_str(v)) for n, v in s if not isinstance(n, int) and n != '_')
            if _args and _kwargs:
                _args += (sp + ' ')
            # Function not found, simply write it as a string:
            node = StringValue(name + '(' + _args + _kwargs + ')')
        else:
            node = StringValue((sp + ' ').join(str(v) for n, v in s if n != '_'))
    return node


################################################################################
# Parser

if not Scanner:
    class NoMoreTokens(Exception):
        """
        Another exception object, for when we run out of tokens
        """
        pass

    class Scanner(object):
        def __init__(self, patterns, ignore, input=None):
            """
            Patterns is [(terminal,regex)...]
            Ignore is [terminal,...];
            Input is a string
            """
            self.reset(input)
            self.ignore = ignore
            # The stored patterns are a pair (compiled regex,source
            # regex).  If the patterns variable passed in to the
            # constructor is None, we assume that the class already has a
            # proper .patterns list constructed
            if patterns is not None:
                self.patterns = []
                for k, r in patterns:
                    self.patterns.append((k, re.compile(r)))

        def reset(self, input):
            self.tokens = []
            self.restrictions = []
            self.input = input
            self.pos = 0

        def __repr__(self):
            """
            Print the last 10 tokens that have been scanned in
            """
            output = ''
            for t in self.tokens[-10:]:
                output = "%s\n  (@%s)  %s  =  %s" % (output, t[0], t[2], repr(t[3]))
            return output

        def _scan(self, restrict):
            """
            Should scan another token and add it to the list, self.tokens,
            and add the restriction to self.restrictions
            """
            # Keep looking for a token, ignoring any in self.ignore
            token = None
            while True:
                best_pat = None
                # Search the patterns for a match, with earlier
                # tokens in the list having preference
                best_pat_len = 0
                for p, regexp in self.patterns:
                    # First check to see if we're restricting to this token
                    if restrict and p not in restrict and p not in self.ignore:
                        continue
                    m = regexp.match(self.input, self.pos)
                    if m:
                        # We got a match
                        best_pat = p
                        best_pat_len = len(m.group(0))
                        break

                # If we didn't find anything, raise an error
                if best_pat is None:
                    msg = "Bad Token"
                    if restrict:
                        msg = "Trying to find one of " + ", ".join(restrict)
                    raise SyntaxError("SyntaxError[@ char %s: %s]" % (repr(self.pos), msg))

                # If we found something that isn't to be ignored, return it
                if best_pat in self.ignore:
                    # This token should be ignored...
                    self.pos += best_pat_len
                else:
                    end_pos = self.pos + best_pat_len
                    # Create a token with this data
                    token = (
                        self.pos,
                        end_pos,
                        best_pat,
                        self.input[self.pos:end_pos]
                    )
                    break
            if token is not None:
                self.pos = token[1]
                # Only add this token if it's not in the list
                # (to prevent looping)
                if not self.tokens or token != self.tokens[-1]:
                    self.tokens.append(token)
                    self.restrictions.append(restrict)
                    return 1
            return 0

        def token(self, i, restrict=None):
            """
            Get the i'th token, and if i is one past the end, then scan
            for another token; restrict is a list of tokens that
            are allowed, or 0 for any token.
            """
            tokens_len = len(self.tokens)
            if i == tokens_len:  # We are at the end, get the next...
                tokens_len += self._scan(restrict)
            if i < tokens_len:
                if restrict and self.restrictions[i] and restrict > self.restrictions[i]:
                    raise NotImplementedError("Unimplemented: restriction set changed")
                return self.tokens[i]
            raise NoMoreTokens

        def rewind(self, i):
            tokens_len = len(self.tokens)
            if i <= tokens_len:
                token = self.tokens[i]
                self.tokens = self.tokens[:i]
                self.restrictions = self.restrictions[:i]
                self.pos = token[0]


class CachedScanner(Scanner):
    """
    Same as Scanner, but keeps cached tokens for any given input
    """
    _cache_ = {}
    _goals_ = ['END']

    @classmethod
    def cleanup(cls):
        cls._cache_ = {}

    def __init__(self, patterns, ignore, input=None):
        try:
            self._tokens = self._cache_[input]
        except KeyError:
            self._tokens = None
            self.__tokens = {}
            self.__input = input
            super(CachedScanner, self).__init__(patterns, ignore, input)

    def reset(self, input):
        try:
            self._tokens = self._cache_[input]
        except KeyError:
            self._tokens = None
            self.__tokens = {}
            self.__input = input
            super(CachedScanner, self).reset(input)

    def __repr__(self):
        if self._tokens is None:
            return super(CachedScanner, self).__repr__()
        output = ''
        for t in self._tokens[-10:]:
            output = "%s\n  (@%s)  %s  =  %s" % (output, t[0], t[2], repr(t[3]))
        return output

    def token(self, i, restrict=None):
        if self._tokens is None:
            token = super(CachedScanner, self).token(i, restrict)
            self.__tokens[i] = token
            if token[2] in self._goals_:  # goal tokens
                self._cache_[self.__input] = self._tokens = self.__tokens
            return token
        else:
            token = self._tokens.get(i)
            if token is None:
                raise NoMoreTokens
            return token

    def rewind(self, i):
        if self._tokens is None:
            super(CachedScanner, self).rewind(i)


class Parser(object):
    def __init__(self, scanner):
        self._scanner = scanner
        self._pos = 0

    def reset(self, input):
        self._scanner.reset(input)
        self._pos = 0

    def _peek(self, types):
        """
        Returns the token type for lookahead; if there are any args
        then the list of args is the set of token types to allow
        """
        tok = self._scanner.token(self._pos, types)
        return tok[2]

    def _scan(self, type):
        """
        Returns the matched text, and moves to the next token
        """
        tok = self._scanner.token(self._pos, set([type]))
        if tok[2] != type:
            raise SyntaxError("SyntaxError[@ char %s: %s]" % (repr(tok[0]), "Trying to find " + type))
        self._pos += 1
        return tok[3]

    def _rewind(self, n=1):
        self._pos -= min(n, self._pos)
        self._scanner.rewind(self._pos)


################################################################################
#'(?<!\\s)(?:' + '|'.join(_units) + ')(?![-\\w])'
## Grammar compiled using Yapps:
class CalculatorScanner(CachedScanner):
    patterns = None
    _patterns = [
        ('":"', ':'),
        ('[ \r\t\n]+', '[ \r\t\n]+'),
        ('COMMA', ','),
        ('LPAR', '\\(|\\['),
        ('RPAR', '\\)|\\]'),
        ('END', '$'),
        ('MUL', '[*]'),
        ('DIV', '/'),
        ('ADD', '[+]'),
        ('SUB', '-\\s'),
        ('SIGN', '-(?![a-zA-Z_])'),
        ('AND', '(?<![-\\w])and(?![-\\w])'),
        ('OR', '(?<![-\\w])or(?![-\\w])'),
        ('NOT', '(?<![-\\w])not(?![-\\w])'),
        ('NE', '!='),
        ('INV', '!'),
        ('EQ', '=='),
        ('LE', '<='),
        ('GE', '>='),
        ('LT', '<'),
        ('GT', '>'),
        ('STR', "'[^']*'"),
        ('QSTR', '"[^"]*"'),
        ('UNITS', '(?<!\\s)(?:' + '|'.join(_units) + ')(?![-\\w])'),
        ('NUM', '(?:\\d+(?:\\.\\d*)?|\\.\\d+)'),
        ('BOOL', '(?<![-\\w])(?:true|false)(?![-\\w])'),
        ('COLOR', '#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})(?![a-fA-F0-9])'),
        ('VAR', '\\$[-a-zA-Z0-9_]+'),
        ('FNCT', '[-a-zA-Z_][-a-zA-Z0-9_]*(?=\\()'),
        ('ID', '[-a-zA-Z_][-a-zA-Z0-9_]*'),
    ]

    def __init__(self, input=None):
        if hasattr(self, 'setup_patterns'):
            self.setup_patterns(self._patterns)
        elif self.patterns is None:
            self.__class__.patterns = []
            for t, p in self._patterns:
                self.patterns.append((t, re.compile(p)))
        super(CalculatorScanner, self).__init__(None, ['[ \r\t\n]+'], input)


class Calculator(Parser):
    def goal(self, R):
        expr_lst = self.expr_lst(R)
        v = expr_lst.first() if len(expr_lst) == 1 else expr_lst
        END = self._scan('END')
        return v

    def expr(self, R):
        and_test = self.and_test(R)
        v = and_test
        while self._peek(self.expr_rsts) == 'OR':
            OR = self._scan('OR')
            and_test = self.and_test(R)
            v = and_test if isinstance(v, basestring) and _undefined_re.match(v) else (v or and_test)
        return v

    def and_test(self, R):
        not_test = self.not_test(R)
        v = not_test
        while self._peek(self.and_test_rsts) == 'AND':
            AND = self._scan('AND')
            not_test = self.not_test(R)
            v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) else (v and not_test)
        return v

    def not_test(self, R):
        _token_ = self._peek(self.not_test_rsts)
        if _token_ not in self.not_test_chks:
            comparison = self.comparison(R)
            return comparison
        else:  # in self.not_test_chks
            while 1:
                _token_ = self._peek(self.not_test_chks)
                if _token_ == 'NOT':
                    NOT = self._scan('NOT')
                    not_test = self.not_test(R)
                    v = 'undefined' if isinstance(not_test, basestring) and _undefined_re.match(not_test) else (not not_test)
                else:  # == 'INV'
                    INV = self._scan('INV')
                    not_test = self.not_test(R)
                    v = 'undefined' if isinstance(not_test, basestring) and _undefined_re.match(not_test) else _inv('!', not_test)
                if self._peek(self.not_test_rsts_) not in self.not_test_chks:
                    break
            return v

    def comparison(self, R):
        a_expr = self.a_expr(R)
        v = a_expr
        while self._peek(self.comparison_rsts) in self.comparison_chks:
            _token_ = self._peek(self.comparison_chks)
            if _token_ == 'LT':
                LT = self._scan('LT')
                a_expr = self.a_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else (v < a_expr)
            elif _token_ == 'GT':
                GT = self._scan('GT')
                a_expr = self.a_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else (v > a_expr)
            elif _token_ == 'LE':
                LE = self._scan('LE')
                a_expr = self.a_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else (v <= a_expr)
            elif _token_ == 'GE':
                GE = self._scan('GE')
                a_expr = self.a_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else (v >= a_expr)
            elif _token_ == 'EQ':
                EQ = self._scan('EQ')
                a_expr = self.a_expr(R)
                v = (None if isinstance(v, basestring) and _undefined_re.match(v) else v) == (None if isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else a_expr)
            else:  # == 'NE'
                NE = self._scan('NE')
                a_expr = self.a_expr(R)
                v = (None if isinstance(v, basestring) and _undefined_re.match(v) else v) != (None if isinstance(a_expr, basestring) and _undefined_re.match(a_expr) else a_expr)
        return v

    def a_expr(self, R):
        m_expr = self.m_expr(R)
        v = m_expr
        while self._peek(self.a_expr_rsts) in self.a_expr_chks:
            _token_ = self._peek(self.a_expr_chks)
            if _token_ == 'ADD':
                ADD = self._scan('ADD')
                m_expr = self.m_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(m_expr, basestring) and _undefined_re.match(m_expr) else (v + m_expr)
            else:  # == 'SUB'
                SUB = self._scan('SUB')
                m_expr = self.m_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(m_expr, basestring) and _undefined_re.match(m_expr) else (v - m_expr)
        return v

    def m_expr(self, R):
        u_expr = self.u_expr(R)
        v = u_expr
        while self._peek(self.m_expr_rsts) in self.m_expr_chks:
            _token_ = self._peek(self.m_expr_chks)
            if _token_ == 'MUL':
                MUL = self._scan('MUL')
                u_expr = self.u_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(u_expr, basestring) and _undefined_re.match(u_expr) else (v * u_expr)
            else:  # == 'DIV'
                DIV = self._scan('DIV')
                u_expr = self.u_expr(R)
                v = 'undefined' if isinstance(v, basestring) and _undefined_re.match(v) or isinstance(u_expr, basestring) and _undefined_re.match(u_expr) else (v / u_expr)
        return v

    def u_expr(self, R):
        _token_ = self._peek(self.u_expr_rsts)
        if _token_ == 'SIGN':
            SIGN = self._scan('SIGN')
            u_expr = self.u_expr(R)
            return 'undefined' if isinstance(u_expr, basestring) and _undefined_re.match(u_expr) else _inv('-', u_expr)
        elif _token_ == 'ADD':
            ADD = self._scan('ADD')
            u_expr = self.u_expr(R)
            return 'undefined' if isinstance(u_expr, basestring) and _undefined_re.match(u_expr) else u_expr
        else:  # in self.u_expr_chks
            atom = self.atom(R)
            v = atom
            if self._peek(self.u_expr_rsts_) == 'UNITS':
                UNITS = self._scan('UNITS')
                v = call(UNITS, ListValue(ParserValue({0: v, 1: UNITS})), R, False)
            return v

    def atom(self, R):
        _token_ = self._peek(self.u_expr_chks)
        if _token_ == 'LPAR':
            LPAR = self._scan('LPAR')
            expr_lst = self.expr_lst(R)
            RPAR = self._scan('RPAR')
            return expr_lst.first() if len(expr_lst) == 1 else expr_lst
        elif _token_ == 'ID':
            ID = self._scan('ID')
            return ID
        elif _token_ == 'FNCT':
            FNCT = self._scan('FNCT')
            v = None
            LPAR = self._scan('LPAR')
            if self._peek(self.atom_rsts) != 'RPAR':
                expr_lst = self.expr_lst(R)
                v = expr_lst
            RPAR = self._scan('RPAR')
            return call(FNCT, v, R)
        elif _token_ == 'NUM':
            NUM = self._scan('NUM')
            return NumberValue(ParserValue(NUM))
        elif _token_ == 'STR':
            STR = self._scan('STR')
            return StringValue(ParserValue(STR))
        elif _token_ == 'QSTR':
            QSTR = self._scan('QSTR')
            return QuotedStringValue(ParserValue(QSTR))
        elif _token_ == 'BOOL':
            BOOL = self._scan('BOOL')
            return BooleanValue(ParserValue(BOOL))
        elif _token_ == 'COLOR':
            COLOR = self._scan('COLOR')
            return ColorValue(ParserValue(COLOR))
        else:  # == 'VAR'
            VAR = self._scan('VAR')
            return interpolate(VAR, R)

    def expr_lst(self, R):
        n = None
        if self._peek(self.expr_lst_rsts) == 'VAR':
            VAR = self._scan('VAR')
            if self._peek(self.expr_lst_rsts_) == '":"':
                self._scan('":"')
                n = VAR
            else: self._rewind()
        expr_slst = self.expr_slst(R)
        v = {n or 0: expr_slst}
        while self._peek(self.expr_lst_rsts__) == 'COMMA':
            n = None
            COMMA = self._scan('COMMA')
            v['_'] = COMMA
            if self._peek(self.expr_lst_rsts) == 'VAR':
                VAR = self._scan('VAR')
                if self._peek(self.expr_lst_rsts_) == '":"':
                    self._scan('":"')
                    n = VAR
                else: self._rewind()
            expr_slst = self.expr_slst(R)
            v[n or len(v)] = expr_slst
        return ListValue(ParserValue(v))

    def expr_slst(self, R):
        expr = self.expr(R)
        v = {0: expr}
        while self._peek(self.expr_slst_rsts) not in self.expr_lst_rsts__:
            expr = self.expr(R)
            v[len(v)] = expr
        return ListValue(ParserValue(v)) if len(v) > 1 else v[0]

    not_test_rsts_ = set(['AND', 'LPAR', 'QSTR', 'END', 'COLOR', 'INV', 'SIGN', 'VAR', 'ADD', 'NUM', 'COMMA', 'FNCT', 'STR', 'NOT', 'BOOL', 'ID', 'RPAR', 'OR'])
    m_expr_chks = set(['MUL', 'DIV'])
    comparison_rsts = set(['LPAR', 'QSTR', 'RPAR', 'LE', 'COLOR', 'NE', 'LT', 'NUM', 'COMMA', 'GT', 'END', 'SIGN', 'ADD', 'FNCT', 'STR', 'VAR', 'EQ', 'ID', 'AND', 'INV', 'GE', 'BOOL', 'NOT', 'OR'])
    atom_rsts = set(['LPAR', 'QSTR', 'COLOR', 'INV', 'SIGN', 'NOT', 'ADD', 'NUM', 'BOOL', 'FNCT', 'STR', 'VAR', 'RPAR', 'ID'])
    not_test_chks = set(['NOT', 'INV'])
    u_expr_chks = set(['LPAR', 'COLOR', 'QSTR', 'NUM', 'BOOL', 'FNCT', 'STR', 'VAR', 'ID'])
    m_expr_rsts = set(['LPAR', 'SUB', 'QSTR', 'RPAR', 'MUL', 'DIV', 'LE', 'COLOR', 'NE', 'LT', 'NUM', 'COMMA', 'GT', 'END', 'SIGN', 'GE', 'FNCT', 'STR', 'VAR', 'EQ', 'ID', 'AND', 'INV', 'ADD', 'BOOL', 'NOT', 'OR'])
    expr_lst_rsts_ = set(['LPAR', 'QSTR', 'COLOR', 'INV', 'SIGN', 'VAR', 'ADD', 'NUM', 'BOOL', '":"', 'STR', 'NOT', 'ID', 'FNCT'])
    expr_lst_rsts = set(['LPAR', 'QSTR', 'COLOR', 'INV', 'SIGN', 'NOT', 'ADD', 'NUM', 'BOOL', 'FNCT', 'STR', 'VAR', 'ID'])
    and_test_rsts = set(['AND', 'LPAR', 'QSTR', 'END', 'COLOR', 'INV', 'SIGN', 'VAR', 'ADD', 'NUM', 'COMMA', 'FNCT', 'STR', 'NOT', 'BOOL', 'ID', 'RPAR', 'OR'])
    u_expr_rsts_ = set(['LPAR', 'SUB', 'QSTR', 'RPAR', 'VAR', 'MUL', 'DIV', 'LE', 'COLOR', 'NE', 'LT', 'NUM', 'COMMA', 'GT', 'END', 'SIGN', 'GE', 'FNCT', 'STR', 'UNITS', 'EQ', 'ID', 'AND', 'INV', 'ADD', 'BOOL', 'NOT', 'OR'])
    u_expr_rsts = set(['LPAR', 'COLOR', 'QSTR', 'SIGN', 'ADD', 'NUM', 'BOOL', 'FNCT', 'STR', 'VAR', 'ID'])
    expr_rsts = set(['LPAR', 'QSTR', 'END', 'COLOR', 'INV', 'SIGN', 'VAR', 'ADD', 'NUM', 'COMMA', 'FNCT', 'STR', 'NOT', 'BOOL', 'ID', 'RPAR', 'OR'])
    not_test_rsts = set(['LPAR', 'QSTR', 'COLOR', 'INV', 'SIGN', 'VAR', 'ADD', 'NUM', 'BOOL', 'FNCT', 'STR', 'NOT', 'ID'])
    comparison_chks = set(['GT', 'GE', 'NE', 'LT', 'LE', 'EQ'])
    expr_slst_rsts = set(['LPAR', 'QSTR', 'END', 'COLOR', 'INV', 'RPAR', 'VAR', 'ADD', 'NUM', 'COMMA', 'FNCT', 'STR', 'NOT', 'BOOL', 'SIGN', 'ID'])
    a_expr_chks = set(['ADD', 'SUB'])
    a_expr_rsts = set(['LPAR', 'SUB', 'QSTR', 'RPAR', 'LE', 'COLOR', 'NE', 'LT', 'NUM', 'COMMA', 'GT', 'END', 'SIGN', 'GE', 'FNCT', 'STR', 'VAR', 'EQ', 'ID', 'AND', 'INV', 'ADD', 'BOOL', 'NOT', 'OR'])
    expr_lst_rsts__ = set(['END', 'COMMA', 'RPAR'])


    expr_lst_rsts_ = None

### Grammar ends.
################################################################################

expr_cache = {}
def eval_expr(expr, rule, raw=False):
    # print >>sys.stderr, '>>',expr,'<<'
    results = None

    if not isinstance(expr, basestring):
        results = expr

    if results is None:
        if expr in rule[CONTEXT]:
            chkd = {}
            while expr in rule[CONTEXT] and expr not in chkd:
                chkd[expr] = 1
                _expr = rule[CONTEXT][expr]
                if _expr == expr:
                    break
                expr = _expr
        if not isinstance(expr, basestring):
            results = expr

    if results is None:
        try:
            results = expr_cache[expr]
        except KeyError:
            try:
                P = Calculator(CalculatorScanner())
                P.reset(expr)
                results = P.goal(rule)
            except SyntaxError:
                if DEBUG:
                    raise
            except Exception, e:
                log.error("Exception raised: %s in `%s' (%s)", e, expr, rule[INDEX][rule[LINENO]])
                if DEBUG:
                    raise
            if '$' not in expr:
                expr_cache[expr] = results

    if not raw and results is not None:
        results = to_str(results)

    # print >>sys.stderr, repr(expr),'==',results,'=='
    return results
