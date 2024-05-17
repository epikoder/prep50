export default function LinkButton(
  { text, icon, url }: { text: string; icon: JSX.Element; url: string },
) {
  return (
    <a
      href={url}
      class={"rounded-md bg-[#46b5ff] w-48 hover:bg-opacity-95 active:bg-opacity-70 transition-all duration-300 flex justify-center space-x-2 items-center text-white shadow-md mx-auto px-4"}
    >
      <span class={"text-xs uppercase bold"}>
        {text}
      </span>
      {icon}
    </a>
  );
}
