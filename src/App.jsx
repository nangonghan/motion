import styled from "@emotion/styled";
import DragSection from "./sections/dragSection";
import FullScreenDropzone from "./sections/fullScreenDargSection";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import {
    selectFormat,
    selectContent,
    selectParams,
    selectCompressFormat,
    selectCompressContent,
    selectCompressParams,
    changeToken
} from "./store/reducers/controlSlice";

import SvgaSection from "./sections/svgaSection";
import VapSection from "./sections/vapSection";
import Mp4Section from "./sections/mp4Section";
import ImageSection from "./sections/imageSection";
import LottieSection from "./sections/lottieSection";
import ControlSection from "./sections/controlSection";
import PngsSection from "./sections/pngsSection";
import ResultSection from "./sections/resultSection";
import HistorySection from "./sections/historySection";
import { useDispatch } from 'react-redux';
import PagSection from "./sections/pagSection";
function App() {
    const format = useSelector(selectFormat);
    const content = useSelector(selectContent);
    const params = useSelector(selectParams);
    const compress_format = useSelector(selectCompressFormat);
    const compress_content = useSelector(selectCompressContent);
    const compress_params = useSelector(selectCompressParams);
    const dispatch = useDispatch();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        dispatch(changeToken(token));
    }, []);
    function renderPreview(format, content, params, isCompress) {
        switch (format) {
            case 'vap':
                return <VapSection format={format} content={content} params={params} isCompress={isCompress} />;

            case 'svga':
                return <SvgaSection format={format} content={content} isCompress={isCompress} />;

            case 'pag':
                return <PagSection format={format} content={content} isCompress={isCompress} />;

            case 'mp4':
                return <Mp4Section format={format} content={content} isCompress={isCompress} />;

            case 'alphaVideo':
                return <VapSection format={format} content={content} params={params} isCompress={isCompress} />;

            case 'lottie':
                return <LottieSection format={format} content={content} isCompress={isCompress} />;

            case 'webp':
                return <ImageSection format={format} content={content} isCompress={isCompress} />;

            case 'apng':
                return <ImageSection format={format} content={content} isCompress={isCompress} />;

            case 'gif':
                return <ImageSection format={format} content={content} isCompress={isCompress} />;

            // case 'png':
            //     return <PngsSection />;

            default:
                return null;
        }
    }
    let normalRender = renderPreview(format, content, params, false)
    let compressRender = renderPreview(compress_format, compress_content, compress_params, true)
    const isShowCompress = compress_format !== ""
    return (
        <Wrapper>
            <ContentWrapper>
                {format === "" ? (
                    <DragSection />
                ) : (
                    <MainWrapper>
                        <FullScreenDropzone />
                        <PreviewGroup repeatNum={compress_format !== "" ? 2 : 1}>
                            {normalRender}
                            {isShowCompress && compressRender}
                        </PreviewGroup>
                        {!isShowCompress && <ControlSection />}
                        {isShowCompress && <ResultSection />}


                    </MainWrapper >
                )}
                <HistorySection />
            </ContentWrapper>
        </Wrapper>
    );
}
const Wrapper = styled.div`
  height: 100vh;
  min-height: 1000px;
  background:linear-gradient(180deg, #0E0F17 0%, #191D3A 100%);
  display: grid;
  place-content: center;
 
`;
const ContentWrapper = styled.div`
  width: 100%;
  padding-right: 428px;
`;
const MainWrapper = styled.div`
 display:flex;
 grid-template-columns: auto 375px;
 gap:20px;

 
`
const PreviewGroup = styled.div`
    display: grid;
    gap:20px;
    grid-template-columns: repeat(${props => props.repeatNum},1fr);

`
export default App;
