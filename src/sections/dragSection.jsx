import styled from "@emotion/styled";
import { useDispatch } from 'react-redux';
import { useDropzone } from "react-dropzone";
import { useCallback, } from "react";
import {
    changeFormat,
    changeContent,
    changeParams,
    changeAnimationInfo,
    changePngs,
    changeIsShowTab,
    changeIsChangeToSource,
    changeFileName,
    resetState
} from "../store/reducers/controlSlice"
import {
    useToast, Badge, Text, Grid, Flex
} from '@chakra-ui/react'
import { getValidFileContent, getImageFormat } from "../helpers/fileFormat"
function DragSection(props) {
    const { isFullScreen } = props
    const toast = useToast()
    const dispatch = useDispatch();
    function isValidFileExtension(filename, fileExtension) {
        const supportFileExtensions = [
            ".mp4",
            ".svga",
            ".webp",
            ".png",
            ".gif",
            ".json",
            ".pag"
        ];

        return supportFileExtensions.includes(fileExtension);
    }

    function identifyObject(obj) {
        if (obj instanceof File) {
            return 'File';
        } else if (obj instanceof Blob) {
            return 'Blob';
        } else {
            return 'Other';
        }
    }
    function createObjectLink(content) {
        const objectType = identifyObject(content)
        if (objectType === "Other") {
            return content
        } else {
            return URL.createObjectURL(content)
        }
    }
    function createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version, frameRate) {
        const infoObject = {};

        if (format) infoObject.format = format;

        if (fileSize) infoObject.fileSize = fileSize;
        if (memoryUsage) infoObject.memoryUsage = parseFloat(memoryUsage);
        if (duration) infoObject.duration = parseFloat(duration);
        if (dimensions) infoObject.dimensions = dimensions;
        if (version) infoObject.version = version;
        if (frameRate) infoObject.frameRate = frameRate;

        return infoObject;
    }
    async function isAllPngs(files) {
        let condition = true;
        for (let file of files) {
            try {
                const format = await getImageFormat(file);
                if (format !== 'png') {
                    condition = false
                }
            } catch (error) {

                condition = false
            }
        }
        return condition;
    }
    const onDrop = useCallback(async (acceptedFiles) => {
        const isAllPng = await isAllPngs(acceptedFiles)

        if (isAllPng) {
            const pngs = acceptedFiles.map((file) => {
                return new Promise((resolve, reject) => {
                    const formData = new FormData();
                    formData.append("files", file);
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        const content = reader.result;
                        resolve(createObjectLink(content));
                    };
                    reader.onerror = function () {
                        reject(new Error("Failed to read file"));
                    };
                });
            });
            Promise.all(pngs).then((links) => {

                dispatch(changePngs(links));
                dispatch(changeFormat("png"));
                dispatch(changeIsShowTab(false))
                dispatch(changeIsChangeToSource(true))
            }).catch((error) => {
                console.error(error);
            });
        } else {
            acceptedFiles.forEach(async (file) => {
                const formData = new FormData();
                formData.append("files", file);
                const reader = new FileReader();
                reader.readAsText(file);
                console.log(file)
                const fileName = file.name;
                const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
                const isValidExtension = isValidFileExtension(fileName, fileExtension)
                const pureFileName = fileName.split('.').slice(0, -1).join('.');

                if (!isValidExtension) {
                    toast({
                        title: '无效的格式',
                        description: "暂时不支持该格式",
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    })
                    return;
                }

                const { format, content, params, fileSize, memoryUsage, duration, dimensions, version, frameRate } = await getValidFileContent(fileExtension, file)
                if (format === "") {
                    toast({
                        title: '无效的格式',
                        description: "暂时不支持该格式",
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    })
                    return;
                }
                const animateInfo = createAnimateInfo(format, fileSize, memoryUsage, duration, dimensions, version, frameRate)
                dispatch(changeAnimationInfo({}))
                dispatch(changeFileName(pureFileName))
                dispatch(changeAnimationInfo(animateInfo))
                dispatch(changeFormat(format));
                dispatch(changeContent(createObjectLink(content)));
                dispatch(changeParams(params));
                // init store

                dispatch(resetState())

            });
        }

    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
    });

    return (
        <Wrapper>
            {!isFullScreen && <Grid justifyContent={"center"} justifyItems={"center"} mb={50}>
                <img src="assets/logo.svg" style={{ marginBottom: 45, width: 136 }} />
                <img src="assets/title.svg" style={{ marginBottom: 20, width: 400 }} />
                <Text fontSize={20} fontWeight={400} color={"#C3DEFF"} opacity={0.3}>支持处理 SVGA、VAP、双通道、WebP、APNG、GIF 等文件的预览和压缩</Text>
            </Grid>}

            <ContentWrapper isFullScreen={isFullScreen}>
                <div {...getRootProps()} className="container">
                    <input {...getInputProps()} />
                    <img src="assets/upload.svg" style={{ width: 328 }} />
                    <Text fontSize={16} fontWeight={600} color={"#C3DEFF"} opacity={0.3} mt={"20px"}>拖拽文件到此处 或 点击上传</Text>
                </div>
            </ContentWrapper>
        </Wrapper >
    );
}
const Wrapper = styled.div`
 
  
 display: grid;
 place-content: center;
`;
const ContentWrapper = styled.div`
 
  border-radius: 20px;
  overflow: hidden;
  .container{
    width: ${props => props.isFullScreen ? 'calc(100vw - 80px)' : '1060px'};
    height: ${props => props.isFullScreen ? 'calc(100vh - 80px)' : '290px'};
    background:rgba(45,48,78,0.2);
    border: 2px solid rgba(42,46,69,0.24);
    color:rgba(255,255,255,0.6);
    display: grid;
    place-content: center;
    place-items: center;
    text-align: center;
    border-radius: 20px;
  overflow: hidden;
  };
  .upload{
    padding: 22px 100px;
     background: linear-gradient(180deg, #127FFF 0%, #3BADFF 100%);
     border-radius: 16px;
     border: 2px solid rgba(154,208,255,0.30);
  }
`;
export default DragSection;
