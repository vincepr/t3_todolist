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
            <h3 className="text-xl font-bold">To create a new entry just fill the input and press enter</h3>
            <ul>
              <li>You can create new Todos, delete them and toggle them finished.</li>
              <li>Every mail/oAuth -Account creates it's own user in the db</li>
              <li>Todo entries get stored and persited in the database</li>
              <li>No Passwords are used for Auth. Either a magic-link sent per mail or oAuth (discord/github/google) </li>
            </ul>
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
                    : "Create your first todo to fill the list..."
            }
            </tbody>
        </table>
        <NewTodo/>
    </>
}

