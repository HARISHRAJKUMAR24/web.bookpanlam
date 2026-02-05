"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CKEditorWrapper({
  data,
  onChange,
}: {
  data: string;
  onChange: (value: string) => void;
}) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onChange={(_, editor) => onChange(editor.getData())}
    />
  );
}
