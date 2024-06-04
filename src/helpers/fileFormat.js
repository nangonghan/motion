import SVGA from "svgaplayerweb";

import { getFileUrl } from "../api/upload";
import { getAnimatedImageInfo } from "../api/image";
function readVideoFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(new Uint8Array(event.target.result));
        };
        reader.onerror = (event) => {
            reject(new Error("Error reading file."));
        };
        reader.readAsArrayBuffer(file);
    });
}
function readStringFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = (event) => {
            reject(new Error("Error reading file."));
        };
        reader.readAsText(file);
    });
}

function findVAPCBox(buffer) {
    let offset = 0;
    while (offset < buffer.length - 8) {
        const boxSize = (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
        const boxType = new TextDecoder('ascii').decode(buffer.subarray(offset + 4, offset + 8));
        if (boxType === 'vapc') {
            return buffer.subarray(offset, offset + boxSize);
        }
        offset += boxSize;
    }
    return null;
}
async function getValidVapOrDoubleChannelInfo(fileContent) {
    const fileBuffer = await readVideoFile(fileContent);
    const vapcBox = findVAPCBox(fileBuffer);
    const { duration } = await getVideoDimensionsAndDuration(fileContent)

    if (!vapcBox) {
        return { _format: "", _content: "", _params: "", _dimensions: "", _version: "", _duration: "", _frameRate: "" }

    }
    const vapcData = vapcBox.slice(8); // Exclude the 8-byte box header
    const json = new TextDecoder('utf-8').decode(vapcData);

    try {
        // 尝试解析输入字符串为 JSON 对象
        const jsonObject = JSON.parse(json);

        if (jsonObject.info) {
            if (jsonObject.info.v) {
                return { _format: "vap", _content: fileContent, _params: jsonObject, _dimensions: `${jsonObject.info.w} px - ${jsonObject.info.h} px`, _version: jsonObject.info.v, _duration: duration, _frameRate: jsonObject.info.fps }
            } else {
                // 其他情况，返回整个 JSON 对象
                return { _format: "alphaVideo", _content: fileContent, _params: jsonObject, _dimensions: `${jsonObject.info.w} px - ${jsonObject.info.h} px`, _version: "", _duration: duration, _frameRate: jsonObject.info.fps }
            }
        }
    } catch (error) {
        console.log(error)

    }
    return { _format: "", _content: "", _params: "", _dimensions: "", _version: "", _duration: "", _frameRate: "" }

}
async function getValidLottieInfo(fileContent) {

    const json = await readStringFile(fileContent)
    const defaultObj = {
        _format: '', _content: '', _version: '', _dimensions: '', _duration: "", _frameRate: ""
    }
    try {
        const jsonObj = JSON.parse(json)
        const requiredKeys = ['v', 'fr', 'ip', 'op', 'w', 'h', 'layers'];
        const isValidLottie = requiredKeys.every(key => key in jsonObj);
        if (isValidLottie) {
            const totalFrames = jsonObj.op - jsonObj.ip; // 总帧数
            const frameRate = jsonObj.fr; // 帧速率 (FPS)

            // 时长（秒） = 总帧数 / 帧速率
            const durationInSeconds = totalFrames / frameRate;
            return { _format: 'lottie', _content: fileContent, _version: jsonObj.v, _dimensions: `${jsonObj.w} px - ${jsonObj.h} px`, _duration: formatDuration(durationInSeconds), _frameRate: frameRate }
        } else {
            return defaultObj
        }
    } catch (error) {
        console.error(error)
        return defaultObj
    }

}

function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = new Image();

                img.onload = function () {
                    const width = img.width;
                    const height = img.height;
                    resolve(`${width} px - ${height} px`);
                };

                img.onerror = function () {
                    resolve("-");
                };

                img.src = e.target.result;
            };

            reader.onerror = function () {
                resolve("-");
            };

            reader.readAsDataURL(file);
        } else {
            reject(new Error('File is not an image'));
        }
    });
}
export function getImageFormat(file) {
    return new Promise((resolve, reject) => {
        if (file && file.type.startsWith('image/png')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const arrayBuffer = event.target.result;
                const dataView = new DataView(arrayBuffer);
                // 检查APNG的签名 "acTL"
                // PNG文件签名的长度为8字节
                let offset = 8;

                // 遍历文件块以查找acTL块
                let hasACTL = false;
                while (offset < dataView.byteLength) {
                    const length = dataView.getUint32(offset);
                    const type = dataView.getUint32(offset + 4, false); // 读取块类型

                    // "acTL"块的十六进制表示为0x6163544C
                    if (type === 0x6163544C) {
                        hasACTL = true;
                        break;
                    }

                    // 移动到下一个块。块总长度 = 长度字段（4字节） + 类型字段（4字节） + 数据长度 + CRC（4字节）
                    offset += 12 + length;
                }

                // const format = hasACTL ? "apng" : 'png'
                const format = hasACTL ? "apng" : ""
                resolve(format);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        } else {
            reject();
        }
    })
}
function getVideoDimensionsAndDuration(file) {
    return new Promise((resolve, reject) => {
        if (file && file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.style.display = 'none'; // 隐藏视频元素

            // place a listener on it
            video.addEventListener("loadedmetadata", function () {
                // retrieve dimensions
                const height = this.videoHeight;
                const width = this.videoWidth;
                const duration = formatDuration(this.duration);
                video.remove();
                // send back result
                resolve({ height, width, duration });
            }, false);

            video.onerror = function () {
                video.remove();
                URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video'));
            };

            video.src = URL.createObjectURL(file);
            video.preload = 'metadata';
            document.body.appendChild(video); // 将视频元素添加到 DOM
        } else {
            reject(new Error('File is not a video'));
        }
    });
}
function formatDuration(value) {
    return `${value.toFixed(2)}`
}

