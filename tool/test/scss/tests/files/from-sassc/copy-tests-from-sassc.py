#!/usr/bin/env python3
"""Run me with the path to a sassc checkout, and I'll copy over all the tests
that are viable to copy.
"""

# TODO:
# - huge.scss takes ages to run
# - extraneous files:
#   - spec/scss/guard_assign  (sassc_output.css, sass_output.css)
#   - spec/basic/14_imports  (a.scss, b.scss, d.scss, sub)
#   - spec/basic/12_pseudo_classes_and_elements  (notes.txt)
#   - spec/todo/options_passed_to_script  (options.cfg)
#   - spec/todo/newlines_removed_from_selectors_when_compressed  (options.cfg)
# - files that ruby sass fails to compile:
#   - spec/todo/variables_in_media.scss
#   - spec/todo/css_error_with_windows_newlines.scss
#   - tests/charset.scss
#   - tests/warnings.scss
#   - tests/another-gradient-test.scss
#   - tests/media.scss
#   - tests/empty-properties.scss
#   - tests/for_in_function.scss
#   - tests/directives-in-propsets.scss
#   - tests/trace.scss
#   - tests/empty-rule.scss


import os
import os.path
import shutil
import subprocess
import sys

def compile_with_ruby_sass(infile):
    outfile = os.path.splitext(infile)[0] + '.css'

    with open(outfile, 'w') as outf:
        # "expanded" is pretty close to what pyscss spits out, but it
        # includes extra blank lines between nested blocks, so remove those
        # with a quick grep
        scss_proc = subprocess.Popen(['scss', '--style=expanded', infile], stdout=subprocess.PIPE)
        grep_proc = subprocess.Popen(['grep', '.'], stdin=scss_proc.stdout, stdout=outf)
        ret = grep_proc.wait()

    if ret != 0:
        print("...whoops, bailing on {}".format(infile))
        os.unlink(infile)
        try:
            os.unlink(outfile)
        except OSError:
            pass

def sync_tests(sassc_root):
    target_dir = os.path.dirname(__file__)

    # Grab all the input/output pairs from `spec`
    spec_dir = os.path.join(sassc_root, 'spec')
    for dirpath, dirnames, filenames in os.walk(spec_dir):
        fileset = set(filenames)
        try:
            fileset.discard('input.scss')
            infile = 'input.scss'
        except KeyError:
            continue

        path = os.path.relpath(dirpath, sassc_root)
        if 'output.css' in fileset:
            outfile = 'output.css'
        elif 'expected_output.css' in fileset:
            outfile = 'expected_output.css'
        else:
            print("can't find an output file in {}, skipping".format(path))
            continue
        fileset.discard(outfile)

        test_name = path.replace('/', '-')
        print("cool, found a test pair:", path)

        if fileset or dirnames:
            # TODO
            print("... extra files i don't know how to handle, skipping -- {!r} {!r}".format(fileset, dirnames))
            continue

        shutil.copyfile(
            os.path.join(dirpath, infile),
            os.path.join(target_dir, test_name + '.scss'))

        compile_with_ruby_sass(os.path.join(target_dir, test_name + '.scss'))

    # Grab the extra tests from `tests` (but don't recurse)
    tests_dir = os.path.join(sassc_root, 'tests')
    for fn in os.listdir(tests_dir):
        path = os.path.join(tests_dir, fn)
        if not os.path.isfile(path) or not path.endswith('.scss'):
            continue

        target = os.path.join(target_dir, 'tests-' + fn)
        shutil.copyfile(path, target)
        compile_with_ruby_sass(target)




if __name__ == '__main__':
    sync_tests(*sys.argv[1:])
