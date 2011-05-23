.. _pages/mixin_quickref#mixin_quick_ref:

Mixin Quick Ref
***************

This is a quick reference for the various features of a qooxdoo mixin declaration. It uses an :doc:`EBNF-like syntax </pages/tool/ebnf_like>`.

It is much like a class declaration, with a more limited set of features. Properties are documented on their :doc:`own page <properties_quickref>`.

::

    mixin_decl      := 'qx.Mixin.define' '(' '"' <name.space.MixinName> '"' ','
                         { feature_spec ',' }
                       ')'

    feature_spec    := 
                       'include'    ':' include_spec     |
                       'construct'  ':' construct_spec   |
                       'statics'    ':' statics_spec     |
                       'properties' ':' properties_spec  |
                       'members'    ':' members_spec     |
                       'events'     ':' events_spec      |
                       'destruct'   ':' destruct_spec 

    include_spec    := <name.of.Mixin> | 
                       '[' <name.of.Mixin1> ',' <name.of.Mixin2> ',' ... ']'

    construct_spec  := js_function_value

    statics_spec    := c_map

    properties_spec := ? see separate properties quick ref ?

    members_spec    := c_map

    events_spec     := '{' 
                        { '"' <event_name> '"' ':' '"' qx_event_type '"' ',' }
                       '}'

    destruct_spec   := '{' 
                        { 'this._disposeFields'     '(' <fields_list> ')' ';' }
                        { 'this._disposeObjects'    '(' <fields_list> ')' ';' }
                        { 'this._disposeObjectDeep' '(' <deep_field> ')'      }
                        '}'

    c_map           := '{'
                        { <key> ':' ( js_primitive_value | 
                                      js_reference_value | 
                                      js_function_value  |
                                      js_function_call   ) ',' } 
                       '}'

    js_function_value   := ? Javascript anonymous function 'function (...) 
                             {...}' ?
    js_function_call    := ? Javascript function call 'foo(...)' ?
    js_primitive_value  := ? any value from the Javascript primitive types ?
    js_reference_value  := ? any value from the Javascript reference types ?
    qx_event_type       := ? any qooxdoo event type class name, e.g. 
                             'qx.event.type.DataEvent' ?

