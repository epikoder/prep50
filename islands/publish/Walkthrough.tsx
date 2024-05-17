import { useEffect } from "preact/hooks";
import Net from "../../libs/net.ts";
import { useSignal } from "@preact/signals";
import { showFailed } from "../../libs/toast.ts";
import Loader from "../../components/Loader.tsx";

type T = UntypedQuestion & ObjectiveQuestion;
export default function Walkthrough(
  { id, subjectId }: { id: string; subjectId: string[] },
) {
  const questions = useSignal<T[]>([]);
  const is_loading = useSignal<boolean>(true);

  useEffect(() => {
    (async () => {
      is_loading.value = false;
      const res = await Net.instance.postReq<Api<T[]>>(
        "/api/publish/walkthrough",
        {
          id,
          subjectId,
        },
      );
      if (res.Err || res.Ok?.status == "failed") {
        return showFailed("An expected error occured", {
          duration: 5000,
        });
      }
      questions.value = res.Ok!.data!;
    })();
  }, []);

  return (
    <div>
      <div class={"min-h-[10rem] flex flex-col justify-center"}>
        <Loader loading={is_loading.value} />
      </div>
    </div>
  );
}
