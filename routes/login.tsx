import { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import { State } from "./_middleware.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true,
};

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  GET(req, ctx) {
    return ctx.render({
      message: ctx.state.chain["message"],
      status: ctx.state.chain["status"],
    });
  },

  async POST(req, ctx) {
    try {
      const formdata = await req.formData();
      const user = await ctx.state.context.auth({
        username: formdata.get("email") as string,
        password: formdata.get("password") as string,
      });
      if (!user) {
        return new Response(null, {
          status: 303,
          headers: {
            location: "/login",
            ["x-chained-message"]: "Invalid Email/Password",
            ["x-chained-status"]: "failed",
          },
        });
      }
      ctx.state.user = user;
      return new Response(null, {
        status: 303,
        headers: {
          location: "/collections",
        },
      });
    } catch (error) {
      console.error(error);
      return new Response(null, {
        status: 303,
        headers: {
          location: "/login",
          ["x-chained-message"]: "Something went wrong",
          ["x-chained-status"]: "failed",
        },
      });
    }
  },
};

export default function LoginPage({ data }: PageProps) {
  const { message, status } = data as {
    message?: string;
    status?: "failed" | "success";
  };
  return (
    <div class={"w-full h-[100vh] flex flex-col justify-center items-center"}>
      <div class="max-w-md p-4 w-full shadow-md rounded">
        <form method="POST">
          <div class="space-y-3">
            <div class="flex justify-center">
              <svg
                width="80"
                height="35"
                viewBox="0 0 288 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.300001 0.999995H22.7C30.7667 0.999995 36.8667 2.86666 41 6.59999C45.2 10.2667 47.3 15.7 47.3 22.9C47.3 30.5667 45.1333 36.4 40.8 40.4C36.5333 44.3333 30.3333 46.3 22.2 46.3H12.9V71H0.300001V0.999995ZM23.3 36.1C27.1 36.1 30 35.0333 32 32.9C34 30.7 35 27.5333 35 23.4C35 19.4 33.9333 16.3667 31.8 14.3C29.7333 12.2333 26.6667 11.2 22.6 11.2H12.9V36.1H23.3ZM53.3961 33.2C53.3961 27.5333 53.2961 23.4667 53.0961 21H63.7961C64.0628 23.6 64.1961 26.5333 64.1961 29.8V30.8H64.4961C65.7628 27.4667 67.9294 24.8333 70.9961 22.9C74.0628 20.9667 77.5961 20 81.5961 20C82.7961 20 83.7961 20.1 84.5961 20.3V29.3C83.9294 29.1667 83.0294 29.1 81.8961 29.1C78.7628 29.1 75.8628 29.9667 73.1961 31.7C70.5961 33.3667 68.5294 35.6667 66.9961 38.6C65.4628 41.5333 64.6961 44.7 64.6961 48.1V71H53.3961V33.2ZM131.78 50.2H96.5797C97.713 58.3333 102.146 62.4 109.88 62.4C112.813 62.4 115.413 61.8667 117.68 60.8C119.946 59.7333 122.046 58.0667 123.98 55.8L130.18 61.7C128.246 64.8333 125.38 67.3333 121.58 69.2C117.846 71.0667 113.746 72 109.28 72C101.613 72 95.6464 69.7333 91.3797 65.2C87.113 60.6 84.9797 54.2333 84.9797 46.1C84.9797 37.9667 87.113 31.6 91.3797 27C95.713 22.3333 101.613 20 109.08 20C116.213 20 121.78 22.3 125.78 26.9C129.78 31.5 131.78 37.8667 131.78 46V50.2ZM120.88 41.7C120.88 37.7667 119.813 34.7 117.68 32.5C115.546 30.3 112.58 29.2 108.78 29.2C105.313 29.2 102.513 30.3667 100.38 32.7C98.313 34.9667 97.013 38.1667 96.4797 42.3H120.88V41.7ZM136.798 34C136.798 30 136.631 25.6667 136.298 21H146.998C147.198 23.2 147.298 25.5333 147.298 28H147.498C149.031 25.4667 151.164 23.5 153.898 22.1C156.698 20.7 159.731 20 162.998 20C169.398 20 174.431 22.3333 178.098 27C181.764 31.6 183.598 37.9333 183.598 46C183.598 54.0667 181.731 60.4333 177.998 65.1C174.264 69.7 169.164 72 162.698 72C159.431 72 156.531 71.4333 153.998 70.3C151.464 69.1 149.598 67.4667 148.398 65.4H148.098V95.2H136.798V34ZM160.398 63.5C164.131 63.5 167.031 61.9333 169.098 58.8C171.231 55.6667 172.298 51.3 172.298 45.7C172.298 40.1667 171.298 35.9667 169.298 33.1C167.298 30.2333 164.364 28.8 160.498 28.8C156.831 28.8 153.831 29.9333 151.498 32.2C149.231 34.4667 148.098 37.3667 148.098 40.9V50.8C148.098 54.4667 149.264 57.5 151.598 59.9C153.931 62.3 156.864 63.5 160.398 63.5ZM209.459 72C204.726 72 200.293 71.0333 196.159 69.1C192.093 67.1667 188.993 64.5667 186.859 61.3L192.459 53.3C194.726 56.0333 197.259 58.1333 200.059 59.6C202.926 61.0667 205.926 61.8 209.059 61.8C213.126 61.8 216.326 60.5 218.659 57.9C220.993 55.3 222.159 51.7333 222.159 47.2C222.159 42.9333 221.093 39.6 218.959 37.2C216.893 34.7333 214.059 33.5 210.459 33.5C208.259 33.5 206.159 34.1 204.159 35.3C202.159 36.4333 200.626 38 199.559 40H189.059L192.459 0.999995H232.659V11.1H203.759L202.259 28.1C203.326 26.9 204.959 25.9333 207.159 25.2C209.359 24.4 211.559 24 213.759 24C217.959 24 221.659 24.9667 224.859 26.9C228.059 28.7667 230.526 31.4333 232.259 34.9C234.059 38.3667 234.959 42.4 234.959 47C234.959 52 233.893 56.4 231.759 60.2C229.693 63.9333 226.726 66.8333 222.859 68.9C218.993 70.9667 214.526 72 209.459 72ZM262.816 72C254.75 72 248.55 68.9333 244.216 62.8C239.95 56.6667 237.816 47.7333 237.816 36C237.816 24.2667 239.95 15.3333 244.216 9.2C248.55 3.06666 254.75 -3.8147e-06 262.816 -3.8147e-06C270.95 -3.8147e-06 277.15 3.06666 281.416 9.2C285.683 15.3333 287.816 24.2667 287.816 36C287.816 47.7333 285.683 56.6667 281.416 62.8C277.15 68.9333 270.95 72 262.816 72ZM262.816 62.7C271.083 62.7 275.216 53.8 275.216 36C275.216 18.1333 271.083 9.2 262.816 9.2C254.616 9.2 250.516 18.1333 250.516 36C250.516 53.8 254.616 62.7 262.816 62.7Z"
                  fill="black"
                />
              </svg>
            </div>
            <div>
              {message && (
                <div
                  class={`${
                    !status || status === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  } text-center space-x-2 flex justify-center py-4 text-sm`}
                >
                  {(status && status === "failed") && (
                    <div>
                      Error:
                    </div>
                  )}

                  <div>
                    {message}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div>
                Email
              </div>
              <input
                name={"email"}
                type={"email"}
                required
                placeholder={"acme@gmail.com"}
                class={"border rounded-md p-2 w-full"}
              />
            </div>
            <div>
              <div>
                Password
              </div>
              <input
                name={"password"}
                type="password"
                required
                placeholder={"********"}
                class={"border rounded-md p-2 w-full"}
              />
            </div>
            <div class="flex justify-center">
              <button
                class={"uppercase text-xs border rounded-md px-4 py-2 hover:bg-gray-300"}
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
