import styled from "@emotion/styled";

import { useEffect, useState, useRef } from 'react'
import {
    selectWidth, selectHeight
} from "../store/reducers/controlSlice"
import { useSelector } from 'react-redux';
import WrapperBox from "../components/WrapperBox";

export default function PagSection(props) {
    const { content, isCompress } = props

    const [lottieString, setLottieString] = useState("")

    const pagRef = useRef(null);
    const width = useSelector(selectWidth)
    const height = useSelector(selectHeight)
    useEffect(() => {
        let pagView;

        async function play(content, pagRef) {
            const PAG = await window.libpag.PAGInit();
            const buffer = await fetch(content).then((response) => response.arrayBuffer());
            const pagFile = await PAG.PAGFile.load(buffer);
            const canvas = pagRef.current;
            canvas.width = pagFile.width() > width ? width : pagFile.width()
            canvas.height = height
            pagView = await PAG.PAGView.init(pagFile, canvas);
            pagView.setRepeatCount(0);
            await pagView.play();
        }

        play(content, pagRef)

        return () => {
            if (pagView) {
                pagView.stop();
                pagView.destroy();
            }

        }
    }, [content, pagRef]);
    return (
        <Wrapper>
            <WrapperBox width={width} height={height} isCompress={isCompress} maskWidth={width} maskHeight={height}>
                <canvas ref={pagRef} className="pag" />
            </WrapperBox>
        </Wrapper>
    )
}

const Wrapper = styled.div`
 

`