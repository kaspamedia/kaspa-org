# Kaspa.org Internationalization

This context defines the language used for publishing complete, reviewed translations of the Kaspa.org experience.

## Language

**Locale Catalog**:
The complete set of messages for one locale, grouped by the same namespaces as the English source catalog.
_Avoid_: Translation file, language JSON

**Build Artifact**:
A generated, locale-specific standalone Rusty Kaspa browser example published with the site.
_Avoid_: Localized example file

**Publication Profile**:
The resolved locale and route availability for one build target or controlled test scenario.
_Avoid_: Language state, locale mode

**Publication Inventory**:
The locales, routes, metadata endpoints, and Build Artifacts exposed or withheld by a Publication Profile.
_Avoid_: Locale matrix, route list
