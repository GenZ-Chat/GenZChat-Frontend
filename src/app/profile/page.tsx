import { auth, signIn, signOut} from "@/auth"
 
export default async function SignIn() {
  const session = await auth()
  console.log("Session:", session)

  return (
    <form
      action={async () => {
        "use server"
        await signIn("google",{
          callbackUrl: "/home",
        })
      }}
    >
      <br></br>
      <label>Google:  </label>
      <button type="submit">Signin with Google</button>
    </form>
  )
}  