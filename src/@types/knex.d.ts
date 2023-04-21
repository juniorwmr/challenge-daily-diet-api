// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: number
      username: string
      session_id: string | null
    }
    snacks: {
      id: number
      name: string
      description: string
      created_at: string
      on_diet: boolean
      user_id: number
    }
  }
}
