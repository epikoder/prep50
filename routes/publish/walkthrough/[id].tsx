import { PageProps } from "$fresh/server.ts";
import Walkthrough from "../../../islands/publish/Walkthrough.tsx";
import { FreshApp } from "../../_middleware.ts";

export default async function _(_: Request, ctx: FreshApp) {
  const idx: string[] = [];
  const _idx = ctx.state.query.get("subject_id");
  if (_idx) {
    idx.push(..._idx.split(",").map((s) => s.trim()));
  }
  return <Walkthrough id={ctx.params.id} subjectId={idx} />;
}
