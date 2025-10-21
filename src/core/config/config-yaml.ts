import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

function tryPaths(configPath?: string) {
  if (configPath) {
    return loadFromPath(configPath);
  }
  const defaultFileNames = ['config.yml', 'config.yaml'];
  const defaultFolders = [
    '', //include cwd
    'src/config',
    'static/config',
  ];
  for (const folder of defaultFolders) {
    for (const fileName of defaultFileNames) {
      const configPath = path.join(process.cwd(), folder, fileName);
      if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
        return loadFromPath(configPath);
      }
    }
  }
  return null;
}

function loadFromPath(_path: string) {
  _path = path.normalize(_path);
  try {
    if (fs.existsSync(_path)) {
      return yaml.load(fs.readFileSync(_path, { encoding: 'utf-8' }));
    }
  } catch (err: any) {
    throw err;
  }
}

function parseYAMLConfig(configPath?: string) {
  return tryPaths(configPath) ?? {};
}

export default parseYAMLConfig;
