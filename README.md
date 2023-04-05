# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. Using nextjs and all the 4 optional Frameworks to get a feeling for them. Namely Nextjs, Prisma, TRPC, NEXTAUTH, Tailwind.


the endgoal is roughly following functionality:
- using oauth (with NextAuthJs) some kind of authentification (probably email and/or the Discord-auth)
- use the trpc + prisma to handle db and validation for the db.
- todo functionaly only accessible for logged in users:
  - create a todo
  - show a list of todos
  - toggle todos completed-state
  - delete todos






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
      server: {
        host: process.env.EMAIL_SERVER_HOST || "https://localhost:3000",
        port: process.env.EMAIL_SERVER_PORT || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "apikey",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        }
      },
      /** if were not in prod, we just get a link instead of full email-auth */
      from: process.env.EMAIL_FROM || "noreply@default.com",

      ...(process.env.NODE_ENV !== "production" 
        ? {sendVerificationRequest({ url }) {
          console.log("LOGIN LINK", url);
        }}
        : {}),
    }),

    // just the default auth setup, we just leave untouched
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ]
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
- we edit our root page at `src/pages/index.tsx`
```tsx
export default function Home(){
  const {data: sessionData} = useSession()
  return(
    <>
      {/**Headers and h1 */}
      <Head>
        <title>Todo List App with T3</title>
        <meta name="description" content="fullstack todo with T3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            fullstack <span className="text-[hsl(280,100%,70%)]">Todo List</span> with t3
          </h1>
        </div>
        {/** Our Login element */}
        <AuthShowcase/>
      </main>
    </>
  )
}

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

```

- now we can login with some fake@mail.de, click the magic-link from our console.log to login and then check our db `npx prisma studio` where in table:user we should see those new users. 




### Todos
- \[x\] list all todos
- \[x\] create todos
- \[x\] toggle todos
- \[x\] delete todos

First we add `{sessionData && (<TodoApp/>)}` to our index.tsx. Only when logged in, we will display the TodoApp Element.




#### tRPC vodoo
- we create `./src/types/types.ts` where we export a type for our Todo-Data struct. This file is fully inferred from tRPC-Routing.
- we need this type for the next step
```ts
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./../server/api/root";

/**
 * Using this file to export tRPC generated Types
 */

// tRPC magic begins: first we do some abrakadabra
type RouterOutputs = inferRouterOutputs<AppRouter>
type allTodosOutput = RouterOutputs["todo"]["getAll"]

// then we have a type that is infered from whatever our getAll Route spits out
export type Todo = allTodosOutput[number]
```




#### list all todos
- we create the base of our Todo-List component `/src/pages/component/todos.tsx`
```ts
// this where the tRPC magic happens. createTRPCNext from the {api} package will create
// all the typesafety, inference and autocomplete for the data coming from our backend
import { api } from "~/utils/api"
import Todo from "./todo"

// our Main Todo-Parent-Component, fetches our tRPC API and once that comes over passes it down
export default function Todos(){
    const{data:todos, isLoading, isError} = api.todo.getAll.useQuery()
    if(isLoading)   return <>Fetching from DB</>
    else if (isError)    return <>Error fetching from DB</>
    else 

    return <div>
        {
            todos.length 
                ? todos.map(todo => <Todo key={todo.id} todo={todo}/>) 
                : "Create your first todo by ..."
        }
    </div>
}
```
- and in `/src/pages/component/todo.tsx` we draw out our data, notice how we import the Todo-type from the previous step.
```tsx
import type { Todo } from "~/types/types"
export default function Todo({todo:{id, text, done}}:{todo:Todo}){
    return <>
        {text}
    </>
}

```