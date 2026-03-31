import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import prompts from "prompts";

interface ModelField {
  name: string;
  type: string;
  isOptional: boolean;
  isRelation: boolean;
  relationType?: "one" | "many"
  relationModel?: string;
}

interface Model {
  name: string;
  fields: ModelField[];
  relations: ModelField[];
}

function buildNestedInclude(
  relations: ModelField[],
  allModels: Model[],
  depth: number = 1,
  visitedModels: string[] = []
): string {
  if (relations.length === 0) {
    return "";
  }

  const nestedIncludes: string[] = [];
  const indent = "      ".repeat(depth);

  for (const rel of relations) {
    if (!rel.relationModel) continue;

    if (visitedModels.includes(rel.relationModel)) {
      nestedIncludes.push(`${indent}${rel.name}: true,`);
      continue;
    }

    const relatedModel = allModels.find((m) => m.name === rel.relationModel);

    if (!relatedModel || relatedModel.relations.length === 0) {
      nestedIncludes.push(`${indent}${rel.name}: true,`);
      continue;
    }

    const newVisited = [...visitedModels, rel.relationModel];

    const nested = buildNestedInclude(
      relatedModel.relations,
      allModels,
      depth + 1,
      newVisited
    );

    if (nested) {
      nestedIncludes.push(
        `${indent}${rel.name}: {\n${indent}  include: {\n${nested}${indent}  },\n${indent}},`
      );
    } else {
      nestedIncludes.push(`${indent}${rel.name}: true,`);
    }
  }

  return nestedIncludes.join("\n");
}

function parsePrismaSchema(schemaPath: string): Model[] {
  const schemaContent = readFileSync(schemaPath, "utf-8");
  const models: Model[] = [];

  const modelRegex = /model\s+(\w+)\s*\{/g;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const modelName = match[1];
    const startPos = match.index + match[0].length;

    if (modelName.startsWith("_")) continue;

    let braceCount = 1;
    let endPos = startPos;
    while (braceCount > 0 && endPos < schemaContent.length) {
      if (schemaContent[endPos] === "{") braceCount++;
      if (schemaContent[endPos] === "}") braceCount--;
      endPos++;
    }

    const modelBody = schemaContent.substring(startPos, endPos - 1);
    const fields: ModelField[] = [];
    const relations: ModelField[] = [];

    const fieldLines = modelBody.split("\n");

    for (const line of fieldLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@"))
        continue;

      const isArrayType = /\[\]/.test(trimmed);
      const hasRelation = /@relation/.test(trimmed);

      if (hasRelation || isArrayType) {
        const fieldMatch = trimmed.match(/(\w+)\s+(\w+)(\[\])?/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];
          const isOptional = trimmed.includes("?");

          relations.push({
            name: fieldName,
            type: fieldType,
            isOptional,
            isRelation: true,
            relationType: isArrayType ? "many" : "one",
            relationModel: fieldType,
          });
        }
      } else {
        const fieldMatch = trimmed.match(/(\w+)\s+(\w+)(\?)?/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];
          const isOptional = fieldMatch[3] === "?";
          const isRelation = false;

          if (
            fieldName === "id" ||
            fieldType === "String" ||
            fieldType === "Int" ||
            fieldType === "Float" ||
            fieldType === "Boolean" ||
            fieldType === "DateTime"
          ) {
            fields.push({
              name: fieldName,
              type: fieldType,
              isOptional,
              isRelation,
            });
          }
        }
      }
    }

    models.push({ name: modelName, fields, relations });
  }

  return models;
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPlural(str: string): string {
  if (str.endsWith("y")) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("z")) {
    return str + "es";
  }
  return str + "s";
}

function generateCreateController(model: Model, moduleName: string): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const requiredFields = model.fields.filter(
    (f) =>
      !f.isOptional &&
      f.name !== "id" &&
      f.name !== "createdAt" &&
      f.name !== "updatedAt"
  );

  const optionalFields = model.fields.filter(
    (f) =>
      f.isOptional &&
      f.name !== "id" &&
      f.name !== "createdAt" &&
      f.name !== "updatedAt"
  );

  const createFields = requiredFields
    .map((f) => `    ${f.name}: data.${f.name},`)
    .join("\n");

  const optionalFieldsSection = optionalFields
    .map((f) => `    ${f.name}: data.${f.name},`)
    .join("\n");

  const relationFields = model.relations
    .filter((rel) => rel.relationType === "many")
    .map(
      (rel) =>
        `    ${rel.name}: data.${rel.name}?.create ? { create: data.${rel.name}.create } : undefined,`
    )
    .join("\n");

  const relationSection = relationFields ? `\n${relationFields}\n` : "";
  const optionalSection = optionalFieldsSection
    ? `\n${optionalFieldsSection}\n`
    : "";

  return `import { Request, Response } from "express";
import { prisma } from "../../../lib";

export async function create${modelName}(req: Request, res: Response) {
  try {
    const data = req.body;

    const ${modelNameCamel} = await prisma.${modelNameCamel}.create({
      data: {
${createFields}${optionalSection}${relationSection}
      },
    });

    res.status(201).json(${modelNameCamel});
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
`;
}

function generateListController(
  model: Model,
  moduleName: string,
  allModels: Model[]
): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = toPlural(modelNameCamel);

  // Build nested include object for relations, starting with current model in visited path
  const includeFields = buildNestedInclude(model.relations, allModels, 1, [
    modelName,
  ]);

  const includeSection =
    model.relations.length > 0
      ? `\n      include: {\n${includeFields}\n      },`
      : "";

  return `import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function list${modelName}(req: Request, res: Response) {
  try {
    const ${modelNamePlural} = await prisma.${modelNameCamel}.findMany({
      orderBy: {
        createdAt: "desc",
      },${includeSection}
    });

    res.json(${modelNamePlural});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
`;
}

