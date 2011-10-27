tests correct job de-referencing:
- an imported job referencing a shadowed job gets the shadowing job
- an imported job referencing a renamed (during) job gets the renamed job
- an imported job referencing a non-imported job gets the non-imported job
