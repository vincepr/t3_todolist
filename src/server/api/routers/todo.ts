import { todoInput } from "~/types/input";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const todoRouter = createTRPCRouter({
  // we dont have any publicProcedures since we are login only for our todos.

  // endpoint for fetching all Todos from a user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
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

  // endpoint for creating (a new todo)
  create: protectedProcedure
    .input(todoInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: {
          text: input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  // endpoint for deleting (a a todo)
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.delete({
        where: {
          id: input,
        },
      });
    }),

  // toggle a todos "done" boolean-state
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.done,
        },
      });
    }),
});
