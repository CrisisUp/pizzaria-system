import { vi, beforeAll, afterAll } from 'vitest'
import { GenericContainer } from 'testcontainers'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'

let container: Awaited<ReturnType<GenericContainer['start']>>
export let prisma: PrismaClient

export async function setupTestDatabase() {
  // Check if running in CI (GitHub Actions)
  const isCI = process.env.CI === 'true'

  let url: string

  if (isCI) {
    // In CI, use the PostgreSQL service container provided by GitHub Actions
    url = 'postgresql://test:test@localhost:5432/pizzaria_test?schema=public'
    process.env.DATABASE_URL = url
  } else {
    // Local development: use TestContainers
    container = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'pizzaria_test',
      })
      .withExposedPorts(5432)
      .start()

    url = `postgresql://test:test@${container.getHost()}:${container.getMappedPort(5432)}/pizzaria_test?schema=public`
    process.env.DATABASE_URL = url
  }

  // Apply migrations (consistent with db:deploy script)
  execSync('npx prisma migrate deploy', {
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