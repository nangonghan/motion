import React, { useLayoutEffect, useState, useRef } from "react";
import styled from "@emotion/styled";
import DragSection from "./dragSection";
const preventDefault = (event) => event.preventDefault();

export default function FullScreenDropzone() {
  const [dragOver, setDragOver] = useState(false);
  const dragLeaveTimeout = useRef();

  const onDragOver = () => {
    clearTimeout(dragLeaveTimeout.current);
    setDragOver(true);
  };

  const onDragLeave = () => {
    clearTimeout(dragLeaveTimeout.current);
    dragLeaveTimeout.current = setTimeout(() => {
      setDragOver(false);
    }, 20);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    clearTimeout(dragLeaveTimeout.current);
    setDragOver(false);
  };

  useLayoutEffect(() => {
    document.addEventListener("dragover", preventDefault, false);
    document.addEventListener("drop", handleDrop, false);
    document.addEventListener("dragover", onDragOver, false);
    document.addEventListener("dragleave", onDragLeave, false);

    return () => {
      document.removeEventListener("dragover", preventDefault, false);
      document.removeEventListener("drop", handleDrop, false);
      document.removeEventListener("dragover", onDragOver, false);
      document.removeEventListener("dragleave", onDragLeave, false);
    };
  }, []);

  return dragOver ? (
    <Wrapper>
      <DragSection isFullScreen={true} />
    </Wrapper>
  ) : null;
}
const Wrapper = styled.div`
 
  position: fixed;
  top:0px;
  bottom:0px;
  left:0px;
  right:0px;
  background-color: #08081D;
  z-index: 100;
  display: grid;
  place-content: center;
 
`;
