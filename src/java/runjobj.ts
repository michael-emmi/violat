import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('runjobj');

const path = require('path');

const { gradleBuildJar } = require('./build.js');
import { Server } from './server';

type Arguments = {
  sourcePath: string;
  workPath: string;
  jars?: string[];
  javaHome: string;
};

export async function create({ sourcePath, workPath, jars = [], javaHome}: Arguments) {
  const main = 'org.mje.runjobj.Main';
  const name = 'runjobj';
  const jar = await gradleBuildJar({ sourcePath, workPath, name, javaHome });
  return Server.create(async () => jars.concat(jar), main, javaHome);
}