function generateShowController(
  model: Model,
  moduleName: string,
  allModels: Model[]
): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);

  const includeFields = buildNestedInclude(model.relations, allModels, 1, [
    modelName,
  ]);

  const includeSection =
    model.relations.length > 0
      ? `\n      include: {\n${includeFields}\n      },`
      : "";

  return `import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function show${modelName}(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const ${modelNameCamel} = await prisma.${modelNameCamel}.findUnique({
      where: { id },${includeSection}
    });

    if (!${modelNameCamel}) {
      return res.status(404).json({ error: "${modelName} not found" });
    }

    res.json(${modelNameCamel});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
`;
}

function generateUpdateController(model: Model, moduleName: string): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const updatableFields = model.fields.filter(
    (f) => f.name !== "id" && f.name !== "createdAt" && f.name !== "updatedAt"
  );

  const updateFields = updatableFields
    .map((f) => `        ${f.name}: data.${f.name},`)
    .join("\n");

  return `import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function update${modelName}(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const ${modelNameCamel} = await prisma.${modelNameCamel}.update({
      where: { id },
      data: {
${updateFields}
      },
    });

    res.json(${modelNameCamel});
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "${modelName} not found" });
    }
    res.status(400).json({ error: error.message });
  }
}
`;
}

function generateDeleteController(model: Model, moduleName: string): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);

  return `import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function delete${modelName}(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.${modelNameCamel}.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "${modelName} not found" });
    }
    res.status(500).json({ error: error.message });
  }
}
`;
}

// Generate controller index
function generateControllerIndex(model: Model, moduleName: string): string {
  const modelName = model.name;

  return `export { create${modelName} } from "./create${modelName}";
export { list${modelName} } from "./list${modelName}";
export { show${modelName} } from "./show${modelName}";
export { update${modelName} } from "./update${modelName}";
export { delete${modelName} } from "./delete${modelName}";
`;
}

function generateRoutes(model: Model, moduleName: string): string {
  const modelName = model.name;

  return `import { Router } from "express";
import {
  create${modelName},
  list${modelName},
  show${modelName},
  update${modelName},
  delete${modelName},
} from "../controller";

const router = Router();

router.get("/", list${modelName});
router.get("/:id", show${modelName});
router.post("/", create${modelName});
router.put("/:id", update${modelName});
router.delete("/:id", delete${modelName});

export default router;
`;
}

async function main() {
  const schemaPath = join(process.cwd(), "prisma", "schema.prisma");

  if (!existsSync(schemaPath)) {
    console.error("❌ Prisma schema not found at:", schemaPath);
    process.exit(1);
  }

  const models = parsePrismaSchema(schemaPath);

  if (models.length === 0) {
    console.error("❌ No models found in schema");
    process.exit(1);
  }

  const moduleResponse = await prompts({
    type: "text",
    name: "moduleName",
    message: "What's the module name?",
    validate: (value) => (value.length > 0 ? true : "Module name is required"),
  });

  if (!moduleResponse.moduleName) {
    process.exit(0);
  }

  const modelResponse = await prompts({
    type: "select",
    name: "modelName",
    message: "Which model should this module use?",
    choices: models.map((m) => ({
      title: m.name,
      value: m.name,
    })),
  });

  if (!modelResponse.modelName) {
    process.exit(0);
  }

  const selectedModel = models.find((m) => m.name === modelResponse.modelName);

  if (!selectedModel) {
    console.error("❌ Model not found");
    process.exit(1);
  }

  const moduleDir = join(
    process.cwd(),
    "src",
    "_modules",
    moduleResponse.moduleName
  );
  const controllerDir = join(moduleDir, "controller");
  const routesDir = join(moduleDir, "routes");

  mkdirSync(controllerDir, { recursive: true });
  mkdirSync(routesDir, { recursive: true });

  const modelName = selectedModel.name;

  writeFileSync(
    join(controllerDir, `create${modelName}.ts`),
    generateCreateController(selectedModel, moduleResponse.moduleName)
  );

  writeFileSync(
    join(controllerDir, `list${modelName}.ts`),
    generateListController(selectedModel, moduleResponse.moduleName, models)
  );

  writeFileSync(
    join(controllerDir, `show${modelName}.ts`),
    generateShowController(selectedModel, moduleResponse.moduleName, models)
  );

  writeFileSync(
    join(controllerDir, `update${modelName}.ts`),
    generateUpdateController(selectedModel, moduleResponse.moduleName)
  );

  writeFileSync(
    join(controllerDir, `delete${modelName}.ts`),
    generateDeleteController(selectedModel, moduleResponse.moduleName)
  );

  writeFileSync(
    join(controllerDir, "index.ts"),
    generateControllerIndex(selectedModel, moduleResponse.moduleName)
  );

  writeFileSync(
    join(routesDir, "index.ts"),
    generateRoutes(selectedModel, moduleResponse.moduleName)
  );

  console.log(
    `\n✅ Module "${moduleResponse.moduleName}" generated successfully!`
  );
  console.log(`📁 Location: src/_modules/${moduleResponse.moduleName}/`);
  console.log(`\n📝 Generated files:`);
  console.log(`   - controller/create${modelName}.ts`);
  console.log(`   - controller/list${modelName}.ts`);
  console.log(`   - controller/show${modelName}.ts`);
  console.log(`   - controller/update${modelName}.ts`);
  console.log(`   - controller/delete${modelName}.ts`);
  console.log(`   - controller/index.ts`);
  console.log(`   - routes/index.ts`);
}

main().catch(console.error);
