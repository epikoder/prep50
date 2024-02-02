import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface DeleteButtonProps {
  id: string | number;
  collection: string;
  url?: string;
}
export default function DeleteButton(
  { id, collection, url }: DeleteButtonProps,
) {
  const _onClick = () => {
    let mc = document.getElementById("modal_confirm");
    if (!mc) {
      mc = document.createElement("div");
      mc.id = "modal_confirm";
      mc.style.position = "absolute";
      mc.style.top = "0px";
      mc.style.bottom = "0px";
      mc.style.left = "0px";
      mc.style.right = "0px";
      mc.style.zIndex = "10";
      mc.style.flexDirection = "column";
      mc.style.justifyContent = "center";
      mc.style.alignItems = "center";
      mc.style.display = "none";
      mc.style.background = "color(srgb 0.97 0.97 0.97 / 0.07)";
      mc.addEventListener("click", function (e) {
        this.style.display = "none";
      });
      mc.addEventListener("keydown", function (e) {
        console.log(e);
      });
      document.body.append(mc);
    }
    mc!.innerHTML = "";

    const buttonId = crypto.randomUUID();
    const child =
      `<div class="rounded border dark:border-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm">
        <div class="p-3">
            <div class="text-center">
                Confirm Delete
            </div>
            <div class="p-4">
                This action is irreversible
            </div>
        </div>
        <div class="flex justify-center rounded-b-md border-t">
            <button id="${buttonId}" class="cursor-pointer w-full rounded-b-md hover:bg-gray-300 dark:hover:bg-gray-600 p-3">
                Confrim
            </button>
        </div>
    </div>`;
    const container = document.createElement("div");
    container.addEventListener("blur", () => {
      mc!.style.display = "none";
      mc!.innerHTML = "";
    });

    mc!.appendChild(container);
    container.innerHTML = child;
    mc!.style.display = "flex";

    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.addEventListener("click", async function () {
        (this as HTMLButtonElement).disabled = true;
        this.innerHTML = "Loading....";
        try {
          const res = await fetch(
            encodeURI("/api/collection/" + collection + "?id=" + id),
            {
              method: "DELETE",
              credentials: "include",
            },
          );
          switch (res.status) {
            case 400: {
              break;
            }
            case 200: {
              if (url) {
                const q = sessionStorage.getItem('location.query')
                sessionStorage.removeItem('location.query');
                if (q) {
                  url = url + q
                }
                return location.replace(url);
              }
              location.reload();
            }
          }
          console.log(res);
        } catch (error) {
          console.log(error);
        }
      });
    }
  };

  return (
    <div class="flex">
      <div
        onClick={_onClick}
        class={"flex space-x-2 text-sm px-2 text-red-500 border border-red-500 rounded hover:bg-red-50 dark:hover:bg-gray-600 cursor-pointer"}
      >
        <div>
          {"Delete"}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3 h-3 m-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </div>
    </div>
  );
}
