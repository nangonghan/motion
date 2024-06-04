import styled from "@emotion/styled";
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react'
import {
    selectAnimationInfo, selectHeight, selectContent, selectParams, changeCompressFormat, changeCompressContent, changeCompressParams, changeCompressAnimationInfo, selectFormat, selectPngs, changeIsChangeToSource, changeCompressPngs, changeIsShowTab,
    selectSvgaInnerSize,
    changeSequenceSize, changeCompressServerParams,
    selectIsChangeSvgaToSequence,
    selectFileName,
    selectSvgaAudioUrl,
    changeMaskBottomRatio,
    changeMaskTopRatio,
    changeCompressUrl
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
    MenuList,
    MenuItem,
    Menu,
    MenuButton
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { compress_video, compress_svga, compress_lottie, compress_webp, compress_apng, compress_gif, compress_pngs } from "../api/index"
import { CustomNumberInput } from "../components/numberInput"
import CryptoJS from 'crypto-js';
import { getFileUrl } from "../api/upload";
import { sequence2Animations } from "../api/sequnece";
import { urlToFile } from "../api/file";
export default function ControlSection() {
    const animationInfo = useSelector(selectAnimationInfo)
    const format = useSelector(selectFormat)
    const pngDatas = useSelector(selectPngs);
    const file = useSelector(selectContent)
    const vapInfo = useSelector(selectParams)
    const fileName = useSelector(selectFileName)
    const initInnerSize = useSelector(selectSvgaInnerSize)
    const svgaAudioUrl = useSelector(selectSvgaAudioUrl)
    const toast = useToast()
    const dispatch = useDispatch();
    const canvasHeight = useSelector(selectHeight)
    const IsChangeSvgaToSequence = useSelector(selectIsChangeSvgaToSequence)

    function extractDimensions(dimensionString) {

        try {
            const [width, height] = dimensionString.replace(/px/g, "").split('-');

            return { initWidth: width, initHeight: height };
        } catch (error) {
            return { initWidth: 0, initHeight: 0 };
        }
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
    function formatDuration(duration) {
        return `${duration} S`
    }
    function formatFrameRate(frameRate) {
        return `${frameRate} fps`
    }
    function logError(error) {
        toast({
            title: '网站错误',
            description: "联系网站管理员",
            status: 'error',
            duration: 3000,
            isClosable: true,
        })
    }
    function logMessage(message) {
        toast({
            title: '下载成功',
            description: message,
            status: 'info',
            duration: 3000,
            isClosable: true,
        })
    }
    const { initWidth, initHeight } = extractDimensions(animationInfo.dimensions)

    const [width, setWidth] = useState(initWidth);
    const [height, setHeight] = useState(initHeight);
    const [compressValue, setCompressValue] = useState(60)
    const [compressWidth, setCompressWidth] = useState(600)
    const [isMute, setIsMute] = useState(false)
    const [isResize, setIsResize] = useState(false)
    const [audioFileName, setAudioFileName] = useState("")
    const [audioFile, setAudioFile] = useState(null)
    const [isCompress, setIsCompress] = useState(false)
    const [volume, setVolume] = useState(100)
    const [framerate, setFramerate] = useState(animationInfo.frameRate)
    const [scaleMode, setScaleMode] = useState("unScale")
    const [formatMode, setFormatMode] = useState("unChange")
    const [isMask, setIsMask] = useState(false)
    const [maskTopDistance, setMaskTopDistance] = useState(0)
    const [maskBottomDistance, setMaskBottomDistance] = useState(0)
    const [featherDegree, setFeatherDegree] = useState(50)

    const [avatarSize, setAvatarSize] = useState(initInnerSize)

    // change duration 

    const [isChangeDuration, setIsChangeDuration] = useState(false)
    const [cutStartDuration, setCutStartDuration] = useState(0)
    const [cutEndDuration, setCutEndDuration] = useState(0)
    const [durationSpeed, setDurationSpeed] = useState(100)
    const acturalDuration = (animationInfo.duration - cutStartDuration - cutEndDuration) * durationSpeed / 100
    const duration = animationInfo.duration;
    useEffect(() => {

        setAvatarSize(initInnerSize)
    }, [initInnerSize])
    useEffect(() => {
        const { initWidth, initHeight } = extractDimensions(animationInfo.dimensions)
        setWidth(initWidth)
        setHeight(initHeight)
        setFramerate(animationInfo.frameRate)
    }, [animationInfo])
    function AnimationDetails({ animationInfo }) {

        const infoItems = [];
        if (animationInfo.format) {
            infoItems.push({ label: '格式', value: animationInfo.format.toUpperCase().replace("ALPHAVIDEO", "双通道") });
        }
        if (animationInfo.version) {
            infoItems.push({ label: '版本', value: animationInfo.version });
        }
        if (animationInfo.dimensions) {
            infoItems.push({ label: '尺寸', value: animationInfo.dimensions });
        }
        if (animationInfo.fileSize) {
            infoItems.push({ label: '大小', value: formatFileSize(animationInfo.fileSize) });
        }
        if (animationInfo.memoryUsage) {
            infoItems.push({ label: '内存', value: formatFileSize(animationInfo.memoryUsage) });
        }
        if (animationInfo.duration) {
            infoItems.push({ label: '时长', value: formatDuration(animationInfo.duration) });
        }
        if (animationInfo.frameRate) {
            infoItems.push({ label: '帧率', value: formatFrameRate(animationInfo.frameRate) });
        }

        return (
            <Flex wrap="wrap">
                {infoItems.map(item => {
                    if (item.value) {
                        return (
                            <Box key={item.label} p={1}>
                                <Box textAlign="right" lineHeight="normal">
                                    <Badge verticalAlign="middle" borderRadius={4} p={2} color={"#fff"} background={"#222536"}>
                                        {item.label}： {item.value}
                                    </Badge>
                                </Box>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Flex>
        );
    }




    function limitString(str, maxLength) {
        if (str.length <= maxLength) {
            return str;
        }

        return str.slice(0, maxLength) + '...';
    }
    function getFileNameFromPath(path) {
        const lastIndex = path.lastIndexOf('\\');
        return path.substring(lastIndex + 1);
    }
    function mapRange(value, fromMin, fromMax, toMin, toMax) {
        // 确保输入的值在源范围内
        value = Math.max(Math.min(value, fromMax), fromMin);
        // 计算映射后的值
        const mappedValue = (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
        return mappedValue;
    }

    function createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version) {
        const infoObject = {};

        if (format) infoObject.format = format;

        if (fileSize) infoObject.fileSize = fileSize;
        if (memoryUsage) infoObject.memoryUsage = memoryUsage;
        if (duration) infoObject.duration = duration;
        if (dimensions) infoObject.dimensions = dimensions;
        if (version) infoObject.version = version;

        return infoObject;
    }


    function createObjectLink(content) {
        function identifyObject(obj) {
            if (obj instanceof File) {
                return 'File';
            } else if (obj instanceof Blob) {
                return 'Blob';
            } else {
                return 'Other';
            }
        }
        const objectType = identifyObject(content)
        if (objectType === "Other") {
            return content
        } else {
            return URL.createObjectURL(content)
        }
    }
    async function rechangeVideoAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "video/mp4")

        const fileExtension = `.mp4`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)

        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)
        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    async function rechangeSVGAAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "")

        const fileExtension = `.svga`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)

        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)

        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    async function rechangeLottieAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "application/json")

        const fileExtension = `.json`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)

        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)
        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    async function rechangeWebpAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "image/webp")
        const fileExtension = `.webp`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)
        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)
        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    async function rechangeApngpAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "image/png")
        const fileExtension = `.png`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)
        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)
        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    async function rechangeGifAnimationInfo(url) {
        const file = await urlToFile(url, "xxx", "image/gif")
        const fileExtension = `.gif`
        const { format, content, params, fileSize, memoryUsage, duration, dimensions, version } = await getValidFileContent(fileExtension, file)
        const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version)
        dispatch(changeCompressAnimationInfo({}))
        dispatch(changeCompressUrl(url))
        dispatch(changeCompressAnimationInfo(animateInfo))
        dispatch(changeCompressFormat(format));
        dispatch(changeCompressContent(createObjectLink(content)));
        dispatch(changeCompressParams(params));
    }
    const isContainAudio = format === "mp4" || format === "svga" || format === "vap" || format === "alphaVideo"
    const isChangImageSize = format === "png"
    const isContainSize = format === "svga" || format === "vap" || format === "alphaVideo" || format === "webp" || format === "apng" || format === "gif"
    const isShowCompressSize = compressValue < 100 && (format === 'mp4' || format === 'alphaVideo' || format === 'vap')
    const audioButtonName = audioFileName === "" ? "上传音频文件" : limitString(audioFileName, 50)

    function convertToMB(fileSizeStr) {

        let [size, unit] = fileSizeStr.split(' ');

        size = parseFloat(size);
        switch (unit) {
            case 'B':
                return size / 1024 / 1024;
            case 'KB':
                return size / 1024;
            case 'MB':
                return size;
            default:
                throw new Error(`Unknown unit: ${unit}`);
        }
    }
    // let numFilesize = convertToMB(fileSize)
    // const videoPredictSize = mapRange(compressValue, 0, 100, 0, numFilesize)
    useEffect(() => {
        setAudioFile(null)
        setAudioFileName("")
    }, [animationInfo.dimensions])
    useEffect(() => {
        if (!IsChangeSvgaToSequence) {
            setIsCompress(false)
        };
    }, [IsChangeSvgaToSequence])
    async function downloadImagesAsZip(imageUrls, zipFilename) {
        let zip = new JSZip();

        // Fetch all images and add them to the zip
        let imagePromises = imageUrls.map(async (url, index) => {
            let response = await fetch(url);
            let blob = await response.blob();
            zip.file(`image${index}.png`, blob, { binary: true });
        });

        // Wait for all images to be added
        await Promise.all(imagePromises);

        // Generate the zip file and download it
        zip.generateAsync({ type: 'blob' }).then(function (blob) {
            saveAs(blob, zipFilename);
        });
    }

    function getSequenceParams() {

        // resize 
        const source_width = parseInt(initWidth)
        const source_height = parseInt(initHeight)
        const new_width = parseInt(width)
        const new_height = parseInt(height)
        // scale mode 

        const isResize = source_width !== new_width || source_height !== new_height

        // framerate 
        const source_frameRate = parseInt(animationInfo.frameRate)
        const new_frameRate = parseInt(framerate)
        const isChangeFrameRate = source_frameRate !== new_frameRate

        // duration
        const cut_start_duration = parseInt(cutStartDuration)
        const cut_end_duration = parseInt(cutEndDuration)
        const time_stretch = parseInt(durationSpeed)
        const isChangeDuration = cut_start_duration !== 0 || cut_end_duration !== 0 || time_stretch !== 100

        // mask feather
        const top_distance = parseInt(maskTopDistance)
        const bottom_distance = parseInt(maskBottomDistance)
        const isChangeMask = top_distance !== 0 || bottom_distance !== 0
        const configInfo = vapInfo
        // fromat mode
        const source_format_mode = format
        const target_format_mode = formatMode === "unChange" ? format : formatMode

        // other 
        const isShowAvatar = avatarSize !== 0
        return {
            source_width, source_height, new_width, new_height, isResize, scaleMode,
            source_frameRate, new_frameRate, isChangeFrameRate,
            cut_start_duration, cut_end_duration, time_stretch, isChangeDuration,
            top_distance, bottom_distance, isChangeMask, configInfo, source_format_mode, target_format_mode, fileName, audioFileName, isShowAvatar, avatarSize, acturalDuration
        }

    }
    async function getCompreeedServerParams() {
        const new_width = parseInt(width)
        const new_height = parseInt(height)
        const is_mute = isMute
        const compress_value = parseInt(compressValue)

        const targetAudioUrl = !isMute && audioFile ? await getFileUrl(audioFile, 'mp3') : null
        return {
            new_width, new_height, is_mute, compress_value, volume: parseInt(volume), targetAudioUrl
        }

    }
    async function reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams) {
        if (target_format_mode === "svga") {
            await rechangeSVGAAnimationInfo(url)
        } else if (target_format_mode === "vap" || target_format_mode === "alphaVideo") {
            await rechangeVideoAnimationInfo(url)
        } else if (target_format_mode === "sequence") {
            saveAs(url, `${sequenceParams.fileName}.zip`)
        } else if (target_format_mode === "webp") {
            await rechangeWebpAnimationInfo(url)
        } else if (target_format_mode === "apng") {
            await rechangeApngpAnimationInfo(url)
        } else if (target_format_mode === "gif") {
            await rechangeGifAnimationInfo(url)
        }
    }
    const sequence2Animation = async (fileUrl, svgaAudioUrl, sequenceParams, compressServerParams) => {

        const svga_audio_url = svgaAudioUrl ? await getFileUrl(svgaAudioUrl, "mp3") : "";

        const svgaZipUrl = await getFileUrl(fileUrl, "svga");

        const frameRate = sequenceParams.isChangeFrameRate ? sequenceParams.new_frameRate : sequenceParams.source_frameRate;
        const width = sequenceParams.isChangeSize ? sequenceParams.new_width : sequenceParams.source_width;
        const height = sequenceParams.isChangeSize ? sequenceParams.new_height : sequenceParams.source_height;
        const target_format_mode = sequenceParams.target_format_mode;
        console.log(svgaZipUrl, svga_audio_url, frameRate, width, height, sequenceParams)

        const url = await sequence2Animations(svgaZipUrl, svga_audio_url, frameRate, width, height, sequenceParams, compressServerParams);
        await reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams)





    };
    // 保持参数化
    function getScaleRatio(initInnerSize, avatarSize, scaleMode, sourceWidth, sourceHeight, new_width, new_height) {
        // 暂时优先响应头像框修改
        if (initInnerSize != 0 && initInnerSize !== avatarSize) {

            return avatarSize / initInnerSize
        }
        if (scaleMode === "fit-width") {
            return new_width / sourceWidth
        } else if (scaleMode === "fit-height") {

            return new_height / sourceHeight
        } else {
            return 1
        }
    }
    async function compreeAssets() {
        if (isCompress) return;
        setIsCompress(true)
        const sequenceParams = getSequenceParams()
        const compressServerParams = await getCompreeedServerParams()
        dispatch(changeSequenceSize(sequenceParams))
        dispatch(changeCompressServerParams(compressServerParams))

        try {
            if (format === 'mp4' || format === 'alphaVideo' || format === 'vap') {
                if (sequenceParams.isChangeDuration || sequenceParams.isChangeMask || sequenceParams.isChangeFrameRate || sequenceParams.source_format_mode !== sequenceParams.target_format_mode || sequenceParams.isResize) {
                    const videoUrl = await getFileUrl(file, "mp4")
                    console.log("videoUrl", videoUrl)
                    const framerate = sequenceParams.isChangeFrameRate ? sequenceParams.new_frameRate : sequenceParams.source_frameRate;
                    const width = sequenceParams.isChangeSize ? sequenceParams.new_width : sequenceParams.source_width;
                    const height = sequenceParams.isChangeSize ? sequenceParams.new_height : sequenceParams.source_height;
                    const sourceAudioUrl = ""
                    const target_format_mode = sequenceParams.target_format_mode;
                    const url = await sequence2Animations(videoUrl, sourceAudioUrl, framerate, width, height, sequenceParams, compressServerParams)
                    await reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams)
                    setIsCompress(false)
                } else {
                    const { data } = await compress_video({
                        file, audioFile, isMute, compressValue, vapInfo
                    });
                    await rechangeVideoAnimationInfo(data);
                    setIsCompress(false)
                }
            } else if (format === 'svga') {

                if (sequenceParams.isChangeDuration || sequenceParams.isChangeMask || sequenceParams.isChangeFrameRate || sequenceParams.source_format_mode !== sequenceParams.target_format_mode) {
                    await sequence2Animation(file, "", sequenceParams, compressServerParams)
                    setIsCompress(false)
                } else {
                    const new_width = parseFloat(width)
                    const new_height = parseFloat(height)
                    const scaleRatio = getScaleRatio(initInnerSize, avatarSize, scaleMode, initWidth, initHeight, new_width, new_height)
                    console.log("scaleRatio", scaleRatio)
                    const { data } = await compress_svga({
                        file, audioFile, isMute, compressValue, new_width, new_height, scaleRatio, volume
                    });
                    await rechangeSVGAAnimationInfo(data);
                    setIsCompress(false)
                }



            } else if (format === 'lottie') {
                const { data } = await compress_lottie({
                    file, compressValue,
                });

                await rechangeLottieAnimationInfo(data);
                setIsCompress(false)
            } else if (format === 'webp') {
                if (sequenceParams.isChangeDuration || sequenceParams.isChangeMask || sequenceParams.isChangeFrameRate || sequenceParams.source_format_mode !== sequenceParams.target_format_mode || sequenceParams.isResize) {
                    const framerate = sequenceParams.isChangeFrameRate ? sequenceParams.new_frameRate : sequenceParams.source_frameRate;
                    const width = sequenceParams.isChangeSize ? sequenceParams.new_width : sequenceParams.source_width;
                    const height = sequenceParams.isChangeSize ? sequenceParams.new_height : sequenceParams.source_height;
                    const fileUrl = await getFileUrl(file, "webp")
                    const url = await sequence2Animations(fileUrl, svgaAudioUrl, framerate, width, height, sequenceParams, compressServerParams)
                    const target_format_mode = sequenceParams.target_format_mode;
                    await reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams)
                    setIsCompress(false)
                } else {
                    const { data } = await compress_webp({
                        file, compressValue,
                    });
                    await rechangeWebpAnimationInfo(data);
                    setIsCompress(false)
                }

            }
            else if (format === 'apng') {
                if (sequenceParams.isChangeDuration || sequenceParams.isChangeMask || sequenceParams.isChangeFrameRate || sequenceParams.source_format_mode !== sequenceParams.target_format_mode || sequenceParams.isResize) {
                    const framerate = sequenceParams.isChangeFrameRate ? sequenceParams.new_frameRate : sequenceParams.source_frameRate;
                    const width = sequenceParams.isChangeSize ? sequenceParams.new_width : sequenceParams.source_width;
                    const height = sequenceParams.isChangeSize ? sequenceParams.new_height : sequenceParams.source_height;
                    const fileUrl = await getFileUrl(file, "png")
                    const url = await sequence2Animations(fileUrl, svgaAudioUrl, framerate, width, height, sequenceParams, compressServerParams)
                    const target_format_mode = sequenceParams.target_format_mode;
                    await reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams)
                    setIsCompress(false)
                } else {
                    const { data } = await compress_apng({
                        file, compressValue,
                    });
                    await rechangeApngpAnimationInfo(data);
                    setIsCompress(false)
                }

            }
            else if (format === 'gif') {
                if (sequenceParams.isChangeDuration || sequenceParams.isChangeMask || sequenceParams.isChangeFrameRate || sequenceParams.source_format_mode !== sequenceParams.target_format_mode || sequenceParams.isResize) {
                    const framerate = sequenceParams.isChangeFrameRate ? sequenceParams.new_frameRate : sequenceParams.source_frameRate;
                    const width = sequenceParams.isChangeSize ? sequenceParams.new_width : sequenceParams.source_width;
                    const height = sequenceParams.isChangeSize ? sequenceParams.new_height : sequenceParams.source_height;
                    const fileUrl = await getFileUrl(file, "gif")
                    const url = await sequence2Animations(fileUrl, svgaAudioUrl, framerate, width, height, sequenceParams, compressServerParams)

                    const target_format_mode = sequenceParams.target_format_mode;
                    await reChangeSequenceAnimationInfo(target_format_mode, url, sequenceParams)
                    setIsCompress(false)
                } else {
                    const { data } = await compress_gif({
                        file, compressValue,
                    });
                    await rechangeGifAnimationInfo(data);
                    setIsCompress(false)
                }
            }
            else if (format === 'png') {
                const newPngs = await compress_pngs({
                    pngDatas, compressValue, compressWidth, isResize
                });
                dispatch(changeCompressFormat("png"));
                dispatch(changeCompressPngs(newPngs))
            }
            dispatch(changeIsShowTab(true))
            dispatch(changeIsChangeToSource(false))
        } catch (error) {
            console.log(error)
            logError(error)
            setIsCompress(false)
        }
        finally {


        }

    }
    const formatModeNames = {
        unChange: "不转换",
        svga: "SVGA",
        vap: "VAP",
        alphaVideo: "双通道",
        apng: "APNG",
        webp: "WEBP",
        gif: "GIF",
        sequence: "PNG 序列"
    };
    // update mask data
    function createFormatMenuItem(mode, currentFormat, setFormatMode) {


        if (currentFormat !== mode) {
            return (
                <MenuItem value={mode} onClick={() => setFormatMode(mode)}>
                    {formatModeNames[mode]}
                </MenuItem>
            );
        }
        return null;
    }
    const scaleModeNames = {
        unScale: "不缩放",
        "fit-width": "适合宽度",
        "fit-height": "适合高度"
    };
    function createScaleMenuItem(mode, currentMode, setMode) {


        return (
            <MenuItem value={mode} onClick={() => setMode(mode)}  >
                {scaleModeNames[mode]}
            </MenuItem>
        );

    }
    return (
        <Wrapper height={canvasHeight + 16}>

            <Grid padding={2} gap={2} alignContent='center' alignItems={'center'} borderBottom={"1px solid rgba(255,255,255,0.1)"} color={"rgba(255,255,255,0.25)"}>
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1200 }} mb={0}  >文件信息</Text>
                {format === "png" && <Grid templateColumns="max-content 1fr" width="100%" alignItems="center" p={1.5}>
                    <Box>文件格式</Box>
                    <Box textAlign="right" lineHeight="normal" ><Badge verticalAlign="middle" p={1.5} color={"#08081E"} background={"brand.bg"}  >PNG</Badge></Box>
                </Grid>}
                {format !== "png" && <AnimationDetails animationInfo={animationInfo} />}
            </Grid>

            <Grid padding={2} gap={0} alignContent='center' borderBottom={"1px solid rgba(255,255,255,0.1)"}>
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1000 }} mb={0} color={"rgba(255,255,255,0.25)"} >基础编辑</Text>

                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>格式转换:</Box>
                    <Spacer />

                    <Menu colorScheme="custom">
                        <MenuButton size='sm' borderRadius={6}>
                            {formatModeNames[formatMode]}
                            <ChevronDownIcon color={"#4DCAFF"} boxSize={6} />
                        </MenuButton>
                        <MenuList minWidth={"120px"}>
                            {createFormatMenuItem("unChange", format, setFormatMode)}
                            {createFormatMenuItem("svga", format, setFormatMode)}
                            {createFormatMenuItem("vap", format, setFormatMode)}
                            {createFormatMenuItem("alphaVideo", format, setFormatMode)}
                            {createFormatMenuItem("webp", format, setFormatMode)}
                            {createFormatMenuItem("apng", format, setFormatMode)}
                            {createFormatMenuItem("gif", format, setFormatMode)}
                            {createFormatMenuItem("sequence", format, setFormatMode)}
                        </MenuList>
                    </Menu>
                </Flex>
                {isContainSize && format !== "png" && <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>动画尺寸:</Box>
                    <Spacer />
                    <CustomNumberInput
                        step={1}
                        defaultValue={width}
                        value={width}
                        min={0}
                        max={3000}
                        precision={0}
                        onChange={(value) => setWidth(value)}
                    />

                    &ensp;X&ensp;

                    <CustomNumberInput
                        step={1}
                        defaultValue={height}
                        value={height}
                        min={1}
                        max={3000}
                        onChange={(value) => setHeight(value)}
                    />
                    &ensp;px
                </Flex>}

                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>内容缩放:</Box>
                    <Spacer />
                    <Menu colorScheme={"custom"} maxWidth={"120px"}>

                        <MenuButton size='sm' borderRadius={6}>
                            {scaleModeNames[scaleMode]}
                            <ChevronDownIcon color={"#4DCAFF"} boxSize={6} />
                        </MenuButton>
                        <MenuList minWidth={"120px"} >
                            {createScaleMenuItem("unScale", scaleMode, setScaleMode)}
                            {createScaleMenuItem("fit-width", scaleMode, setScaleMode)}
                            {createScaleMenuItem("fit-height", scaleMode, setScaleMode)}
                        </MenuList>
                    </Menu>

                </Flex>
                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>压缩比例:</Box>
                    <Spacer />
                    <CustomNumberInput
                        step={1}
                        defaultValue={compressValue}
                        value={compressValue}
                        min={1}
                        max={100}
                        onChange={(value) => setCompressValue(value)}
                    />
                    &ensp;%
                </Flex>
                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>帧率修改:</Box>
                    <Spacer />
                    <CustomNumberInput
                        step={1}
                        defaultValue={framerate}
                        value={framerate}
                        min={1}
                        max={100}
                        onChange={(value) => setFramerate(value)}
                    />
                    &ensp;FPS
                </Flex>
                {isChangImageSize && <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>修改尺寸:</Box>
                    <Spacer />
                    <Switch size='md' onChange={(e) => {
                        setIsResize(e.target.checked)
                    }} />

                </Flex>
                }
                {format === "png" && isResize && <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>修改宽度:</Box>
                    <Spacer />

                    <CustomNumberInput
                        step={1}
                        defaultValue={compressWidth}
                        value={compressWidth}
                        min={1}
                        max={2000}
                        onChange={(value) => setCompressWidth(value)}
                    />

                </Flex>}
            </Grid>
            {isContainAudio &&
                <Grid padding={2} gap={0} alignContent='center' borderBottom={"1px solid rgba(255,255,255,0.1)"}  >
                    <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1000 }} mb={0} color={"rgba(255,255,255,0.25)"}>音频编辑</Text>

                    <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                        <Box w={"80px"}>静音:</Box>
                        <Spacer />
                        <Switch colorScheme='teal' size='md' onChange={(e) => {
                            setIsMute(e.target.checked)
                        }} />

                    </Flex>

                    {!isMute &&
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>替换音效:</Box>
                            <Text></Text>
                            <Spacer />


                            {/* <DeleteIcon mr={2} color="red.500" style={{ cursor: "pointer", display: `${audioFileName !== "" ? "block" : "none"}` }} onClick={() => {
                            setAudioFile(null)
                            setAudioFileName("")
                        }} /> */}
                            <Button size='xs' bg={audioButtonName !== "上传音频文件" ? "#24324a" : "#2D2F42"} color={audioButtonName !== "上传音频文件" ? "#4DCAFF" : "#E1EEFF"} _hover={{ bg: audioButtonName !== "上传音频文件" ? "#24324a" : "#2D2F42" }}>

                                <Flex  >
                                    {audioButtonName}
                                    <img src="assets/rec.svg" style={{ width: 12 }} />
                                </Flex>
                                <Input
                                    type="file"
                                    height="100%"
                                    width="100%"
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    opacity="0"
                                    // aria-hidden="true"
                                    accept=".mp3"  // 只接受 .mp3 文件
                                    onChange={(e) => {
                                        const filePath = e.target.value;
                                        console.log(filePath)
                                        const fileName = getFileNameFromPath(filePath);
                                        setAudioFileName(fileName);
                                        const audioFile = e.target.files[0]
                                        setAudioFile(URL.createObjectURL(audioFile))
                                    }}
                                />

                            </Button>
                        </Flex>
                    }
                    {!isMute &&
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>音量:</Box>
                            <Spacer />

                            <CustomNumberInput
                                step={1}
                                min={1}
                                max={120}
                                value={volume}
                                onChange={value => setVolume(value)}
                            />
                            &ensp;%
                        </Flex>
                    }


                </Grid>}
            <Grid padding={2} gap={0} alignContent='center'>
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1000 }} mb={0} color={"rgba(255,255,255,0.25)"}>时长编辑</Text>

                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>修改时长:</Box>
                    <Spacer />
                    <Switch colorScheme='teal' size='md' onChange={(e) => {
                        setIsChangeDuration(e.target.checked)
                    }} />

                </Flex>
                {isChangeDuration && (
                    <>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>裁切开始:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={0.01}
                                min={0}
                                max={duration}
                                value={cutStartDuration}
                                onChange={value => setCutStartDuration(value)}
                            />
                            &ensp;S
                        </Flex>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80%"}>裁切结尾:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={0.01}
                                min={0}
                                max={duration}
                                value={cutEndDuration}
                                onChange={value => setCutEndDuration(value)}
                            />
                            &ensp;S
                        </Flex>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>整体变速:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={1}
                                min={0}
                                max={100}
                                value={durationSpeed}
                                onChange={value => setDurationSpeed(value)}
                            />
                            &ensp;%
                        </Flex>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>实际时长:</Box>
                            <Spacer />
                            <Box>{acturalDuration.toFixed(2)}</Box>
                            &ensp;S
                        </Flex>
                    </>
                )}
            </Grid>

            <Grid padding={2} gap={0} alignContent='center'>
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1000 }} mb={0} color={"rgba(255,255,255,0.25)"}>虚化编辑</Text>

                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>虚化边缘:</Box>
                    <Spacer />
                    <Switch colorScheme='teal' size='md' onChange={(e) => {
                        setIsMask(e.target.checked)
                    }} />

                </Flex>
                {isMask && (
                    <>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>上边距:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={1}
                                min={0}
                                max={100}
                                value={maskTopDistance}
                                onChange={value => {
                                    setMaskTopDistance(value)
                                    dispatch(changeMaskTopRatio(Number(value)))
                                }}
                            />
                            &ensp;%
                        </Flex>
                        <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80%"}>下边距:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={1}
                                min={0}
                                max={100}
                                value={maskBottomDistance}
                                onChange={value => {
                                    setMaskBottomDistance(value)
                                    dispatch(changeMaskBottomRatio(Number(value)))
                                }}
                            />
                            &ensp;%
                        </Flex>
                        {/* <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                            <Box w={"80px"}>羽化程度:</Box>
                            <Spacer />
                            <CustomNumberInput
                                step={1}
                                min={0}
                                max={100}
                                value={featherDegree}
                                onChange={value => setFeatherDegree(value)}
                            />
                            &ensp;%
                        </Flex> */}
                    </>
                )}
            </Grid>
            {initInnerSize !== 0 && <Grid padding={2} gap={0} alignContent='center'>
                <Text fontSize='small' style={{ textAlign: "left", fontWeight: 1000 }} mb={0} color={"rgba(255,255,255,0.25)"}>头像框编辑</Text>
                <Flex alignContent={'center'} alignItems={'center'} p={1.5}>
                    <Box w={"80px"}>内圈尺寸:</Box>
                    <Spacer />
                    <CustomNumberInput
                        step={1}
                        min={0}
                        max={3000}
                        value={avatarSize}
                        onChange={value => setAvatarSize(value)}
                    />
                    &ensp;PX
                </Flex>
            </Grid>}

            <Flex p={1.5} gap={2}>
                <Box flex="1" onClick={() => {
                    compreeAssets()
                }}
                    className="button"
                    cursor={"pointer"}
                >
                    {isCompress ? "处理中..." : "开始处理"}
                </Box>
            </Flex>
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
 
`