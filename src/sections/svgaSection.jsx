import styled from "@emotion/styled";
import SVGA from "svgaplayerweb";
import { useEffect, useRef } from "react";
import { selectWidth, selectHeight, changeSvgaInnerSize, changeSvgaAudioUrl, selectAnimationInfo } from "../store/reducers/controlSlice";
import { useSelector } from "react-redux";
import WrapperBox from "../components/WrapperBox";

import { useDispatch } from 'react-redux';
export default function SvgaSection(props) {
  const { content, isCompress } = props;
  const dispatch = useDispatch();
  const width = useSelector(selectWidth);
  const height = useSelector(selectHeight);
  const animationInfo = useSelector(selectAnimationInfo)
  const svgaNormalRef = useRef(null);
  function getInnerSize(videoItem) {
    // 查找 imageKey 为 "inner" 的元素
    const innerSprite = videoItem.sprites.find(sprite => sprite.imageKey === 'inner');

    // 如果找到了，获取 frames 第一个元素的 layout 的宽度和高度
    if (innerSprite && innerSprite.frames[0] && innerSprite.frames[0].layout) {
      const { width, height } = innerSprite.frames[0].layout;
      if (width === height) {
        return width;
      }

    }

  }
  function extractDimensions(dimensionString) {

    try {
      const [width, height] = dimensionString.replace(/px/g, "").split('-');

      return { initWidth: width, initHeight: height };
    } catch (error) {
      return { initWidth: 0, initHeight: 0 };
    }
  }
  const { initWidth, initHeight } = extractDimensions(animationInfo.dimensions)
  useEffect(() => {
    if (!svgaNormalRef.current) return;

    // 创建 SVGA 播放器实例
    const player = new SVGA.Player(svgaNormalRef.current);
    const parser = new SVGA.Parser(svgaNormalRef.current);

    // 加载并播放 SVGA 动画
    parser.load(content, function (videoItem) {
      console.log("videoItem", videoItem)
      player.setVideoItem(videoItem);
      player.startAnimation();
      const isHaveAudio = videoItem.audios.length > 0;
      if (isHaveAudio) {
        const audioKey = videoItem.audios[0].audioKey;
        const audioBinary = videoItem.images[audioKey];
        function dataURLtoBlob(dataurl) {
          var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new Blob([u8arr], { type: mime });
        }
        const audioUrl = URL.createObjectURL(dataURLtoBlob('data:audio/x-mpeg;base64,' + audioBinary))
        dispatch(changeSvgaAudioUrl(audioUrl))
      }
      const innerSize = getInnerSize(videoItem);
      if (innerSize) dispatch(changeSvgaInnerSize(innerSize))
    });

    // 组件卸载时释放资源
    return () => {
      player._renderer._bitmapCache = {} // 解决音频无法清除的问题
      player.clear();
    };
  }, [content]);
  console.log("height", height)
  return (
    <Wrapper width={width} height={width * initHeight / initWidth}>

      <WrapperBox width={width} height={height} isCompress={isCompress} maskWidth={width} maskHeight={width * initHeight / initWidth}>

        <div ref={svgaNormalRef} className="svga" />
      </WrapperBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .svga {
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
   
  }
 
`;
