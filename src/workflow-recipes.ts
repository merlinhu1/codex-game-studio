import { randomUUID } from "node:crypto";
import { createTask, type StudioTask } from "./tasks.js";
import type { VerificationCommand } from "./codex-session.js";
import type { StudioRoleId } from "./roles.js";
import { workflowRegistry, type WorkflowId } from "./workflows.js";

export type WorkflowTaskRecipeItem = {
  key: string;
  title: string;
  role: StudioRoleId;
  files: string[];
  writeFiles: string[];
  dependencies: string[];
  verification?: VerificationCommand;
};

export type WorkflowTaskRecipe = {
  workflowId: WorkflowId;
  title: string;
  tasks: WorkflowTaskRecipeItem[];
};

export type CreateWorkflowTasksResult = {
  workflowId: WorkflowId;
  groupId: string;
  dryRun: boolean;
  tasks: Array<WorkflowTaskRecipeItem | StudioTask>;
  output: string;
};

export const workflowTaskRecipes: Partial<Record<WorkflowId, WorkflowTaskRecipe>> = {
  "vertical-slice": {
    workflowId: "vertical-slice",
    title: "Vertical Slice Task Graph",
    tasks: [
      { key: "plan", title: "Plan the smallest production-quality vertical slice", role: "producer", files: ["design/gdd.md"], writeFiles: [], dependencies: [] },
      { key: "design", title: "Define vertical-slice acceptance criteria and feature rules", role: "game-designer", files: ["design/gdd.md"], writeFiles: [], dependencies: ["plan"] },
      { key: "implement", title: "Implement the vertical-slice core loop", role: "gameplay-programmer", files: ["design/gdd.md"], writeFiles: [], dependencies: ["design"] },
      { key: "qa", title: "Verify vertical-slice playability and blockers", role: "qa-playtester", files: ["design/gdd.md"], writeFiles: [], dependencies: ["implement"] }
    ]
  },
  bugfix: {
    workflowId: "bugfix",
    title: "Bugfix Task Graph",
    tasks: [
      { key: "repro", title: "Reproduce and document the bug", role: "qa-playtester", files: [], writeFiles: [], dependencies: [] },
      { key: "fix", title: "Implement the smallest safe bug fix", role: "gameplay-programmer", files: [], writeFiles: [], dependencies: ["repro"] },
      { key: "verify", title: "Verify the bug fix and regression risk", role: "qa-playtester", files: [], writeFiles: [], dependencies: ["fix"] }
    ]
  },
  "ui-ux-review": {
    workflowId: "ui-ux-review",
    title: "UI/UX Review Task Graph",
    tasks: [
      { key: "ux", title: "Review the UI flow and interaction risks", role: "ui-ux-designer", files: ["design/gdd.md"], writeFiles: [], dependencies: [] },
      { key: "accessibility", title: "Review accessibility gaps in the UI flow", role: "accessibility-specialist", files: ["design/gdd.md"], writeFiles: [], dependencies: ["ux"] },
      { key: "qa", title: "Verify UI/UX review evidence and blockers", role: "qa-playtester", files: ["design/gdd.md"], writeFiles: [], dependencies: ["accessibility"] }
    ]
  },
  "release-checklist": {
    workflowId: "release-checklist",
    title: "Release Checklist Task Graph",
    tasks: [
      { key: "qa", title: "Validate release test evidence", role: "qa-playtester", files: ["production/timeline.md"], writeFiles: [], dependencies: [] },
      { key: "perf", title: "Review release performance risks", role: "performance-analyst", files: ["production/timeline.md"], writeFiles: [], dependencies: [] },
      { key: "security", title: "Review release security risks", role: "security-engineer", files: ["production/timeline.md"], writeFiles: [], dependencies: [] },
      { key: "release", title: "Synthesize ship or no-ship release checklist", role: "release-manager", files: ["production/timeline.md"], writeFiles: [], dependencies: ["qa", "perf", "security"] }
    ]
  }
};

export function workflowRecipeIds(): WorkflowId[] {
  return Object.keys(workflowTaskRecipes) as WorkflowId[];
}

function assertRecipe(id: string): WorkflowTaskRecipe {
  if (!workflowRegistry[id as WorkflowId]) throw new Error(`Unknown workflow "${id}"`);
  const recipe = workflowTaskRecipes[id as WorkflowId];
  if (!recipe) throw new Error(`Workflow "${id}" does not have a task recipe`);
  return recipe;
}

function formatRecipe(recipe: WorkflowTaskRecipe, groupId: string, created?: StudioTask[]): string {
  const lines = [`Workflow task recipe: ${recipe.workflowId}`, `Group: ${groupId}`];
  for (const item of recipe.tasks) {
    const createdTask = created?.find((task) => task.title === item.title);
    lines.push(`- ${createdTask?.id ?? item.key}: [${item.role}] ${item.title}`);
    lines.push(`  deps: ${item.dependencies.join(", ") || "none"}; writeFiles: ${item.writeFiles.join(", ") || "none"}`);
  }
  return lines.join("\n");
}

export function createWorkflowTasks(projectRoot: string, workflowId: string, options: { dryRun?: boolean } = {}): CreateWorkflowTasksResult {
  const recipe = assertRecipe(workflowId);
  const groupId = `${recipe.workflowId}-${randomUUID().slice(0, 8)}`;
  if (options.dryRun) return { workflowId: recipe.workflowId, groupId, dryRun: true, tasks: recipe.tasks, output: formatRecipe(recipe, groupId) };

  const createdByKey = new Map<string, StudioTask>();
  const created: StudioTask[] = [];
  for (const item of recipe.tasks) {
    const dependencies = item.dependencies.map((key) => {
      const dependency = createdByKey.get(key);
      if (!dependency) throw new Error(`Recipe ${recipe.workflowId} has unresolved dependency ${key}`);
      return dependency.id;
    });
    const task = createTask(projectRoot, {
      title: item.title,
      role: item.role,
      files: item.files,
      writeFiles: item.writeFiles,
      dependencies,
      workflowId: recipe.workflowId,
      groupId,
      verification: item.verification
    });
    createdByKey.set(item.key, task);
    created.push(task);
  }
  return { workflowId: recipe.workflowId, groupId, dryRun: false, tasks: created, output: formatRecipe(recipe, groupId, created) };
}
