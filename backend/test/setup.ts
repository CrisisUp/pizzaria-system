import { vi, beforeAll, afterAll } from 'vitest'
import { GenericContainer } from 'testcontainers'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'

let container: Awaited<ReturnType<GenericContainer['start']>>
export let prisma: PrismaClient

export async function setupTestDatabase() {
  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'pizzaria_test',
    })
    .withExposedPorts(5432)
    .start()

  const url = `postgresql://test:test@${container.getHost()}:${container.getMappedPort(5432)}/pizzaria_test?schema=public`
  process.env.DATABASE_URL = url

  // Push schema
  execSync('npx prisma db push --skip-generate', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  })

  prisma = new PrismaClient({ datasources: { db: { url } } })
  return prisma
}

export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (container) {
    await container.stop()
  }
}

beforeAll(async () => {
  await setupTestDatabase()
}, 120000)

afterAll(async () => {
  await teardownTestDatabase()
}, 60000)