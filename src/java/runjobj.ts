import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('runjobj');

const path = require('path');

const { gradleBuildJar } = require('./build.js');
import { Server } from './server';

export class RunJavaObjectServer extends Server {
  constructor({ sourcePath, workPath, jars = [] }) {
    super(async () => jars.concat(await gradleBuildJar({ sourcePath, workPath, name: 'runjobj' })), 'org.mje.runjobj.Main');
  }
}
