import { Editor } from "@tinymce/tinymce-react";
import React, { useEffect, useRef, useState } from "react";

export default function TextEditor({ onChange, value }) {
  const editorRef = useRef(null);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const element = document.querySelector(".tox-notifications-container");
      if (element) {
        element.style.display = "none";
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Editor
      apiKey="v1b1bk2snmaau21wkptjk8qqy51hzgg28kgnlw2g8puglyzr"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      init={{
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
        tinycomments_mode: "embedded",
        tinycomments_author: "Author name",
        mergetags_list: [
          { value: "First.Name", title: "First Name" },
          { value: "Email", title: "Email" },
        ],
        ai_request: (request, respondWith) =>
          respondWith.string(() =>
            Promise.reject("See docs to implement AI Assistant"),
          ),
      }}
      initialValue=""
      onEditorChange={onChange}
      value={value}
    />
  );
}
