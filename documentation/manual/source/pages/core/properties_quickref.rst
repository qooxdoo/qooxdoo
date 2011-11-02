
.. _pages/properties_quickref#properties_quick_reference:

Properties Quick Reference
**************************

This is a quick reference for the various property features available in qooxdoo.

Properties are declared in the constructor map of the class as a dedicated key-value pair (here called ``properties_decl``). This is the quick reference for properties_decl (expressed in an :doc:`EBNF-ish </pages/tool/ebnf_like>` way):

::

    properties_decl  := 'properties' ':' properites_map

    properties_map   := '{' { prop_spec ',' } '}'
    prop_spec        := '"' <property_name> '"' ':' 
                            '{' { property_feature ',' } '}'

    property_feature := nullable_spec      |
                        apply_spec         |
                        event_spec         |
                        init_spec          |
                        refine_spec        |
                        check_spec         |
                        themeable_spec     |
                        inheritable_spec   |
                        group_spec         |
                        mode_spec          |
                        validate_spec      |
                        dereference_spec

    nullable_spec    := 'nullable'     ':' bool_val
    apply_spec       := 'apply'        ':' '"' <FunctionName> '"'
    event_spec       := 'event'        ':' '"' <EventName> '"'
    init_spec        := 'init'         ':' <InitVal>
    refine_spec      := 'refine'       ':' bool_val

    check_spec       := 'check'        ':' '"' type_spec '"'       |
                                           '"' <ClassName> '"'     |
                                           '"' <InterfaceName> '"' |
                                           enum_spec               |
                                           inline_function         |
                                           '"' bool_expression '"'

    validate_spec    := 'validate'     ':' '"' <FunctionName> '"'  |
                                           '<Function>'

    dereference_spec := 'dereference'     ':' bool_val

    themeable_spec   := 'themeable'    ':' bool_val
    inheritable_spec := 'inheritable'  ':' bool_val
    group_spec       := 'group'        ':' enum_spec
    mode_spec        := 'mode'         ':' '"' 'shorthand' '"'

    type_spec        := 'Boolean' | 'String' | 'Number' | 'Integer' | 'Float' |
                        'Double'  | 'Object' | 'Array'  | 'Map'     | 'Class' |
                        'Mixin'   | 'Interface'         | 'Theme'   | 'Error' |
                        'RegExp'  | 'Function'          | 'Date'    | 'Node'  |
                        'Element' | 'Document'          | 'Window'  | 'Event'

    bool_val         := 'true' | 'false'
    enum_spec        := '[' <val1>',' <val2> ',' ... ',' <valN> ']'
    inline_function  := ? JavaScript anonymous function 'function (..) 
                          { ... }' ?
    bool_expression  := ? JavaScript expression evaluating to true/false ?

