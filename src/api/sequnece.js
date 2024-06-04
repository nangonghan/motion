import axios from 'axios'
import { BASE_URL } from "./base"



export async function sequence2Animations(fileUrl, sourceAudioUrl, frameRate, width, height, sequenceParams, compressServerParams) {
    const jsonObj = {}
    jsonObj.fileUrl = fileUrl
    jsonObj.sourceAudioUrl = sourceAudioUrl
    jsonObj.sequenceParams = sequenceParams
    jsonObj.compressServerParams = compressServerParams
    jsonObj.frameRate = frameRate
    jsonObj.width = width
    jsonObj.height = height

    console.time("sequence2Animations")
    const data = await serverRenderAnimations(jsonObj)
    console.timeEnd("sequence2Animations")
    return data.data
}

async function serverRenderAnimations(jsonObj) {
    const url = `${BASE_URL}/common/sequence2Animations`;
    console.log("sequence2Animations: ", jsonObj)
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