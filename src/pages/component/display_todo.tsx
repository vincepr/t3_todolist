import { useState } from "react"
import type { Todo } from "~/types/types"
import { api } from "~/utils/api"

/*
*   we display one Todo element, inclusing it's delete button.
*/
export default function Todo({todo:todo}:{todo:Todo}){
    const {id, text, done}= todo


    const trpc = api.useContext()
    const {mutate: doneMutation} = api.todo.toggle.useMutation({
        onSettled: async ()=> await trpc.todo.getAll.invalidate()
    })
    
    const {mutate: deleteMutation} = api.todo.delete.useMutation({
        onSettled: async ()=> await trpc.todo.getAll.invalidate()
    })

    function handleToggle(){
        doneMutation({id, done:!done})
    }

    return <>
        <tr>
            <th><input
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox" readOnly checked={done} onClick={handleToggle}/></th>
            <th><label 
                className={"text-xl font-semibold" +(done?" line-through":"")} 
                onClick={handleToggle}>
                    {text}
            </label></th>
            <th><button 
                onClick={ ()=>deleteMutation(id) }
                className="rounded-full bg-white/10 px-1 py-1 font-semibold text-white no-underline transition hover:bg-white/20"
            > 
                ✖ 
            </button></th>
        </tr>
    </>
}
