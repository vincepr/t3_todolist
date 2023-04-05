// this where the tRPC magic happens. createTRPCNext from the {api} package will create
// all the typesafety, inference and autocomplete for the data coming from our backend
import { api } from "~/utils/api"
import NewTodo from "./create_new_todo"
import Todo from "./display_todo"

/*
* our Main Todo-Parent-Component, fetches our tRPC API and once that comes over passes it down
*/
export default function TodoApp(){
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <div className="flex flex-col gap-4 rounded-xl p-4 bg-white/10 text-white ">
            <Todos/>
          </div>
        </div>
      )
}



function Todos(){
    const{data:todos, isLoading, isError} = api.todo.getAll.useQuery()
    if(isLoading)   return <>Fetching from DB</>
    else if (isError)    return <>Error fetching from DB</>
    else 
    
    return <>
        <table>
            <thead>
                <tr className="text-2xl font-bold">
                    <th>Done</th>
                    <th>Description</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
            {
                todos.length 
                    ? todos.map(todo => <Todo key={todo.id} todo={todo}/>) 
                    : <></>
            }
            </tbody>
        </table>
        <NewTodo/>
    </>
}

