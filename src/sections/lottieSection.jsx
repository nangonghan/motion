import styled from "@emotion/styled";
import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useState } from 'react'
import {
    selectWidth, selectHeight
} from "../store/reducers/controlSlice"
import { useSelector } from 'react-redux';
import WrapperBox from "../components/WrapperBox";
export default function LottieSection(props) {
    const { content, isCompress } = props

    const [lottieString, setLottieString] = useState("")


    const width = useSelector(selectWidth)
    const height = useSelector(selectHeight)
    useEffect(() => {

        fetch(content)
            .then(response => response.text())  // 将 Blob 转换为文本
            .then(text => {
                setLottieString(text)
            })
            .catch(error => {
                console.error('Error fetching the blob:', error);
            });
    }, [content])
    return (
        <Wrapper>
            <WrapperBox width={width} height={height} isCompress={isCompress} maskWidth={width} maskHeight={height}>
                {lottieString && <Player autoplay loop src={lottieString} />}
            </WrapperBox>
        </Wrapper>
    )
}

const Wrapper = styled.div`
 

`