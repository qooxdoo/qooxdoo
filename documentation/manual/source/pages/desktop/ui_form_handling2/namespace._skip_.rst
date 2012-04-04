.. _pages/ui_form_handling2/namespace#reorganisation_of_qx.ui.form_namespace:

Reorganisation of qx.ui.form namespace
**************************************

.. _pages/ui_form_handling2/namespace#reasons:

Reasons
=======
We recently added more and more classes to the namespace and we figured out, that we are mixing up the concepts in the namespace. On one hand, we do have the building blocks of forms like buttons, textfields and so on in the namespace. On the other hand, we do have some more advanced concepts in there like form, validation, ... .

.. _pages/ui_form_handling2/namespace#proposal_current:

Proposal (current)
==================

::

  - qx
   - ui

     - button
       # Button
       # MenuButton
       # SplitButton
       # RepeatButton
       # ToggleButton

     - input

        - text
          # AbstractField
          # Area
          # Field
          # Password

        - select
          # IRadioItem
          # AbstracSelectBox
          # SelectBox
          # RadioGroup
          # RadioButton

       # Spinner
       # DateField
       # CheckBox
       # Slider
       # ComboBox

     - list
       # ListItem
       # List

     - form

       - validation
         # AsyncValidator
         # Manager

       - renderer
          # IFormRenderer
          # Single
          # SinglePlaceholder
          # Double

       # Resetter 
       # IFormExecutable
       # IColorForm
       # IBooleanForm
       # INumberForm
       # IForm
       # IStringForm
       # IDateForm
       # IRange
       # MForm
       # Form
       # MFormElement (deprecated)
       # IFormElement (deprecated)

