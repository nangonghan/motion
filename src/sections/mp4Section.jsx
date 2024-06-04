import styled from "@emotion/styled";


import { selectWidth, selectHeight } from "../store/reducers/controlSlice";
import { useSelector } from "react-redux";
import WrapperBox from "../components/WrapperBox";
export default function Mp4Section(props) {
  const { content } = props;

  const width = useSelector(selectWidth);
  const height = useSelector(selectHeight);

  return (
    <Wrapper>
      <WrapperBox width={width} height={height}>
        <video
          src={content}
          className="video"
          autoPlay
          preload="auto"  // 或者 "metadata" 或 "none"，根据您的需要
        />

      </WrapperBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  object-fit: fill;
`;
