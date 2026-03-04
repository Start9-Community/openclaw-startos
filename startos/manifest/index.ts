import { setupManifest } from '@start9labs/start-sdk'
import { short, long, installAlert } from './i18n'
import { STARTOS_VERSION } from '../utils'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo:
    'https://github.com/Start9Labs/openclaw-startos/tree/update/040',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://github.com/openclaw/openclaw',
  donationUrl: null,
  docsUrls: ['https://docs.openclaw.ai/'],
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
