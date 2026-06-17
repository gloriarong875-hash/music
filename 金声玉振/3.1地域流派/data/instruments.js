import { shengConfig } from './sheng.js';
import { drumConfig } from './drum.js';
import { diziConfig } from './dizi.js';
import { qinConfig } from './qin.js';
import { xunConfig } from './xun.js';

export const siteConfigs = { sheng: shengConfig, drum: drumConfig, dizi: diziConfig, qin: qinConfig, xun: xunConfig };

export function getSiteConfig() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('instrument') || params.get('site');
  return siteConfigs[requested] || siteConfigs.sheng;
}
