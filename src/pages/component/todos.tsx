
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


