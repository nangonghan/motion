import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import { selectWidth, selectHeight } from "../store/reducers/controlSlice";
import { useSelector } from "react-redux";
import WrapperBox from "../components/WrapperBox";
export default function ImageSection(props) {
    const { format, content, isCompress } = props;

    const width = useSelector(selectWidth);
    const height = useSelector(selectHeight);

    return (
        <Wrapper>
            <WrapperBox width={width} height={height} isCompress={isCompress} maskWidth={width} maskHeight={height}>
                <img
                    src={content}
                />
            </WrapperBox>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  width: 100%;
 
  
`;
