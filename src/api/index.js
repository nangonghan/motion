
import axios from 'axios'
import { BASE_URL } from "./base"
import { getFileUrl } from "./upload"
function createFormDataFromJSON(jsonData) {
    const formData = new FormData();
    const jsonString = JSON.stringify(jsonData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    formData.append('data', blob, 'data.json');
    return formData;
}

// alphaVideo simplevideo
export async function compress_video({ file, audioFile, isMute, compressValue, vapInfo }) {
    const jsonObj = {}

    const fileUrl = await getFileUrl(file, 'mp4')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.audioUrl = null
    if (!isMute && audioFile) {
        const audioUrl = await getFileUrl(audioFile, 'mp3')
        jsonObj.audioUrl = audioUrl
    }

    jsonObj.isMute = isMute
    jsonObj.compressValue = compressValue
    jsonObj.vapInfo = vapInfo
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, "renderVideo")
    return data
}

// svga 
export async function compress_svga({ file, audioFile, isMute, compressValue, new_width, new_height, scaleRatio, volume }) {
    const jsonObj = {}

    const fileUrl = await getFileUrl(file, 'svga')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.audioUrl = null
    if (!isMute && audioFile) {
        const audioUrl = await getFileUrl(audioFile, 'mp3')
        jsonObj.audioUrl = audioUrl
    }

    jsonObj.isMute = isMute
    jsonObj.compressValue = compressValue
    jsonObj.width = new_width
    jsonObj.height = new_height
    jsonObj.scaleRatio = scaleRatio
    jsonObj.volume = volume
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, "renderSVGA")
    return data
}
// lottie 
export async function compress_lottie({ file, compressValue }) {
    const jsonObj = {}

    const fileUrl = await getFileUrl(file, 'json')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.compressValue = compressValue
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, 'renderLottie')
    return data
}
// webp 
export async function compress_webp({ file, compressValue }) {
    const jsonObj = {}
    const fileUrl = await getFileUrl(file, 'webp')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.compressValue = compressValue
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, 'renderWebP')
    return data
}
// apng 
export async function compress_apng({ file, compressValue }) {
    const jsonObj = {}
    const fileUrl = await getFileUrl(file, 'png')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.compressValue = compressValue
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, 'renderApng')
    return data
}
// gif 
export async function compress_gif({ file, compressValue }) {
    const jsonObj = {}
    const fileUrl = await getFileUrl(file, 'gif')
    console.log("fileUrl", fileUrl)
    jsonObj.fileUrl = fileUrl
    jsonObj.compressValue = compressValue
    console.log(jsonObj)
    const data = await getCompressedFileUrl(jsonObj, 'renderGIF')
    return data
}
// pngs
function resizeImage(base64, newWidth) {
    return new Promise((resolve, reject) => {
        // Create an image element
        let img = document.createElement('img');
        img.src = base64;

        img.onload = function () {
            // Create a canvas and a context
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            // Calculate the new height to keep the aspect ratio
            let ratio = img.height / img.width;
            let newHeight = newWidth * ratio;

            // Set the canvas dimensions
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Get the new base64 string
            let newBase64 = canvas.toDataURL('image/png');

            resolve(newBase64);
        };

        img.onerror = function () {
            reject(new Error('Failed to load image'));
        };
    });
}
export async function compress_pngs({ pngDatas, compressValue, compressWidth, isResize }) {
    const newPngDatas = [];
    for (const item of pngDatas) {
        const jsonObj = {}
        const newSizedBase64 = await resizeImage(item, compressWidth)
        const base64 = isResize ? newSizedBase64 : item
        const fileUrl = await getFileUrl(base64, 'png')

        jsonObj.fileUrl = fileUrl
        jsonObj.compressValue = compressValue
        const data = await getCompressedFileUrl(jsonObj, 'renderPng')

        newPngDatas.push(data.data);
    }
    return newPngDatas;
}

async function getCompressedFileUrl(jsonObj, location) {
    const url = `${BASE_URL}/common/${location}`;

    try {
        // 发送POST请求
        const response = await axios.post(url, JSON.stringify(jsonObj), {
            headers: {
                'Content-Type': 'application/json' // 设置请求头的Content-Type为multipart/form-data
            }
        });
        // 处理响应
        return response.data
    } catch (error) {
        // 处理错误
        console.error(error);
    }
}
