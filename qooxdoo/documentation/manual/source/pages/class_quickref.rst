.. _pages/class_quickref#class_declaration_quick_ref:

Class Declaration Quick Ref
***************************

This is a quick reference for the various features of a qooxdoo class declaration. It uses an EBNF-like syntax.

Properties, a particular part of the class declaration, have quite an extensive sub-spec, and are therefore factored out to their :doc:`own page <properties_quickref>`.

::

    class_decl      := 'qx.Class.define' '(' '"' <name.space.ClassName> '"' ','
                         '{' { feature_spec ',' } '}'
                       ')'

    feature_spec    := 
                       'type'       ':' type_spec        |
                       'extend'     ':' extend_spec      |
                       'implement'  ':' implement_spec   |
                       'include'    ':' include_spec     |
                       'construct'  ':' construct_spec   |
                       'statics'    ':' statics_spec     |
                       'properties' ':' properties_spec  |
                       'members'    ':' members_spec     |
                       'settings'   ':' settings_spec    |
                       'variants'   ':' variants_spec    |
                       'events'     ':' events_spec      |
                       'defer'      ':' defer_spec       |
                       'destruct'   ':' destruct_spec 

    type_spec       := 'static' | 'abstract' | 'singleton'

    extend_spec     := <name.of.SuperClass>

    implement_spec  := <name.of.Interface> | 
                       '[' <name.of.Interface1> ',' <name.of.Interface2> ',' 
                           ... ']'

    include_spec    := <name.of.Mixin> | 
                       '[' <name.of.Mixin1> ',' <name.of.Mixin2> ',' ... ']'

    construct_spec  := js_function_value

    statics_spec    := c_map

    properties_spec := ? see separate properties quick ref ?

    members_spec    := c_map

    settings_spec   := '{' { '"' <settings_name> '"' ':' 
                                 ( js_primitive_value | js_reference_value ) 
                                 ',' } '}'

    variants_spec   := 'qx.Variant.select' '(' '"' <variantName> '"' ','
                         '{' { '"' <variantvalue_spec> '"' ':' <selectValue> 
                                   ',' } '}'
                       ')'

    events_spec     := '{' { '"' <event_name> '"' ':' '"' qx_event_type '"' 
                            ',' } '}'

    defer_spec      := js_function_value

    destruct_spec   := '{' 
                        [ 'this._disposeFields'     '(' <fields_list> ')' ';' ]
                        [ 'this._disposeObjects'    '(' <fields_list> ')' ';' ]
                        [ 'this._disposeObjectDeep' '(' <deep_field> ')'      ]
                        '}'

    c_map           := '{' { <key> ':' [ js_primitive_value | 
                                         js_reference_value | 
                                         js_function_value  |
                                         variants_spec      ] ',' } '}'

    js_function_value   := ? Javascript anonymous function 'function (...) {...}' ?
    js_primitive_value  := ? any value from the Javascript primitive types ?
    js_reference_value  := ? any value from the Javascript reference types ?
    qx_event_type       := ? any qooxdoo event type class name, e.g. 
                             'qx.event.type.DataEvent' ?

