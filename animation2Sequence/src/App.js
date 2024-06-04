import {
  useState,
  useEffect,

} from "react";

import styled from "styled-components";
import SVGA from "./svga"
import Lottie from "./lottie"
import Pag from "./pag"
function App() {
  // 拖拽上传
  const [fileUrl, setFileUrl] = useState('')
  const [fileType, setFileType] = useState('')
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileUrl = params.get('file_url');
    if (!fileUrl) return;

    const fileTypeMap = {
      'svga': 'svga',
      'json': 'json',
      'pag': 'pag'
    };

    const fileType = fileTypeMap[fileUrl.split('.').pop()];

    if (fileType) {
      setFileType(fileType);
      setFileUrl(fileUrl);
    }
  }, []);

  function renderFile() {
    switch (fileType) {
      case 'svga':
        return <SVGA url={fileUrl} />
      case 'json':
        return <Lottie url={fileUrl} />
      case 'pag':
        return <Pag url={fileUrl} />
      default:
        break;
    }
  }
  return (
    <Wrapper>
      {renderFile()}
    </Wrapper>
  );
}
const Wrapper = styled.div`
  display: grid;
  place-content: center;
  place-items: center;
  margin-top: 100px;
  .dropzone_container {
    width: 750px;
    height: 200px;
    input:focus {
      outline: none;
    }
    background: rgba(0, 0, 0, 0.05);
    p {
      font-size: 18px;
      line-height: 200px;
      text-align: center;
      color: #c9c9c9;
    }
  }
`;
export default App;
