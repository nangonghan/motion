import styled from "@emotion/styled";
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react'
import {
    selectAnimationInfo, selectHeight, selectContent, selectParams, changeCompressFormat, changeCompressContent, changeCompressParams, changeCompressAnimationInfo, selectFormat, selectPngs, changeIsChangeToSource, changeCompressPngs, changeIsShowTab,
    changeIsChangeSvgaToSequence, selectSvgaInnerSize,
    changeSequenceSize, changeCompressServerParams,
    selectIsChangeSvgaToSequence,
    selectFileName,
    selectCompressAnimationInfo,
    selectSequenceParams,
    selectCompressServerParams,
    changeAnimationInfo,
    resetState,
    selectCompressContent,
    selectCompressParams,
    selectToken,
    selectCompressUrl
} from "../store/reducers/controlSlice"
import { getValidFileContent } from "../helpers/fileFormat"
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Input,
    Spacer,
    Box,
    Badge,
    Flex,
    Grid,
    Text,
    Button,
    Switch,
    useToast,
    Select
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { compress_video, compress_svga, compress_lottie, compress_webp, compress_apng, compress_gif, compress_pngs } from "../api/index"
import { CustomNumberInput } from "../components/numberInput"
import CryptoJS from 'crypto-js';
import { getFileUrl } from "../api/upload";
import { sequence2Animations } from "../api/sequnece";
import { postRecord } from "../api/record";
export default function ResultSection() {

    const canvasHeight = useSelector(selectHeight)
    const sequenceParams = useSelector(selectSequenceParams)
    const compressServerParams = useSelector(selectCompressServerParams)
    const [isRecord, setIsRecord] = useState(false)
    const vapConfig = useSelector(selectCompressParams)
    const compressFile = useSelector(selectCompressContent)
    const compressUrl = useSelector(selectCompressUrl)
    const token = useSelector(selectToken)
    console.log("token", token)
    const dispatch = useDispatch();
    // common functions
    function getFormatDimensions(animationInfo) {
        const { dimensions } = animationInfo
        return `${dimensions.replace(/px/g, "").replace(/-/g, "x").replace(/ /g, "")}px`
    }
    function extractDimensions(dimensionString) {

        try {
            const [width, height] = dimensionString.replace(/px/g, "").split('-');

            return { initWidth: width, initHeight: height };
        } catch (error) {
            return { initWidth: 0, initHeight: 0 };
        }
    }
    function formatDuration(duration) {
        return `${duration} S`
    }
    function formatFrameRate(frameRate) {
        return `${frameRate} fps`
    }
    function formatFileSize(fileSize) {

        if (fileSize === 0) {
            return '0 KB';
        }
        if (fileSize < 1024) {
            return `${fileSize} B`;
        }
        if (fileSize < 1024 * 1024) {
            return `${(fileSize / 1024).toFixed(2)} KB`;
        }
        return `${(fileSize / 1024 / 1024).toFixed(2)} MB`;
    }

    function getSizeDiff(source, target) {
        // 增加
        if (target > source) {
            return `增加${Math.round((target - source) / source * 100)}%`
        } else if (target < source) {
            return `减少${Math.round((source - target) / source * 100)}%`
        }
    }
    function getDiffColor(source, target, opacity) {
        if (target > source) {
            return `rgba(255,77,77,${opacity})`
        } else if (target < source) {
            return `rgba(77,255,180,${opacity})`
        }
    }
    function getDiffState(source, target) {
        if (target > source) {
            return `增加`
        } else if (target < source) {
            return `减少`
        }
    }
    function downloadFile(url, fileName) {

        if (process.env.NODE_ENV !== 'development') {

        }
        // 创建一个a标签元素
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';

        // 将a元素添加到文档中，并触发点击事件
        document.body.appendChild(a);
        a.click();

        // 删除a元素
        document.body.removeChild(a);
    }
    async function generateFileMD5(fileUrl) {
        const response = await fetch(fileUrl);
        const file = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const data = event.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(data);
                const hash = CryptoJS.MD5(wordArray).toString();
                resolve(hash);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    function downloadTextFile(text, fileName) {
        // 创建一个表示纯文本的 Blob
        const blob = new Blob([text], { type: 'text/plain' });

        // 创建一个表示 Blob 的 URL
        const url = URL.createObjectURL(blob);

        // 创建一个a标签元素
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';

        // 将a元素添加到文档中，并触发点击事件
        document.body.appendChild(a);
        a.click();

        // 删除a元素
        document.body.removeChild(a);

        // 释放 Blob URL
        URL.revokeObjectURL(url);
    }
    async function addRecord(token, fileName, fileFormat, fileResolution, fileSize, fileUrl, fileContent) {
        const record = {
            fileName,
            fileFormat,
            fileResolution,
            fileSize,
            fileUrl,
            fileContent,
        }
        postRecord(token, JSON.stringify(record)).then((res) => {
            console.log(res)

        }).catch((error) => {
            console.log(error)
        })
    }
    async function downloadAssets(fileName, format, file, token, compressUrl, isRecord) {

        try {
            const formatToFileExtension = {
                'mp4': 'mp4',
                'alphaVideo': 'mp4',
                'vap': 'mp4',
                'svga': 'svga',
                'lottie': 'json',
                'webp': 'webp',
                'apng': 'png',
                'gif': 'gif',
            };

            if (format in formatToFileExtension) {
                downloadFile(file, `${fileName}.${formatToFileExtension[format]}`);
                const fileUrl = compressUrl
                setIsRecord(true)
                if (!isRecord)
                    addRecord(token, fileName, format, getFormatDimensions(compressAnimationInfo), compressAnimationInfo.fileSize, fileUrl, "{}")
                if (format === "vap") {
                    const md5 = await generateFileMD5(file)
                    const fileContent = {
                        md5: md5,
                        config: vapConfig
                    }
                    if (!isRecord)
                        addRecord(token, fileName, format, getFormatDimensions(compressAnimationInfo), compressAnimationInfo.fileSize, fileUrl, JSON.stringify(fileContent))
                    downloadTextFile(md5, `${fileName}.txt`)
                    downloadTextFile(JSON.stringify(vapConfig), `${fileName}.json`)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    // source data 
    const animationInfo = useSelector(selectAnimationInfo)
    const compressAnimationInfo = useSelector(selectCompressAnimationInfo)
    const { source_width, source_height, new_width, new_height, isResize, scaleMode,
        source_frameRate, new_frameRate, isChangeFrameRate,
        cut_start_duration, cut_end_duration, time_stretch, isChangeDuration,
        top_distance, bottom_distance, isChangeMask, configInfo, source_format_mode, target_format_mode, fileName, audioFileName, isShowAvatar, avatarSize, acturalDuration } = sequenceParams

    const { is_mute, compress_value, volume, targetAudioUrl } = compressServerParams
    const isChangeFormat = source_format_mode !== target_format_mode
    const isShowCompress = compress_value !== 100
    const isChangeAudioFile = audioFileName !== ""
    const isShowMemoryUsage = animationInfo.format === "svga" && compressAnimationInfo.format === "svga" && animationInfo.memoryUsage !== compressAnimationInfo.memoryUsage
    const isShowSize = animationInfo.fileSize !== compressAnimationInfo.fileSize && animationInfo.fileSize !== compressAnimationInfo.fileSize

    return (
        <Wrapper height={canvasHeight + 16}>

            <Grid padding={2} gap={2} alignContent='center' alignItems={'center'} borderBottom={"1px solid rgba(255,255,255,0.1)"} >
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1200 }} mb={0} color={"rgba(255,255,255,0.25)"}>文件内存</Text>

                {isShowSize && <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>文件大小:</Box>
                    <Spacer />
                    <Box style={{ textDecoration: "line-through" }}> {formatFileSize(animationInfo.fileSize)}</Box>
                    <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                    <Box color={"#4DCAFF"}> {formatFileSize(compressAnimationInfo.fileSize)}</Box>
                    <Flex color={`${getDiffColor(animationInfo.fileSize, compressAnimationInfo.fileSize, 1)}`} p={1.5} bg={`${getDiffColor(animationInfo.fileSize, compressAnimationInfo.fileSize, 0.1)}`} borderRadius={4} fontSize={12} marginLeft={4}>

                        {getDiffState(animationInfo.fileSize, compressAnimationInfo.fileSize) === "增加" ? <img src="assets/arrowUp.svg" style={{ width: 9, marginRight: 4 }} /> : <img src="assets/arrowDown.svg" style={{ width: 9, marginRight: 4 }} />}
                        <strong>{getSizeDiff(animationInfo.fileSize, compressAnimationInfo.fileSize)}</strong>
                    </Flex>

                </Flex>}
                {isShowMemoryUsage && <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>运行内存:</Box>
                    <Spacer />
                    <Box style={{ textDecoration: "line-through" }}> {formatFileSize(animationInfo.memoryUsage)}</Box>
                    <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                    <Box color={"#4DCAFF"}> {formatFileSize(compressAnimationInfo.memoryUsage)}</Box>
                    <Flex color={`${getDiffColor(animationInfo.memoryUsage, compressAnimationInfo.memoryUsage, 1)}`} p={1.5} bg={`${getDiffColor(animationInfo.memoryUsage, compressAnimationInfo.memoryUsage, 0.1)}`} borderRadius={4} fontSize={12} marginLeft={4}>
                        {getDiffState(animationInfo.memoryUsage, compressAnimationInfo.memoryUsage) === "增加" ? <img src="assets/arrowUp.svg" style={{ width: 9, marginRight: 4 }} /> : <img src="assets/arrowDown.svg" style={{ width: 9, marginRight: 4 }} />}

                        <strong>{getSizeDiff(animationInfo.memoryUsage, compressAnimationInfo.memoryUsage)}</strong>
                    </Flex>

                </Flex>}

            </Grid>
            <Grid padding={2} gap={2} alignContent='center' alignItems={'center'} borderBottom={"1px solid rgba(255,255,255,0.1)"} >
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1200 }} mb={0} color={"rgba(255,255,255,0.25)"}>处理详情</Text>

                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box >格式转换:</Box>
                    <Spacer />
                    <Box style={{ textDecoration: "line-through" }}> {animationInfo.format}</Box>
                    <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                    <Box color={"#4DCAFF"}> {compressAnimationInfo.format?.replace("alphaVideo", "双通道")}</Box>

                </Flex>
                {isShowCompress &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >压缩比例:</Box>
                        <Spacer />
                        <Box> {compress_value}%</Box>
                    </Flex>}
                {isResize &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >文件尺寸:</Box>
                        <Spacer />
                        <Box style={{ textDecoration: "line-through" }}> {getFormatDimensions(animationInfo)}</Box>
                        <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                        <Box color={"#4DCAFF"}> {getFormatDimensions(compressAnimationInfo)}</Box>
                    </Flex>}
                {isChangeMask &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >顶部和底部虚化效果:</Box>
                        <Spacer />
                        <Box> 顶部 {top_distance} % &ensp;底部  {bottom_distance} %</Box>
                    </Flex>}
                {isChangeDuration &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >整体时长:</Box>
                        <Spacer />
                        <Box style={{ textDecoration: "line-through" }}> {formatDuration(animationInfo.duration)}</Box>
                        <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                        <Box color={"#4DCAFF"}> {formatDuration(acturalDuration)}</Box>
                    </Flex>
                }
                {isChangeFrameRate &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >帧率修改:</Box>
                        <Spacer />
                        <Box style={{ textDecoration: "line-through" }}> {formatFrameRate(animationInfo.frameRate)}</Box>
                        <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                        <Box color={"#4DCAFF"}> {formatFrameRate(new_frameRate)}</Box>
                    </Flex>}

                {is_mute &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >音量:</Box>
                        <Spacer />
                        <Box>已静音</Box>
                    </Flex>}
                {isChangeAudioFile &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >替换音效:</Box>
                        <Spacer />
                        <Box>{audioFileName}</Box>
                    </Flex>}
                {isShowAvatar &&
                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box >头像框内圈尺寸:</Box>
                        <Spacer />
                        <Box style={{ textDecoration: "line-through" }}> {extractDimensions(animationInfo.dimensions).initWidth}PX</Box>
                        <img src="assets/line.svg" style={{ width: 20, marginLeft: 10, marginRight: 10 }} />
                        <Box color={"#4DCAFF"}> {avatarSize}PX</Box>
                    </Flex>
                }

            </Grid>


            <Grid p={1.5} gap={4}>
                <Box onClick={() => {
                    downloadAssets(fileName, compressAnimationInfo.format, compressFile, token, compressUrl, isRecord)
                }}
                    className="button"
                    cursor={"pointer"}
                >
                    下载文件
                </Box>
                <Box onClick={() => {
                    dispatch(changeCompressAnimationInfo({}))
                    dispatch(changeCompressFormat(""))
                    dispatch(changeCompressContent(""))
                    dispatch(resetState())
                }}
                    className="edit"
                    cursor={"pointer"}
                >

                    再次编辑

                </Box>
            </Grid>
        </Wrapper >
    )
}

const Wrapper = styled.div`
 width:500px;
 
 height:${props => props.height}px;
 max-height:828px;
                                                                            
 color:rgba(255,255,255,0.85);
 
 background: linear-gradient(180deg, rgba(45, 48, 78, 0.2) 0%, rgba(88, 91, 126, 0.2) 100%);
border: 1px solid rgba(119, 161, 191, 0.1);
border-radius: 20px;
 padding:10px 10px;
 overflow-y: auto;
   /* Custom scrollbar styles */
   ::-webkit-scrollbar {
    width: 0px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #4DCAFF;
  }
.button{
    background: linear-gradient(180deg, #127FFF 0%, #3BADFF 100%);
    border-radius: 16px;
    font-size: 18px;
    width:444px;
    height:55px;
    text-align: center;
    line-height: 55px;
    font-weight: 600;
}
.edit{
    background: linear-gradient(180deg, #35395E 0%, #33375A 100%);;
    border-radius: 16px;
    font-size: 18px;
    width:444px;
    height:55px;
    text-align: center;
    line-height: 55px;
    font-weight: 600;
}
 
`