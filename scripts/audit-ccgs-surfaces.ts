#!/usr/bin/env node
import { generateParityMatrix, inventoryCcgsSurfaces, writeParityReports } from "../src/ccgs-parity.js";
import { defaultProjectConfig } from "../src/projects.js";

const referenceRoot = process.env.CCGS_REFERENCE_ROOT ?? process.argv[2] ?? "/opt/data/repos/Claude-Code-Game-Studios";
const outDir = process.env.CCGS_PARITY_OUT ?? process.argv[3] ?? "references";
const config = defaultProjectConfig({ name: "Parity Audit Game", engine: "godot", mode: "prototype", nonInteractive: true });
const inventory = inventoryCcgsSurfaces(referenceRoot);
const matrix = generateParityMatrix(inventory, config);
writeParityReports(matrix, outDir);
console.log(`Wrote ${matrix.rows.length} CCGS parity rows to ${outDir}`);
