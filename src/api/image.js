import axios from 'axios'
import { BASE_URL } from "./base"



export async function getAnimatedImageInfo(jsonObj, location) {
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
