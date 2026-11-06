# UI documentation

`packages/ui/README.md` is a component catalog. Keep it to a short package description
and a list of the available public component families.

For each component, include only:

- its name, linked to its component directory or existing component documentation;
- one short sentence explaining its purpose at a high level.

Keep the catalog aligned with the package's public exports. Group composed parts,
such as the alert dialog's title and actions, under their component family.

Do not add HTML, Vue, TypeScript or CSS examples, import instructions, prop tables,
API walkthroughs, styling specifications or implementation details to the package
README. Usage examples belong in Storybook or component-specific documentation;
contributor conventions belong in `.agents/docs/`.
