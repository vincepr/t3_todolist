import type { Todo } from "~/types/types"



export default function Todo({todo:{id, text, done}}:{todo:Todo}){
    return <>
        {text}
    </>
}
