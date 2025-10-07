import {  signIn} from "@/auth"
import { Button } from "@/components/ui/button"
 import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default async function SignIn() {
 

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link">Sign Up</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <h1><b>Email</b></h1>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <h1><b>Password</b></h1>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div>
          <Button variant="outline" type="submit" className="w-full">
            Login
          </Button>
          </div>
          <div className="flex items-center w-full my-4">
            <hr className="flex-grow border-t border-gray-400" />
            <span className="mx-4 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t border-gray-400" />
          </div>


          <form
            action={async () => {
              "use server"
              await signIn("auth0", {
                callbackUrl: "/loading",
              })
            }}
          >
            <Button variant="outline" className="w-full" type="submit">
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Login with Google
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
