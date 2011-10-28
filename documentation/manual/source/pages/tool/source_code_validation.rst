.. _pages/tool/source_code_validation#source_code_validation:

Source Code Validation
**********************
qooxdoo includes its own Javascript validator, **Ecmalint**, which application developers can use to check their source files for errors. It is started by running the *lint* generator job in an application directory:

::

    ./generate.py lint

.. _pages/tool/source_code_validation#critical_warnings:

Critical Warnings
=================

.. _pages/tool/source_code_validation#use_of_undefined_or_global_identifier:

Use of undefined or global identifier
-------------------------------------
This warning indicates that an unknown global variable is used. This can be caused by:

* The variable is not declared as local variable using ``var``
* The variable name is misspelled
* It is OK to use this global but EcmaLint does not know about it. This can be fixed by passing the variable name as known variable to the EcmaLint call or by adding a ``@lint ignoreUndefined(VARIABLE_NAME)`` doc comment to the method's API doc comment

.. _pages/tool/source_code_validation#unused_identifier:

Unused identifier
-----------------

.. _pages/tool/source_code_validation#map_key_redefined:

Map key redefined
-----------------

.. _pages/tool/source_code_validation#data_field_has_a_reference_value:

Data field has a reference value
--------------------------------
**Hint:** If data fields are initialized in the members map with reference values like arrays or maps they will be shared between all instances of the class. Usually it is better to set the value to 'null' and initialize it in the constructor

.. _pages/tool/source_code_validation#use_of_deprecated_identifier:

Use of deprecated identifier
----------------------------

.. _pages/tool/source_code_validation#critical_warning_for_framework:

Critical Warning (for framework)
================================

.. _pages/tool/source_code_validation#potentially_non-local_private_data_field:

Potentially non-local private data field
----------------------------------------
**Hint:** You should never do this.

.. _pages/tool/source_code_validation#protected_data_field:

Protected data field
--------------------
**Hint:** Protected data fields are deprecated. Better use private fields in combination with getter and setter methods.

**Comment:** It appears that this isn't an issue that is generically to be solved as the hint suggest. See the corresponding `bug report <http://bugzilla.qooxdoo.org/show_bug.cgi?id=2095>`_.

.. _pages/tool/source_code_validation#undeclared_private_data_field:

Undeclared private data field
-----------------------------
**Hint:** You should list this field in the members section.

.. _pages/tool/source_code_validation#coding_style_warnings:

Coding Style Warnings
=====================

.. _pages/tool/source_code_validation#the_statement_of_loops_and_conditions_must_be_enclosed_by_a_block_in_braces:

The statement of loops and conditions must be enclosed by a block in braces
---------------------------------------------------------------------------

.. _pages/tool/source_code_validation#multiply_declared_identifier:

Multiply declared identifier
----------------------------

.. _pages/tool/source_code_validation#explicitly_ignoring_messages:

Explicitly ignoring messages
============================

The following doc comments can be used to explicitly ignore specific lint messages:

::

    @lint ignoreUnused(x, y)
    @lint ignoreDeprecated(alert)
    @lint ignoreUndefined(button1, foo)
    @lint ignoreReferenceField(field)

Before lint prints a warning it walks up the AST and looks for the next enclosing API doc comment. Usually these comments should be placed in method JsDoc comments or in the class comment.

Suppressing additional warnings is not supported because they are always an
error (e.g. duplicate map keys) or are very hard to implement (e.g. protected
warnings).

