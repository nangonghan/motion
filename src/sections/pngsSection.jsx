import styled from "@emotion/styled";

import { selectPngs } from "../store/reducers/controlSlice";
import { useSelector } from "react-redux";
import WrapperBox from "../components/WrapperBox";
export default function PngsSection() {
    // console.log("render PngsSection")
    const pngDatas = useSelector(selectPngs);
    return (
        <Wrapper>
            <WrapperBox width={800} height={812}>
                <MainWrapper>
                    {pngDatas.map((content, index) => {
                        return (
                            <img
                                key={index}
                                src={content}
                            />
                        )
                    })}
                </MainWrapper>
            </WrapperBox>
        </Wrapper>
    );
}

const Wrapper = styled.div`

  width: 100%;
 img{
    width:60px;
    display: block;
 }
  
`;

const MainWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start ;
  overflow: auto;
  gap:6px;
 

` 