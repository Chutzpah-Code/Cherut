// Explicit global reference to @types/multer's ambient `Express.Multer.File`
// declaration merge.
//
// Why this file exists: @types/express@5 moved the ambient `Express`
// namespace out of @types/express itself and into
// @types/express-serve-static-core. In this monorepo, TypeScript's implicit
// "auto-include every package under node_modules/@types" behavior has shown
// to be unreliable about picking up @types/multer's merge into that
// namespace on a clean install (works with a stale/cached node_modules,
// fails — "Namespace 'global.Express' has no exported member 'Multer'" —
// on a fresh one), even though every other package here that needs
// Express.Multer.File (finance, vision-board) relies on the exact same
// implicit inclusion. A triple-slash reference resolves the package
// explicitly via Node module resolution instead of implicit directory
// scanning, which is robust regardless of where npm hoists it.
/// <reference types="multer" />
