import { setupManifest } from '@start9labs/start-sdk'
import { START_CLI_VERSION } from '../utils'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/openclaw-startos',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://github.com/openclaw/openclaw',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    openclaw: {
      source: {
        dockerBuild: {
          workdir: '.',
          buildArgs: {
            START_CLI_VERSION,
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
