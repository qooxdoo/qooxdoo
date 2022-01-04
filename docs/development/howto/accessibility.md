# Accessibility

## Motivation

Accessibility is an important topic in modern web development, in order to allow assistive technologies to better help people with disabilities. Achieving this is not a simple goal, and requires much work from Qooxdoo as a framework, as well as you as a developer.

## Short summary

### Make widgets more accessible

- Search for suitable ARIA roles
- Implement necessary ARIA attributes according to the specification; use examples to orient the reader
- Use widget functions setAriaLabel(label) {}, addAriaLabelledBy(...labelWidgets) {}, addAriaDescribedBy(...describingWidgets) {}

### Make views/forms, e.g. dialogs, more accessible

- Each widget which can not be read out by itself, e.g. a button with only an icon, needs a label or a description. This can be a string, by setting the `aria-label` attrbute; or an array of ids: see `aria-labelledby` and `aria-describedby`
- Each widget which can be read out but needs to have `aria-labelledby`, should have itself in the space-seperated id list in the last position, too
- Every piece of information you give the user visually should be given to screenreader users too.

## Details

### General
There are different types of users that need to be considered: normal unrestricted users, keyboard-only users, and screen reader users. 
Accessibility regarding keyboard is quite self-explanatory. Components must be operable with tab, arrow keys and other keys + modifiers. This is not standardized or specified, but there are guidelines. For example, screen reader users usually do not have access to visual information, so that information must be conveyed via screen readers. Everything must be read aloud, down to the smallest detail, if possible. Example: If a text field is described by a label, this association must also be presented to the screen reader. This is implemented in browser applications with ARIA attributes from the WAI-ARIA Specification https://www.w3.org/TR/wai-aria-1.1/. For accessibility, you can use the specification and the corresponding examples https://www.w3.org/TR/wai-aria-practices/examples/ and native HTML elements.
Not all qooxdoo widgets are barrier-free yet. Supported so far are: Button, Checkbox, Combobox, Menu, RadioButton, SelectBox, Slider, Table, Tabview, ToggleButton, Toolbar and Window. All other or new components must be adapted according to the specification. Often the attribute `role` is sufficient.

### Focus Handling
Qooxdoo uses its own handler for focus management. This has advantages and disadvantages. In short these are:
Advantages:
  - Coordinate-based focus handling. As a developer you don't have to worry about what order the code is in or what the DOM node structure looks like. Everything has a logical visual tab order.
  - Focus Roots: dialogs and windows are focus roots, tabbing does not leave the widget until it is closed
Disadvantages:
  - Coordinate-based focus handling. Smallest visual shifts, especially individual margins, could change tab order.
  - Non-QX components are not directly focusable. 

### Screen reader
Focusable components without visually visible text, e.g. an icon button, must be read aloud. This can be achieved via several attributes. 
- `aria-label` is specified with a string and replaces any readable content
- `aria-labelledby` is similar to aria-label with the difference that a space-separated list of ids of DOM elements is specified. These elements are used as labels instead of a string
- `aria-describedby` works like aria-labelledby, but includes ids of DOM elements
- `aria-activedescendant` is an important attribute regarding focus handling. Several widgets have children which are not DOM focusable, but keep a highlight or active state, e.g., SelectBox. You can rotate through the options with the mouse or keyboard, but you can't tab through them. In this case, `aria-activedescendant` is used. You set it on the Parent DOM element which receives focus, and save in it the id of the current active/highlighted DOM element. That way the `aria-activedescendant` will be read out if the id changes.