async function getMemoryUsageFromSVGAImageObject(imageObject) {
    // 检查对象是否为空
    if (Object.keys(imageObject).length === 0) {
        return 0;
    }
    const loadImageMemoryUsage = (base64Image) => {

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                const width = img.width;
                const height = img.height;
                const bytes = width * height * 4; // 每像素4字节
                const kilobytes = bytes;

                resolve(kilobytes);
            };

            img.onerror = function () {
                resolve(0);
                // reject(new Error('Failed to load image'));
            };

            const base64Prefix = 'data:image/png;base64,';
            img.src = `${base64Prefix}${base64Image}`;
        });
    };
    let totalMemoryUsage = 0;

    const imageEntries = Object.entries(imageObject);
    for (const [, base64Image] of imageEntries) {
        const memoryUsage = await loadImageMemoryUsage(base64Image);
        totalMemoryUsage += memoryUsage;
    }

    return `${totalMemoryUsage.toFixed(2)}`;
}
async function getSvgaInfo(file) {
    let svga;
    const defaultObj = { _version: null, _dimensions: null, _duration: null, _memoryUsage: null, _frameRate: null }
    try {
        svga = document.createElement('div');
        svga.id = 'svgaDemo';
        document.body.appendChild(svga);

        const parser = new SVGA.Parser(svga);

        const videoItem = await new Promise((resolve, reject) => {
            parser.load(URL.createObjectURL(file), function (videoItem) {
                resolve(videoItem);
            }, function (error) {
                console.error(error);
                reject(null);
            });
        });

        if (!videoItem) return defaultObj;
        const _frameRate = videoItem.FPS
        const _version = videoItem.version;
        const _width = videoItem.videoSize.width;
        const _height = videoItem.videoSize.height;
        const _dimensions = `${_width} px - ${_height} px`;
        const _duration = formatDuration(videoItem.frames / videoItem.FPS);
        const _memoryUsage = await getMemoryUsageFromSVGAImageObject(videoItem.images);
        svga.remove();
        return { _version, _dimensions, _duration, _memoryUsage, _frameRate };
    } catch (e) {
        console.error(e);
        if (svga) svga.remove();
        return defaultObj;
    }
}
async function getPagInfo(file) {
    const defaultObj = { _version: null, _dimensions: null, _duration: null, _memoryUsage: null, _frameRate: null }
    const url = URL.createObjectURL(file);
    let pag;
    try {
        const PAG = await window.libpag.PAGInit();
        // 获取 PAG 素材数据
        const buffer = await fetch(url).then((response) => response.arrayBuffer());
        // 加载 PAG 素材为 PAGFile 对象
        const pagFile = await PAG.PAGFile.load(buffer);
        console.log("pagFile", pagFile)
        // 将画布尺寸设置为 PAGFile的尺寸
        pag = createCanvasElement();
        const canvas = pag
        canvas.width = pagFile.width();
        canvas.height = pagFile.height();


        // 实例化 PAGView 对象
        const pagView = await PAG.PAGView.init(pagFile, canvas);

        const _frameRate = pagView.frameRate
        const _dimensions = `${pagFile.width()} px - ${pagFile.height()} px`;
        const _version = PAG.SDKVersion();
        const _duration = formatDuration(pagFile.duration() / 1000000);
        return { _dimensions, _frameRate, _version, _duration };
    } catch (e) {
        console.error(e);
        if (pag) pag.remove();
        return defaultObj;
    } finally {
        URL.revokeObjectURL(url)
        if (pag) pag.remove();
    }
}

function createCanvasElement() {
    const pag = document.createElement('canvas');
    pag.id = 'pagDemo';
    document.body.appendChild(pag);
    return pag;
}

async function fetchFileBuffer(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
}

