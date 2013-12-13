/**
 * Annotate escopes with load-/run-time marks.
 */

function is_defer_function(node) {
    return (
        node.type == "FunctionExpression" &&
        node.parent.type == 'Property' &&
        node.parent.key.type == 'Identifier' &&
        node.parent.key.name == 'defer'
    );
}

function is_immediate_call(node) {
    return (node.type == "FunctionExpression" 
        && node.parent.type === "CallExpression");
}

function annotate(scope, parent_load) {
    var node = scope.block;
    if (scope.type === 'global') {
        scope.is_load_time = true
    } else if (scope.type === 'function') {
        if (is_defer_function(node)) {
            scope.is_load_time = true;
        } else if (is_immediate_call(node)) {
            scope.is_load_time = parent_load; // inherit
        } else {
            scope.is_load_time = false;
        }
    } else {
      scope.is_load_time = parent_load; // inherit  
    };
    for (cld in scope.childScopes) {
        annotate(cld, scope.is_load_time);
    }
}

module.exports = {
    annotate : annotate,
};
