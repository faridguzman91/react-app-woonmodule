import { Button, createStyles, Theme, Tooltip } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

export const IFrameClipboardButton = (props: { className?: string }) => {
  const { id } = useParams<{ id: string }>();

  const iframeContent = `
    <iframe id="iframe-wmdule" src="${process.env.REACT_APP_URL}/view/${id}" width="100%" height="680" frameborder="0" scrolling="no"></iframe>
  `;

  return (
    <Tooltip title={`Copy iframe snippet`} placement="right" arrow>
      <Button
        variant="contained"
        color="primary"
        className={props.className || ""}
        onClick={() => {
          navigator.clipboard.writeText(iframeContent);
        }}
      >
        IFrame
      </Button>
    </Tooltip>
  );
};
