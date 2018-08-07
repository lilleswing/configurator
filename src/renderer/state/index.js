import { toggleLoading } from './core';
import { updateConfig } from './configure';
import { _currentState } from './settings';
import _ from 'lodash';
import fs from 'fs';
import Bluebird from 'bluebird';

const readFile = Bluebird.promisify(fs.readFile);

export { useCoreState } from './core';
export { useConfigureState } from './configure';
export { useSettingsState } from './settings';

export async function loadDefaultConfig(keyboard, variant) {
  const recentDls = _currentState('recentDls');
  const recent = _.head(recentDls[`${keyboard.keyboard.display}__${variant}`] || []);

  return recent ? loadLocalConfig(recent.json) : loadRemoteConfig(keyboard, variant);
}

/**
 * @param {*} keyboard
 * @param {string} variant
 * @param {string} layout
 * @param {string} baseUri
 * @param {string} locale
 */
export async function loadRemoteConfig(keyboard, variant, layout = undefined, baseUri = undefined, locale = undefined) {
  const defLayout = keyboard.keyboard.layouts[variant][0];
  const uri = `${baseUri || _currentState('uri')}layouts/${keyboard.keyboard.names[0]}-${layout || defLayout}.json`;
  toggleLoading();
  const config = await fetch(uri).then(resp => resp.json());
  updateConfig(config, locale || _currentState('locale'));
  toggleLoading();
}

/**
 * @param {string} filepath
 * @param {string} locale
 */
export async function loadLocalConfig(filepath, locale = undefined) {
  toggleLoading();
  const buffer = await readFile(filepath);
  const config = JSON.parse(buffer.toString('utf8'));
  updateConfig(config, locale || _currentState('locale'));
  toggleLoading();
}
