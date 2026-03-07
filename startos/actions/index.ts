import { sdk } from '../sdk'
import { configureApiCredentials } from './configureApiCredentials'
import { connectTelegram } from './connectTelegram'
import { connectWhatsapp } from './connectWhatsapp'
// import { configureSynapse } from './configureSynapse'
import { loginToOs } from './loginToOs'
import { setPassword } from './setPassword'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(configureApiCredentials)
  .addAction(connectTelegram)
  .addAction(connectWhatsapp)
  // .addAction(configureSynapse)
  .addAction(loginToOs)
