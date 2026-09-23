# STLC cross-run knowledge base

Append-only log of lessons learned across pipeline runs. One line per entry:

`- [<run-id>][PhN] <what went wrong> -> <what to do instead>`

Phase 3 (test case review), Phase 5 (automation review), and Phase 8 (self-heal) append entries here. Phase 2 (test cases) and Phase 4 (automation generate) read this file before generating new content, to avoid repeating known mistakes.

---
- [FG-002][Ph5] Generated duplicate package/class declarations and reduced multi-step cases to save-only checks -> validate generated source compilation and trace each approved test case's full expected behavior into executable assertions.
- [FG-002][Ph5] Allocation scenarios omitted authenticated setup, post-save synchronization, and complete per-field assertions -> validate preconditions, wait for asynchronous save/validation state, and map field-level expected behavior explicitly.
- [FG-002][Ph5] TC-005 treated every populated field as affected and retained placeholder selectors -> define expected affected-field mappings separately from valid-field assertions and confirm target selectors before execution.
- [FG-002][Ph5] Runner-wide feature discovery included an undefined legacy login step and the configured target did not match generated selectors -> validate all features selected by the runner and verify the selector contract against the execution URL before passing automation review.
- [FG-003][Ph3] Required smoke and UI coverage was present only by scenario intent, not by structured test type -> align each classification-required test type explicitly in both markdown and JSON artifacts before review.
- [FG-003][Ph5] Runner-wide discovery still includes an undefined legacy login step -> validate every feature selected by the configured runner before passing automation review.
- [FG-003][Ph5] TC-007 checked only a generic blocked-save flag for invalid contact data -> assert field-level validation and verify invalid values are not persisted after reopening.
