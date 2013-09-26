import sys
import traceback


def add_error_marker(text, position, start_line=1):
    """Add a caret marking a given position in a string of input.

    Returns (new_text, caret_line).
    """
    indent = "    "
    lines = []
    caret_line = start_line
    for line in text.split("\n"):
        lines.append(indent + line)

        if 0 <= position <= len(line):
            lines.append(indent + (" " * position) + "^")
            caret_line = start_line

        position -= len(line)
        position -= 1  # for the newline
        start_line += 1

    return "\n".join(lines), caret_line


class SassError(Exception):
    """Error class that wraps another exception and attempts to bolt on some
    useful context.
    """
    def __init__(self, exc, rule=None, expression=None, expression_pos=None):
        self.exc = exc

        self.rule_stack = []
        if rule:
            self.rule_stack.append(rule)

        self.expression = expression
        self.expression_pos = expression_pos

        _, _, self.original_traceback = sys.exc_info()

    def add_rule(self, rule):
        """Add a new rule to the "stack" of rules -- this is used to track,
        e.g., how a file was ultimately imported.
        """
        self.rule_stack.append(rule)

    def format_prefix(self):
        # TODO this contains NULs and line numbers; could be much prettier
        if self.rule_stack:
            return "Error parsing block:\n" + "    " + self.rule_stack[0].unparsed_contents
        else:
            return "Unknown error"

    def __str__(self):
        prefix = self.format_prefix()

        ret = [prefix, "\n\n"]

        if self.rule_stack:
            # TODO this looks very neat-o but doesn't actually work because
            # manage_children doesn't recurse for imports  :)
            ret.extend(("From ", self.rule_stack[0].file_and_line, "\n"))
            last_file = self.rule_stack[0].source_file

            for rule in self.rule_stack[1:]:
                if rule.source_file is not last_file:
                    ret.extend(("...imported from ", rule.file_and_line, "\n"))
                last_file = rule.source_file

            ret.append("\n")

        ret.append("Traceback:\n")
        ret.extend(traceback.format_tb(self.original_traceback))
        ret.extend((type(self.exc).__name__, ": ", str(self.exc), "\n"))
        return ''.join(ret)


class SassParseError(SassError):
    """Error raised when parsing a Sass expression fails."""

    def format_prefix(self):
        decorated_expr, line = add_error_marker(self.expression, self.expression_pos or -1)
        return """Error parsing expression:\n""" + decorated_expr


class SassEvaluationError(SassError):
    """Error raised when evaluating a parsed expression fails."""

    def format_prefix(self):
        # TODO would be nice for the AST to have position information
        # TODO might be nice to print the AST and indicate where the failure
        # was?
        decorated_expr, line = add_error_marker(self.expression, self.expression_pos or -1)
        return """Error evaluating expression:\n""" + decorated_expr
