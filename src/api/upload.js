import axios from 'axios';
async function blobUrlToFormData(blobUrl, extension) {
    // 获取 Blob 对象
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    // 创建 FormData 对象并添加 Blob 对象
    const formData = new FormData();
    formData.append("file", blob, `xxx.${extension}`);

    return formData;
}

export async function getFileUrl(blobUrl, extension) {

    const formData = await blobUrlToFormData(blobUrl, extension)
    // 将文件添加到FormData对象中


    const api_url = process.env.NODE_ENV === 'production' ? 'https://eff-tools.17ae.com/upload_xfile' : 'https://eff-tools.17ae.com/upload_compress_file'
    try {
        // 发送POST请求
        const response = await axios.post(api_url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // 设置请求头的Content-Type为multipart/form-data
            }
        });

        // 处理响应 
        return response.data.data.url
    } catch (error) {
        // 处理错误
        console.error(error);
    }
}
