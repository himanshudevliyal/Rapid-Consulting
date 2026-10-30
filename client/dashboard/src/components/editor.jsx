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
    <>
    {/* Hide TinyMCE's own warning toasts (API key / premium plugin notices). */}
    <style>{`.tox-notifications-container, .tox-notification, .tox-promotion { display: none !important; }`}</style>
    <Editor
      apiKey="lzeq992iwwymgg5upsyyi5ahxwj21w3qxrg6n9fsn80wyh9v"
      onInit={(_evt, editor) => (editorRef.current = editor)}
      init={{
        // Free plugins only: the premium ones are not enabled on this API key
        // and each one shows a "premium plugin is not enabled" warning.
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
      }}
      initialValue=""
      onEditorChange={onChange}
      value={value}
    />
    </>
  );
}
