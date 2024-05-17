import { PageProps } from "$fresh/server.ts";
import Walkthrough from "../../../islands/publish/Walkthrough.tsx";

export default function _({ params }: PageProps) {
  return <Walkthrough id={params.id} />;
}
