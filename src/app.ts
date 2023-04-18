import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'

const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: '/users',
})

export { app }
