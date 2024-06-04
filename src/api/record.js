import axios from 'axios'


export async function getRecordList(token, page, limit) {
    var config = {
        method: 'get',
        url: `https://17ae.com/compress_records?page=${page}&limit=${limit}`,
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },

    };

    return axios(config)

}


export async function postRecord(token, data) {
    console.log(data)
    var config = {
        method: 'POST',
        url: 'https://17ae.com/compress_push_data',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        data: data
    };

    return axios(config)

}