function setCanvasDimensions(canvas, pagFile) {
    canvas.width = pagFile.width();
    canvas.height = pagFile.height();
}
async function get_webP_duration_framerate(file) {

    const blobUrl = URL.createObjectURL(file)
    const fileUrl = await getFileUrl(blobUrl, 'webp')

    // info
    const webpInfo = await getAnimatedImageInfo({ fileUrl }, 'getWebPInfo')

    try {
        const { frameDuration, numberOfFrames } = webpInfo.data
        const duration = frameDuration * numberOfFrames / 1000
        const frameRate = parseInt(1000 / frameDuration)

        return { _duration: duration, _frameRate: frameRate }
    } catch (e) {
        console.error(e)
        return { _duration: null, _frameRate: null }
    }


}


async function get_apng_duration_framerate(file) {
    const format = await getImageFormat(file)
    if (format !== 'apng') return { _duration: null, _frameRate: null }

    const blobUrl = URL.createObjectURL(file)
    const fileUrl = await getFileUrl(blobUrl, 'apng')

    // info
    const apngInfo = await getAnimatedImageInfo({ fileUrl }, 'getApngInfo')

    try {
        const { frameDuration, numberOfFrames } = apngInfo.data

        const duration = frameDuration * numberOfFrames / 1000
        const frameRate = parseInt(1000 / frameDuration)

        return { _duration: duration, _frameRate: frameRate }
    } catch (e) {
        console.error(e)
        return { _duration: null, _frameRate: null }
    }
}
async function get_gif_duration_framerate(file) {

    const blobUrl = URL.createObjectURL(file)
    const fileUrl = await getFileUrl(blobUrl, 'gif')

    // info
    const gifInfo = await getAnimatedImageInfo({ fileUrl }, 'getGifInfo')
    console.log(gifInfo.data)
    try {
        const { frameDuration, numberOfFrames } = gifInfo.data

        const duration = frameDuration * numberOfFrames / 1000
        const frameRate = Math.round(1000 / frameDuration)
        console.log("duration", duration)
        return { _duration: Math.round(duration * 100) / 100, _frameRate: frameRate }
    } catch (e) {
        console.error(e)
        return { _duration: null, _frameRate: null }
    }
}
export async function getValidFileContent(fileFormat, file) {

    let format = '';
    let content = '';
    let params = '';
    const fileSize = file.size;
    let memoryUsage
    let duration;
    let dimensions;
    let version;
    let frameRate

    let _format, _content, _params, _version, _dimensions, _duration, _memoryUsage, _frameRate;
    switch (fileFormat) {
        case '.mp4':
            ({ _format, _content, _params, _dimensions, _version, _duration, _frameRate } = await getValidVapOrDoubleChannelInfo(file));

            format = _format;
            content = _content;
            params = _params;
            dimensions = _dimensions;
            version = _version;
            duration = _duration
            frameRate = _frameRate
            break;
        case '.json':
            ({ _format, _content, _version, _dimensions, _duration, _frameRate } = await getValidLottieInfo(file));
            format = _format
            content = _content
            version = _version
            dimensions = _dimensions
            duration = _duration
            frameRate = _frameRate
            break;
        case '.svga':
            ({ _version, _dimensions, _duration, _memoryUsage, _frameRate } = await getSvgaInfo(file));
            format = 'svga'
            content = file
            version = _version
            dimensions = _dimensions
            duration = _duration
            memoryUsage = _memoryUsage
            frameRate = _frameRate
            break;
        case '.pag':
            ({ _version, _dimensions, _duration, _memoryUsage, _frameRate } = await getPagInfo(file));
            format = 'pag'
            content = file
            version = _version
            dimensions = _dimensions
            duration = _duration
            memoryUsage = _memoryUsage
            frameRate = _frameRate
            break;
        case '.gif':
            ({ _duration, _frameRate } = await get_gif_duration_framerate(file))
            format = 'gif'
            content = file
            dimensions = await getImageDimensions(file)
            duration = _duration
            frameRate = _frameRate
            break;
        case '.png':
            ({ _duration, _frameRate } = await get_apng_duration_framerate(file))
            format = await getImageFormat(file)
            content = file
            dimensions = await getImageDimensions(file)
            duration = _duration
            frameRate = _frameRate
            break;
        case '.webp':
            ({ _duration, _frameRate } = await get_webP_duration_framerate(file))
            format = 'webp'
            content = file
            duration = _duration
            frameRate = _frameRate
            dimensions = await getImageDimensions(file)

            break;

        default:
            break;
    }
    return {
        format, content, params, fileSize: parseFloat(fileSize), memoryUsage: parseFloat(memoryUsage), duration: parseFloat(duration), dimensions, version, frameRate: parseFloat(frameRate)
    }
}
