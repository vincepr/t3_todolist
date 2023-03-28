import React, { FormEventHandler, useState } from "react"
import { todoInput } from "~/types/input"
import { api } from "~/utils/api"
import Trpc from "../api/trpc/[trpc]"

/*
* Renders the input+button to create a new Todo Element and handles those db-requests  
*/
export default function NewTodo(){
    const [input, setInput] = useState("")
    
    // tRPC doing the main part of our request to the db to create a new user.
    const trpc = api.useContext()
    const {mutate} = api.todo.create.useMutation({
        onMutate: async newTodo => {
            console.log("sucess adding")
            setInput("")
        },
        onError: (err, newTodo, ctx) => {
            // if the request fails, we use the context returened from onMutate() to roll back:
            setInput("An error while fetching: "+err+" "+newTodo)
            console.log(ctx)
        },
        onSettled: async()=>{
            // we always refetch after sucess or an error:
            console.log("Settled")
            await trpc.todo.getAll.invalidate()
        },
    })


    // handing of the submit event, when a user clicked submit or pressed enter in our input-txt
    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault()
        const parse = todoInput.safeParse(input)
        if (!parse.success) {
            setInput("failed: must be 1-50 letters")
            return
        }
        mutate(parse.data)
       
    }
    return (
    <form onSubmit={e=>handleSubmit(e)} className="flex">
        <input type="text" placeholder="new Todo"
            value={input}
            onChange={e=> setInput(e.target.value)}
            className="flex-1 px-3 py-4 mr-4 placeholder-slate-300 text-slate-600 bg-white rounded text-base border border-slate-300 outline-none focus:outline-none focus:ring "/>
        <button className="flex-none rounded-full bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-white/20">
            Create
        </button>
    </form>
    )
}

