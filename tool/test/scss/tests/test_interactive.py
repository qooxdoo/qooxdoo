from scss.tool import SassRepl


def test_repl_expression():
    repl = SassRepl()

    assert list(repl('1px + 2px')) == ['3px']


def test_repl_show():
    repl = SassRepl()

    prettyvars, = repl('show vars')
    assert '$AUTHOR-EMAIL' in prettyvars
