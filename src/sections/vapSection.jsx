import styled from "@emotion/styled";
import Vap from 'video-animation-player'
import { useEffect, useRef } from 'react'
import {
    selectWidth, selectHeight
} from "../store/reducers/controlSlice"
import { useSelector } from 'react-redux';
import WrapperBox from "../components/WrapperBox";
export default function VapSection(props) {
    const { content, params, isCompress } = props
    function adjustDimensions(originalWidth, originalHeight, maxWidth) {
        if (originalWidth <= maxWidth) {
            return { newWidth: originalWidth, newHeight: originalHeight };
        }
        const ratio = originalHeight / originalWidth;
        const newWidth = maxWidth;
        const newHeight = newWidth * ratio;

        return { newWidth: newWidth, newHeight: newHeight };
    }
    const width = useSelector(selectWidth)
    const height = useSelector(selectHeight)
    const vapRef = useRef(null)
    const playerWidth = params.info.w / 2
    const playerHeight = params.info.h / 2
    const { newWidth, newHeight } = adjustDimensions(playerWidth, playerHeight, width);
    console.log("newWidth", newWidth)
    console.log("newHeight", newHeight)
    useEffect(() => {
        // 确保容器已经被引用
        if (!vapRef.current) return;
        // 销毁已有的 Vap 实例
        // if (window.vap) {
        //     window.vap.destroy();
        //     window.vap = null;
        // }


        const playerFps = params.info.fps
        // 创建新的 Vap 实例
        const vap = new Vap({
            container: vapRef.current,
            src: content,
            config: params,
            width: newWidth,
            height: newHeight,
            fps: playerFps,
            loop: true,
            accurate: true
        })

        window.vap = vap;

        // 组件卸载时清理
        return () => {
            if (window.vap) {
                window.vap.destroy();
                window.vap = null;
            }
        };
    }, [content, width, height, JSON.stringify(params), newHeight, newHeight]); // 仅在组件挂载和卸载时运行

    return (
        <Wrapper>
            <WrapperBox width={width} height={height} isCompress={isCompress} maskWidth={newWidth} maskHeight={newHeight}>
                <div ref={vapRef} />
            </WrapperBox>
        </Wrapper>
    )
}

const Wrapper = styled.div`
 

`