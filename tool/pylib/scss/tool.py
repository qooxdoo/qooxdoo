#!/usr/bin/env python
from __future__ import absolute_import

import logging
import os
import re
import sys
from collections import deque

import scss
from scss import Scss, log, spawn_rule, to_str, profiling
from scss import _prop_split_re
from scss.scss_meta import BUILD_INFO

log.setLevel(logging.INFO)


def main():
    logging.basicConfig(format="%(levelname)s: %(message)s")

    from optparse import OptionGroup, OptionParser, SUPPRESS_HELP

    parser = OptionParser(usage="Usage: %prog [options] [file]",
                          description="Converts Scss files to CSS.",
                          add_help_option=False)
    parser.add_option("-i", "--interactive", action="store_true",
                      help="Run an interactive Scss shell")
    parser.add_option("-w", "--watch", metavar="DIR",
                      help="Watch the files in DIR, and recompile when they change")
    parser.add_option("-r", "--recursive", action="store_true",
                      help="Also watch directories inside of the watch directory")
    parser.add_option("-o", "--output", metavar="PATH",
                      help="Write output to PATH (a directory if using watch, a file otherwise)")
    parser.add_option("-s", "--suffix", metavar="STRING",
                      help="If using watch, a suffix added to the output filename (i.e. filename.STRING.css)")
    parser.add_option("--time", action="store_true",
                      help="Display compliation times")
    parser.add_option("--debug-info", action="store_true",
                      help="Turns on scss's debuging information")
    parser.add_option("--no-debug-info", action="store_false",
                      dest="debug_info", default=False,
                      help="Turns off scss's debuging information")
    parser.add_option("-t", "--test", action="store_true", help=SUPPRESS_HELP)
    parser.add_option("-C", "--no-compress", action="store_false",
                      dest="compress", default=True,
                      help="Don't minify outputted CSS")
    parser.add_option("-?", action="help", help=SUPPRESS_HELP)
    parser.add_option("-h", "--help", action="help",
                      help="Show this message and exit")
    parser.add_option("-v", "--version", action="store_true",
                      help="Print version and exit")

    paths_group = OptionGroup(parser, "Resource Paths")
    paths_group.add_option("-I", "--load-path", metavar="PATH",
                      action="append", dest="load_paths",
                      help="Add a scss import path, may be given multiple times")
    paths_group.add_option("-S", "--static-root", metavar="PATH", dest="static_root",
                      help="Static root path (Where images and static resources are located)")
    paths_group.add_option("-A", "--assets-root", metavar="PATH", dest="assets_root",
                      help="Assets root path (Sprite images will be created here)")
    parser.add_option_group(paths_group)

    (options, args) = parser.parse_args()

    # General runtime configuration
    scss.VERBOSITY = 0
    if options.time:
        scss.VERBOSITY = 2
    if options.static_root is not None:
        scss.STATIC_ROOT = options.static_root
    if options.assets_root is not None:
        scss.ASSETS_ROOT = options.assets_root
    if options.load_paths is not None:
        # TODO: Convert global LOAD_PATHS to a list. Use it directly.
        # Doing the above will break backwards compatibility!
        if hasattr(scss.LOAD_PATHS, 'split'):
            load_path_list = [p.strip() for p in scss.LOAD_PATHS.split(',')]
        else:
            load_path_list = list(scss.LOAD_PATHS)

        for path_param in options.load_paths:
            for p in path_param.replace(os.pathsep, ',').replace(';', ',').split(','):
                p = p.strip()
                if p and p not in load_path_list:
                    load_path_list.append(p)

        # TODO: Remove this once global LOAD_PATHS is a list.
        if hasattr(scss.LOAD_PATHS, 'split'):
            scss.LOAD_PATHS = ','.join(load_path_list)
        else:
            scss.LOAD_PATHS = load_path_list

    # Execution modes
    if options.test:
        import doctest
        doctest.testfile('tests.rst')
    elif options.version:
        print BUILD_INFO
    elif options.interactive:
        from pprint import pprint
        try:
            import atexit
            import readline
            histfile = os.path.expanduser('~/.scss-history')
            try:
                readline.read_history_file(histfile)
            except IOError:
                pass
            atexit.register(readline.write_history_file, histfile)
        except ImportError:
            pass

        css = Scss()
        context = css.scss_vars
        options = css.scss_opts
        rule = spawn_rule(context=context, options=options)
        print "Welcome to %s interactive shell" % BUILD_INFO
        while True:
            try:
                s = raw_input('>>> ').strip()
            except EOFError:
                print
                break
            except KeyboardInterrupt:
                print
                break
            if s in ('exit', 'quit'):
                break
            for s in s.split(';'):
                s = css.load_string(s.strip())
                if not s:
                    continue
                elif s.startswith('@'):
                    properties = []
                    children = deque()
                    spawn_rule(fileid='<string>', context=context, options=options, properties=properties)
                    code, name = (s.split(None, 1) + [''])[:2]
                    if code == '@option':
                        css._settle_options(rule, [''], set(), children, None, None, s, None, code, name)
                        continue
                    elif code == '@import':
                        css._do_import(rule, [''], set(), children, None, None, s, None, code, name)
                        continue
                    elif code == '@include':
                        final_cont = ''
                        css._do_include(rule, [''], set(), children, None, None, s, None, code, name)
                        code = css._print_properties(properties).rstrip('\n')
                        if code:
                            final_cont += code
                        if children:
                            css.children.extendleft(children)
                            css.parse_children()
                            code = css._create_css(css.rules).rstrip('\n')
                            if code:
                                final_cont += code
                        final_cont = css.post_process(final_cont)
                        print final_cont
                        continue
                elif s == 'ls' or s.startswith('show(') or s.startswith('show ') or s.startswith('ls(') or s.startswith('ls '):
                    m = re.match(r'(?:show|ls)(\()?\s*([^,/\\) ]*)(?:[,/\\ ]([^,/\\ )]+))*(?(1)\))', s, re.IGNORECASE)
                    if m:
                        name = m.group(2)
                        code = m.group(3)
                        name = name and name.strip().rstrip('s')  # remove last 's' as in functions
                        code = code and code.strip()
                        if not name:
                            pprint(sorted(['vars', 'options', 'mixins', 'functions']))
                        elif name in ('v', 'var', 'variable'):
                            if code == '*':
                                d = dict((k, v) for k, v in context.items())
                                pprint(d)
                            elif code:
                                d = dict((k, v) for k, v in context.items() if code in k)
                                pprint(d)
                            else:
                                d = dict((k, v) for k, v in context.items() if k.startswith('$') and not k.startswith('$__'))
                                pprint(d)
                        elif name in ('o', 'opt', 'option'):
                            if code == '*':
                                d = dict((k, v) for k, v in options.items())
                                pprint(d)
                            elif code:
                                d = dict((k, v) for k, v in options.items() if code in k)
                                pprint(d)
                            else:
                                d = dict((k, v) for k, v in options.items() if not k.startswith('@'))
                                pprint(d)
                        elif name in ('m', 'mix', 'mixin', 'f', 'func', 'funct', 'function'):
                            if name.startswith('m'):
                                name = 'mixin'
                            elif name.startswith('f'):
                                name = 'function'
                            if code == '*':
                                d = dict((k[len(name) + 2:], v) for k, v in options.items() if k.startswith('@' + name + ' '))
                                pprint(sorted(d))
                            elif code:
                                d = dict((k, v) for k, v in options.items() if k.startswith('@' + name + ' ') and code in k)
                                seen = set()
                                for k, mixin in d.items():
                                    mixin = getattr(mixin, 'mixin', mixin)
                                    fn_name, _, _ = k.partition(':')
                                    if fn_name not in seen:
                                        seen.add(fn_name)
                                        print fn_name + '(' + ', '.join(p + (': ' + mixin[1].get(p) if p in mixin[1] else '') for p in mixin[0]) + ') {'
                                        print '  ' + '\n  '.join(l for l in mixin[2].split('\n'))
                                        print '}'
                            else:
                                d = dict((k[len(name) + 2:].split(':')[0], v) for k, v in options.items() if k.startswith('@' + name + ' '))
                                pprint(sorted(d))
                        continue
                elif s.startswith('$') and (':' in s or '=' in s):
                    prop, value = [a.strip() for a in _prop_split_re.split(s, 1)]
                    prop = css.do_glob_math(prop, context, options, rule, True)
                    value = css.calculate(value, context, options, rule)
                    context[prop] = value
                    continue
                s = to_str(css.calculate(s, context, options, rule))
                s = css.post_process(s)
                print s
        print "Bye!"
    elif options.watch:
        import time
        try:
            from watchdog.observers import Observer
            from watchdog.events import PatternMatchingEventHandler
        except ImportError:
            sys.stderr.write("Using watch functionality requires the `watchdog` library: http://pypi.python.org/pypi/watchdog/")
            sys.exit(1)
        if options.output and not os.path.isdir(options.output):
            sys.stderr.write("watch file output directory is invalid: '%s'" % (options.output))
            sys.exit(2)

        class ScssEventHandler(PatternMatchingEventHandler):
            def __init__(self, *args, **kwargs):
                super(ScssEventHandler, self).__init__(*args, **kwargs)
                self.css = Scss(scss_opts={
                    'compress': options.compress,
                    'debug_info': options.debug_info,
                })
                self.output = options.output
                self.suffix = options.suffix

            def is_valid(self, path):
                return os.path.isfile(path) and path.endswith(".scss") and not os.path.basename(path).startswith("_")

            def process(self, path):
                if os.path.isdir(path):
                    for f in os.listdir(path):
                        full = os.path.join(path, f)
                        if self.is_valid(full):
                            self.compile(full)
                elif self.is_valid(path):
                    self.compile(path)

            def compile(self, src_path):
                fname = os.path.basename(src_path)
                if fname.endswith(".scss"):
                    fname = fname[:-5]
                    if self.suffix:
                        fname += "." + self.suffix
                    fname += ".css"
                else:
                    # you didn't give me a file of the correct type!
                    return False

                if self.output:
                    dest_path = os.path.join(self.output, fname)
                else:
                    dest_path = os.path.join(os.path.dirname(src_path), fname)

                print "Compiling %s => %s" % (src_path, dest_path)
                src_file = open(src_path)
                dest_file = open(dest_path, 'w')
                dest_file.write(self.css.compile(src_file.read()))

            def on_moved(self, event):
                super(ScssEventHandler, self).on_moved(event)
                self.process(event.dest_path)

            def on_created(self, event):
                super(ScssEventHandler, self).on_created(event)
                self.process(event.src_path)

            def on_modified(self, event):
                super(ScssEventHandler, self).on_modified(event)
                self.process(event.src_path)

        event_handler = ScssEventHandler(patterns="*.scss")
        observer = Observer()
        observer.schedule(event_handler, path=options.watch, recursive=options.recursive)
        observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

    else:
        if options.output is not None:
            output = open(options.output, 'wt')
        else:
            output = sys.stdout

        css = Scss(scss_opts={
            'compress': options.compress,
            'debug_info': options.debug_info,
        })
        if args:
            for path in args:
                finput = open(path, 'rt')
                output.write(css.compile(finput.read()))
        else:
            output.write(css.compile(sys.stdin.read()))

        for f, t in profiling.items():
            print >>sys.stderr, "%s took %03fs" % (f, t)

if __name__ == "__main__":
    main()
