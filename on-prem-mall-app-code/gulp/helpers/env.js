#!/usr/bin/env node
'use strict';

const fs = require('fs');

module.exports = (fileName, environmentNames) => {
  if (!environmentNames) throw Error('No environment names were specified');

  const fileOptions = { encoding: 'utf8' };
  const fileExists = fs.existsSync(fileName, fileOptions);

  const toConstantName = (name) => 'IS_' + name.toUpperCase();
  const setConstant = (name, value) => { global[toConstantName(name)] = value };
  const saveEnvFile = (name) => fs.writeFileSync(fileName, name, fileOptions);
  const readEnvFile = () => fs.readFileSync(fileName, fileOptions, (file) => file) || '';

  load();

  function reset() {
    for (let name of environmentNames) setConstant(name, false);
  }

  /** Sets global constants, saves to .envrc  */
  function set(name) {
    if (!name) throw Error('Invalid or missing environment name');
    reset();
    setConstant(name, true);
    saveEnvFile(name);
  }

  /** Loads environment name from .envrc, sets constants */
  function load() {
    const name = fileExists ? readEnvFile() : false;
    if (name && environmentNames.includes(name)) set(name);
    else reset();
  }
  return { reset, set, load }
}
