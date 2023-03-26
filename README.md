# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. Using nextjs and all the 4 optional Frameworks to get a feeling for them. Namely Nextjs, Prisma, TRPC, NEXTAUTH, Tailwind.


the goal include roughly:
- using some kind of authentification (probably email and/or the Discord-auth)
- todo functionaly only accessible for logged in users:
  - create a todo
  - show a list of todos
  - toggle todos completed-state
  - delte todos
- use the trpc + prisma to handle db and validation for the db.






## backend




### update Prisma schema
- first we create a new Todo table in our prisma schema: `./prisma/schema.prisma`
```
model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
    todos         Todo[]                       // added todos reference to our Existing User table
}

// our custom todo prisma-schema
model Todo {
    id          String      @id @default(cuid())    // our id, that will default to a rng unique value
    createdAt   DateTime    @default(now())
    updatedAt   DateTime    @default(now())
    text        String
    done        Boolean     @default(false)
    user        User        @relation(fields: [userId], references: [id])     
    userId      String   
}
```
- afterwards we `npx prisma db push` our updates to the db. (in this case the default SQLite db for now)
- now lets quickly check our current state of the db with `npx prisma studio`




### Add Email auth provider
- next auth does not include nodemailer by default, so we `npm install nodemailer`
- `./src/server/auth.ts`
```ts
import  EmailProvider  from "next-auth/providers/email";
// ...
adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server:{
        host: process.env.EMAIL_SERVER || "https://localhost:3000",
        port: process.env.EMAIL_SERVER_PRT || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "apikey",
          pass: process.env.EMAIL_PASSWORD || "",
        }
      },
      /** if were not in prod, we just get a link instead of full email-auth */
      from: process.env.EMAIL_FROM || "default@default.com",
      ... (process.env.NODE_ENV !== "production" ? {sendVerficationRequest({url}){
        console.log("LOGIN LINK", url)
      }}:{}),
    }),

```




### Create TRCP router for todos
- we rename the example router and modify it: `example.ts` to `./src/server/api/routers/todo.ts`
- first we create the protectedProcedure to getAll user Data -> our Todo list for one user
```ts
export const todoRouter = createTRPCRouter({
  // we dont have any publicProcedures since we are login only for our todos.

  // endpoint for fetching all Todos from a user
  getAll: protectedProcedure.query(async ({ctx}) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    })
    //return todos.map( ({id, text, done})=>({id, text, done}) )  // we only return the 3 relevent columns

    // some mokup data for now // :todo remove this later
    return [
      {
        id: "fake",
        text: "default text",
        done: false,
      },
      {
        id: "default",
        text: "some fake text",
        done: true,
      },
    ];
  }),
```
- next we create a file we use for user-input sanitation `./src/types/input.ts`
- we use the created type for our next request. So trpc can bad-request everything out of those bounds.
```ts
import { z } from "zod";
// schema to validate our user input (both in db and in frontend)
export const todoInput = z.string({
    required_error: "Describe your todo",
})
.min(1)
.max(50)
```
- now we fill in the missing 3 endpoints in our router.
```go
// endpoint for creating (a new todo)
  create: protectedProcedure
    .input(todoInput)
    .mutation(async ({ctx, input}) => {
      return ctx.prisma.todo.create({
        data:{
          text: input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      })
  }),

  // endpoint for deleting (a a todo)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ctx, input}) => {
      return ctx.prisma.todo.delete({
        where:{
          id: input,
        },
      })
  }),

  // toggle a todos "done" boolean-state
  toggle: protectedProcedure
    .input(
      z.object({
        id:   z.string(),
        done: z.boolean(),
    }))
    .mutation(async ({ctx, input}) => {
      return ctx.prisma.todo.update({
        where:{
          id: input.id,
        },
        data: {
          done: input.done,
        }
      })
  }),
```
- finally we update our `src/server/api/root.ts` to include our new file. and remove mention of the example router.
```ts
import { createTRPCRouter } from "~/server/api/trpc";
import { todoRouter } from "~/server/api/routers/todo";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
```




## frontend



### Login
### Todos
- list todos
- create todos
- toggle todos
- delete todos
### implement optimistic updates