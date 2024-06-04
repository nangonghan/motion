import styled from "@emotion/styled";
import {
  selectBgColor, selectIsShowTab,
  selectFileName, changeBackgroundColor,
  selectMaskBottomRatio,
  selectMaskTopRatio,
  selectAnimationInfo
} from "../store/reducers/controlSlice"
import { useSelector } from 'react-redux';

import { useDispatch } from 'react-redux';
import React, { useEffect, useRef, useState } from 'react';
import {

  Box,

  Flex,

} from '@chakra-ui/react'
import { motion } from "framer-motion"
import tinycolor from "tinycolor2";
export default function WrapperBox(props) {
  const { children, width, height, isCompress, maskWidth, maskHeight } = props;
  const maskTopRatio = useSelector(selectMaskTopRatio)
  const maskBottomRatio = useSelector(selectMaskBottomRatio)
  const animationInfo = useSelector(selectAnimationInfo)
  function extractDimensions(dimensionString) {

    try {
      const [width, height] = dimensionString.replace(/px/g, "").split('-');

      return { initWidth: width, initHeight: height };
    } catch (error) {
      return { initWidth: 0, initHeight: 0 };
    }
  }
  const { initWidth, initHeight } = extractDimensions(animationInfo.dimensions)
  function createGradient(width, height, whiteRatioTop, whiteRatioBottom) {
    var canvas = document.getElementById('mask');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    // Set the parameters
    var top_mask_position = height * whiteRatioTop;

    var bottom_mask_position = height * whiteRatioBottom
    console.log("top_mask_position", top_mask_position)
    console.log("bottom_mask_position", bottom_mask_position)
    var mask_feather = 120;

    // Calculate the positions
    var source_height = height + mask_feather * 2;
    var mask_diff = mask_feather / 2;
    var top_line_location = top_mask_position + mask_diff;
    var bottom_line_location = source_height - mask_diff - bottom_mask_position;
    var top_end = top_line_location - mask_diff;
    var top_start = top_line_location + mask_diff;
    var bottom_end = bottom_line_location + mask_diff;
    var bottom_start = bottom_line_location - mask_diff;

    // Create the gradient
    var imageData = ctx.createImageData(width, source_height);
    for (var y = 0; y < source_height; y++) {
      var alpha;
      if (y <= top_end) {
        alpha = 255;
      } else if (y <= top_start) {
        alpha = Math.floor(255 - 255 * (y - top_end) / mask_feather);
      } else if (y <= bottom_start) {
        alpha = 0;
      } else if (y <= bottom_end) {
        alpha = Math.floor(255 * (y - bottom_start) / mask_feather);
      } else {
        alpha = 255;
      }
      for (var x = 0; x < width; x++) {
        var index = (y * width + x) * 4;
        imageData.data[index + 0] = 255; // R
        imageData.data[index + 1] = 255; // G
        imageData.data[index + 2] = 255; // B
        imageData.data[index + 3] = 255 - alpha; // A
      }
    }
    // Create a temporary canvas to hold the image data
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = source_height;
    var tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Draw the image data to the canvas
    ctx.drawImage(tempCanvas, 0, mask_feather, width, height, 0, 0, width, height);

    return canvas
  }
  function base642Url(base64Data) {
    const byteCharacters = atob(base64Data.split(',')[1]);
    let byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const gradient_url = URL.createObjectURL(blob);
    return gradient_url;
  }
  const bgColor = useSelector(selectBgColor)
  const fileName = useSelector(selectFileName)

  const darkenColor = tinycolor(bgColor).darken(40).toHexString()
  // color list 
  const colorList = ["#000000", "#FFFFFF", "#518CF7", "#53B154", "#F2D254", "#E9525F"]
  const dispatch = useDispatch();

  const [mask, setMask] = useState(null);
  const isShowCompress = isCompress === true;
  const mask_scale_ratio = initWidth / width;
  useEffect(() => {
    const maskTop = !isShowCompress ? maskTopRatio * mask_scale_ratio : 0;
    const maskBottom = !isShowCompress ? maskBottomRatio * mask_scale_ratio : 0;
    const canvas = createGradient(maskWidth, maskHeight, maskTop / 100, maskBottom / 100);
    const base64Data = canvas.toDataURL();

    const gradient_url = base642Url(base64Data)

    setMask(gradient_url);
    return () => {
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [maskWidth, maskHeight, maskTopRatio, maskBottomRatio, isShowCompress, mask_scale_ratio]);

  return (
    <Wrapper width={width} height={height} bg={bgColor}>
      <Name bg={darkenColor}>{isShowCompress ? "压缩后" : fileName}</Name>
      <Flex position={"absolute"} bottom={0} mb={6} style={{
        left: "50%",
        transform: "translate(-50%, 0%)",
        zIndex: 99
      }}>
        {!isShowCompress && colorList.map((item => {
          return (
            <motion.div key={item} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Box w="30px" h="30px" bg={item} mr={2} borderRadius="8px" border={"1px solid #fff"} onClick={() => {
                dispatch(changeBackgroundColor(item));
              }} />

            </motion.div>
          )
        }))}
      </Flex>
      <canvas id="mask" width={maskWidth} height={maskHeight} />
      <ChildrenWrapper mask={mask}>
        {children}
      </ChildrenWrapper>
    </Wrapper >
  );
}

const Wrapper = styled.div`
  width: ${(props) => props.width + 16}px;
  height: ${(props) => props.height + 16}px;
  background: ${props => props.bg};
 
  border: 2px solid rgba(172,210,255,0.1);
  border-radius: 20px;
  display: grid;
  place-content: center;
  position: relative;
  .tabGroup{
    position: absolute;
    top: 0;
    left: 0;
    width:100%;
    z-index: 99;
  };
  #mask{
 
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: none; 
  }
`;

const Name = styled.div`
  width:90%;
  position: absolute;
  font-size: 16px;
  text-align: center;
  margin-top: 20px;
  padding:6px 8px;
  border-radius: 6px;
  color:white;
  background: ${props => props.bg};
  top: 0%;
  left: 50%;
  transform: translate(-50%, 0%);
`
const ChildrenWrapper = styled.div`
 
  mask-image: url(${(props) => props.mask});
  -webkit-mask-image: url(${(props) => props.mask});
  
`;