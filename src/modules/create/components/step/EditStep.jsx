import React from "react";
import { EditorCanvas } from "../EditorCanvas";
import s from "../MultiStepEditor.module.scss";

export default function EditStep({ template, currentFile, onCreate }) {
  return (
    <div className="center">
      <EditorCanvas
        template={template}
        inputSrc={currentFile}
        onCreate={onCreate}
      />
    </div>
  );
}
