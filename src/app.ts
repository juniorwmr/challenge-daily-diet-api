import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { snacksRoutes } from './routes/snacks'

const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: '/users',
})
app.register(snacksRoutes, {
  prefix: '/snacks',
})

export { app }
