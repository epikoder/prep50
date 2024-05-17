const Nothing = ({ text }: { text?: string }) => (
  <div class={"text-gray-500 text-center py-12"}>
    <div class={"font-bold text-sm"}>
      {text ?? "Nothing Here"}
    </div>
  </div>
);

export default Nothing;
