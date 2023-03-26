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