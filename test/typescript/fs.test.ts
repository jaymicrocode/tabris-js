import {fs} from 'tabris';

let path: string;
let data: ArrayBuffer | Blob;
let text: string;
let files: string[];
let none: void;
let bool: boolean;

async function test() {

  // Properties
  path = fs.filesDir;
  path = fs.cacheDir;

  // Methods
  data = await fs.readFile(path);
  text = await fs.readFile(path, 'utf-8');
  files = await fs.readDir(path);
  none = await fs.writeFile(path, data);
  none = await fs.writeFile(path, text, 'utf-8');
  bool = await fs.appendToFile(path, data);
  bool = await fs.appendToFile(path, text, 'utf-8');
  none = await fs.removeFile(path);
  none = await fs.removeDir(path);
  bool = await fs.createDir(path);
  bool = await fs.remove(path);
  bool = fs.isFile(path);
  bool = fs.isDir(path);

}
