document.addEventListener("DOMContentLoaded", function () {
  const options = {
    selector: "textarea#mce",
    height: 300,
    menubar: false,
    statusbar: false,
    plugins: [
      "advlist autolink lists link charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime media table paste code help wordcount autoresize",
    ],
    toolbar: "undo redo | formatselect | " +
      "bold italic backcolor | alignleft aligncenter " +
      "alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat",
    content_style:
      "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; -webkit-font-smoothing: antialiased; }",
      setup: (editor) => {
        editor.on('change', (ev) => {
            console.log(ev)
        })
      }
  };
  if (localStorage.getItem("tablerTheme") === "dark") {
    options.skin = "oxide-dark";
    options.content_css = "dark";
  }
  tinyMCE.init(options);
});
