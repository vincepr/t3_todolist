import { z } from "zod";

// schema to validate our user input (both in db and in frontend)
export const todoInput = z
  .string({
    required_error: "Describe your todo",
  })
  .min(1)
  .max(50);
