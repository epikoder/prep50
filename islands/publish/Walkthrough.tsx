import { useEffect } from "preact/hooks";
import Net from "../../libs/net.ts";
import { useSignal } from "@preact/signals";
import { showFailed } from "../../libs/toast.ts";

type T = UntypedQuestion & ObjectiveQuestion;
export default function Walkthrough({ id }: { id: string }) {
  const questions = useSignal<T[]>([]);

  useEffect(() => {
    (async () => {
      const res = await Net.instance.getReq<Api>("/api/publish/walkthrough", {
        id,
      });
      if (res.Err || res.Ok?.status == "failed") {
        return showFailed("An expected error occured", {
          duration: 5000,
        });
      }
      questions.value = res.Ok!.data;
    })();
  }, []);
  return (
    <div>
        <div>
            
        </div>
    </div>
  );
}
