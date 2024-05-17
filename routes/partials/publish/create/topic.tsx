import { RouteConfig } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";

export const config: RouteConfig = {
  skipAppWrapper: true,
  skipInheritedLayouts: true,
};

export default function _() {
  return (
    <Partial name="publish-create">
      <div>
        <a href="" f-partial={"/partials/publish/create/topic"}>
          Next
        </a>
      </div>
    </Partial>
  );
}
