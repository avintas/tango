import fs from "fs";
import path from "path";

interface ProcessBuilderManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  tasks: string[];
  requiredRules: string[];
  optionalRules: string[];
  defaults?: Record<string, unknown>;
  limits?: Record<string, { min?: number; max?: number }>;
}

async function discoverProcessBuilders(): Promise<
  Record<string, ProcessBuilderManifest>
> {
  const processBuildersDir = path.join(process.cwd(), "process-builders");
  const builders: Record<string, ProcessBuilderManifest> = {};

  if (!fs.existsSync(processBuildersDir)) {
    console.warn("process-builders directory not found");
    return builders;
  }

  // Find all process builder folders
  const entries = fs.readdirSync(processBuildersDir, { withFileTypes: true });
  const builderFolders = entries
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        dirent.name !== "core" &&
        dirent.name !== "shared",
    )
    .map((dirent) => dirent.name);

  for (const folderName of builderFolders) {
    const indexPath = path.join(
      processBuildersDir,
      folderName,
      "lib",
      "index.ts",
    );

    if (fs.existsSync(indexPath)) {
      try {
        // Use dynamic import to get metadata
        // Note: This requires the file to be TypeScript-compiled or we need to use ts-node/tsx
        const modulePath = path.resolve(indexPath);

        // For now, we'll read the file and extract metadata manually
        // In production, use tsx or compile first
        const fileContent = fs.readFileSync(indexPath, "utf-8");

        // Simple regex extraction (in production, use AST parsing)
        const metadataMatch = fileContent.match(
          /export const metadata[^=]*=\s*({[\s\S]*?});/,
        );

        if (metadataMatch) {
          // Evaluate the metadata object (simplified - in production use proper parsing)
          try {
            // Extract the object part
            const metadataStr = metadataMatch[1];
            // Use eval in a safe way (in production, use a proper TypeScript parser)
            const metadata = eval(`(${metadataStr})`) as ProcessBuilderManifest;

            if (metadata && metadata.id) {
              builders[metadata.id] = metadata;
              console.log(`✓ Discovered: ${metadata.name} (${metadata.id})`);
            }
          } catch (evalError) {
            console.warn(
              `⚠ Failed to parse metadata in ${folderName}:`,
              evalError,
            );
          }
        } else {
          console.warn(
            `⚠ No metadata export found in ${folderName}/lib/index.ts`,
          );
        }
      } catch (error) {
        console.error(`✗ Failed to load ${folderName}:`, error);
      }
    } else {
      console.warn(`⚠ No lib/index.ts found in ${folderName}`);
    }
  }

  return builders;
}

// Generate registry JSON file
async function generateRegistry() {
  try {
    const builders = await discoverProcessBuilders();
    const registryPath = path.join(
      process.cwd(),
      "process-builders-registry.json",
    );

    fs.writeFileSync(registryPath, JSON.stringify(builders, null, 2), "utf-8");

    console.log(
      `\n✓ Generated registry with ${Object.keys(builders).length} process builder(s)`,
    );
    console.log(`  Registry file: ${registryPath}`);

    if (Object.keys(builders).length === 0) {
      console.warn(
        "\n⚠ No process builders found. Make sure each builder has lib/index.ts with metadata export.",
      );
    }
  } catch (error) {
    console.error("Failed to generate registry:", error);
    process.exit(1);
  }
}

generateRegistry();
