import { faker } from '@faker-js/faker'

export function createAnimalName() {
  const animal = faker.animal.type()
  return `${animal.toUpperCase()}-${String(Math.random()).slice(2, 6)}`
}
