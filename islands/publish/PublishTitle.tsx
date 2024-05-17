export default function PublishTitle(
  { uri, title }: { uri: string; title: string },
) {
  return (
    <div class={"flex justify-center"}>
      <a
        href={uri}
        class={"text-center text-xs uppercase underline hover:decoration-blue-500 hover:text-blue-500 transition-all duration-300 whitespace-nowrap"}
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
