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
    selectRecordList,
    changeRecordList
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
import { getRecordList } from "../api/record";
export default function HistorySection() {

    const canvasHeight = useSelector(selectHeight)
    const sequenceParams = useSelector(selectSequenceParams)
    const compressServerParams = useSelector(selectCompressServerParams)
    const vapConfig = useSelector(selectCompressParams)
    const compressFile = useSelector(selectCompressContent)
    const token = useSelector(selectToken)
    const recordList = useSelector(selectRecordList)
    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = useState(1);

    const [isLoading, setIsLoading] = useState(false);

    const loadMore = async (currentPage, token) => {
        setIsLoading(true);
        await loadMoreItems(currentPage, token);
        setIsLoading(false);
    };

    async function loadMoreItems(currentPage, token) {
        try {

            const response = await getRecordList(token, currentPage, 100);

            const data = response.data
            console.log(data)
            if (data.code === 0 && data.length !== 0) {
                const newData = JSON.parse(JSON.stringify(recordList));

                const newRecordList = data.data
                // 如果返回的数据长度小于请求的数据量，那么就不再加载更多数据
                if (newRecordList.length < currentPage * 100) {
                    console.log('No more data to load');
                    dispatch(changeRecordList(newRecordList));
                } else {
                    dispatch(changeRecordList([...newData, ...newRecordList]));
                    setCurrentPage(currentPage + 1);
                }
            }

        } catch (error) {
            console.log(error)
        }
    }



    useEffect(() => {
        if (token) {
            loadMoreItems(currentPage, token)

        }
    }, [token])
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
        fetch(url)
            .then(resp => resp.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // the filename you want
                a.download = fileName || 'download';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(() => alert('oh no!'));
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
    async function downloadAssets(fileName, format, file, fileContent) {
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
                if (format === "vap") {
                    try {
                        const fileObj = JSON.parse(fileContent)
                        const { md5, config } = fileObj

                        downloadTextFile(md5, `${fileName}.txt`)
                        downloadTextFile(JSON.stringify(config), `${fileName}.json`)
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Wrapper  >
            <Box mb={"20px"}>
                <img src="assets/fileResult.svg" />
            </Box>
            <Box mb={"12px"} >
                {recordList.length > 0 && <Button
                    w={"100%"}
                    onClick={() => { loadMore(currentPage, token) }}
                    isLoading={isLoading}
                    bg={"#4387F7"}
                    color={"#fff"}
                    _hover={{ bg: "#4387F7" }}
                >
                    加载更多
                </Button>
                }

            </Box>
            {recordList.length === 0 && <Grid placeContent={"center"} h={800}>

                <Box  >
                    <img src="assets/empty.svg" style={{ width: "126px" }} cursor={"pointer"} />
                </Box>
            </Grid>
            }

            <Grid gap={"12px"} style={{ overflowY: "scroll", maxHeight: "calc(100% - 80px)", scrollbarWidth: "thin", scrollbarColor: "#888 #1D1F36" }}>
                {recordList.length > 0 && recordList.map((item, index) => {
                    const { fileName,
                        fileFormat,
                        fileResolution,
                        fileSize,
                        fileUrl,
                        fileContent, } = item
                    return (
                        <Grid p={"16px"} bg={"#21233A"} borderRadius={10} gridTemplateColumns={"44px auto"} gap={"12px"} key={index}>
                            <img src="assets/fileIcon.svg" />
                            <Grid gap={"9px"}>
                                <Flex justifyContent="space-between" gap={"40px"} alignItems={"center"} w={"100%"}>
                                    <Text fontSize="14px" color="#fff">{fileName}</Text>
                                    <Flex
                                        bg={"rgba(22 ,136 ,255 ,0.2)"}
                                        w={"62px"}
                                        h={"30px"}
                                        p={"6px 12px"}
                                        borderRadius={6}
                                        gap={"2px"}
                                        justifyContent="space-between" cursor={"pointer"}
                                        onClick={() => {
                                            downloadAssets(fileName, fileFormat, fileUrl, fileContent)
                                        }}
                                    >
                                        <img src="assets/downloadIcon.svg" style={{ width: "12px" }} cursor={"pointer"} />
                                        <Text fontSize="12px" color="#1688FF" cursor={"pointer"} >下载</Text>
                                    </Flex>
                                </Flex>

                                <Text fontSize="12px" color={"rgba(225, 238, 255 ,0.8)"}><span>格式:</span> {fileFormat}  |  <span>尺寸:</span> {fileResolution} | <span>大小:</span> {formatFileSize(fileSize)}</Text>

                                <Box></Box>
                            </Grid>
                        </Grid>
                    )
                })}
            </Grid>

        </Wrapper >
    )
}

const Wrapper = styled.div`
    width:428px;
    height:100%;
    background-color:rgba(45, 48, 78,0.3);
    position: absolute;
    /* border-left: 1px solid rgba(255,255,255,0.1); */
    top: 0;
    right: 0;
    padding:32px;
   gap:12px;
    span{
        color:rgba(225, 238, 255 ,0.6)
    }
 
 
`