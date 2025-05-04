import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";
import path from "path";

import { Command } from "../../interfaces/interfaces";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map<string, Command>();

const loadCommands = (dirPath: string, category: string) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath, path.basename(fullPath));
    } else if (!file.startsWith("_") && (file.endsWith(".ts") || file.endsWith(".js"))) {
      const commandName = file.replace(/\.(ts|js)$/, "");
      const fileUrl = pathToFileURL(fullPath).href;

      import(fileUrl).then((module) => {
        commands.set(commandName, {
          name: commandName,
          description: module.default.description,
          aliases: module.default.aliases || [],
          group: module.default.group || false,
          admin: module.default.admin || false,
          owner: module.default.owner || false,
          isBotAdmin: module.default.isBotAdmin || false,
          exec: module.default.exec,
          category: category,
        });
      });
    }
  }
};

loadCommands(__dirname, path.basename(__dirname));

export default commands;
