import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import Todos from "./component/todos";

export default function Home(){
  const { data: sessionData } = useSession();
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
            t3 fullstack <span className="text-[hsl(280,100%,70%)]">Todo-List</span> by vincepr
          </h1>
          {/** is we have sessionDate == were logged in -> our Todolist-App */}
          {sessionData && (<TodoApp/>)}
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

function TodoApp(){
  return <div className="grid grid-cols-1 gap-4 md:gap-8">
    <div className="flex flex-col gap-4 rounded-xl p-4 bg-white/10 text-white ">
      <h3 className="text-xl font-bold">Todo List</h3>
      <Todos/>
    </div>
  </div>
}