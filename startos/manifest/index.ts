import { setupManifest } from '@start9labs/start-sdk'
import { STARTOS_VERSION } from '../utils'
import { installAlert, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/openclaw-startos',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://github.com/openclaw/openclaw',
  donationUrl: null,
  docsUrls: [
    'https://docs.openclaw.ai/channels',
    'https://docs.openclaw.ai/pi',
    'https://docs.openclaw.ai/tools',
    'https://docs.openclaw.ai/models',
    'https://docs.openclaw.ai/gateway',
  ],
  description: { short, long },
  volumes: ['main'],
  images: {
    openclaw: {
      source: {
        dockerBuild: {
          workdir: '.',
          buildArgs: {
            STARTOS_VERSION,
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: installAlert,
  },
  dependencies: {},
  // dependencies: {
  //   synapse: {
  //     description:
  //       'Used as a Matrix homeserver for multi-channel messaging.',
  //     optional: true,
  //     metadata: {
  //       title: 'Synapse Matrix Homeserver',
  //       icon: 'https://matrix.org/images/matrix-logo.svg',
  //     },
  //   },
  // },
})
