import { teardownTestDatabase } from './setup'

export default async function teardown() {
  await teardownTestDatabase()
}