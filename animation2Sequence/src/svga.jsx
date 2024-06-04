import {
    useState,
    useEffect,
    useRef,
} from "react";
import { Parser, Player, Downloader } from 'svga.lite'
import JSZip from "jszip";
import styled from "styled-components";
import { saveAs } from "file-saver";
import { Progress } from "antd";
export default function SVGA(props) {
    // 拖拽上传
    const { url } = props
    const [zipUrl, setZipUrl] = useState('')
    const [progress, setProgress] = useState(0)

    const svgaRef = useRef(null);

    function onDownloadAll(imgarr) {
        const chunkSize = 50;
        let globalIndex = 0;
        const zipPromises = [];

        for (let i = 0; i < imgarr.length; i += chunkSize) {
            let zip = new JSZip();
            let img = zip.folder(`xxx_${i / chunkSize}`);
            imgarr.slice(i, i + chunkSize).forEach((item) => {
                img.file(`${String(globalIndex++).padStart(8, '0')}.png`, item["pic"].split(',')[1], { base64: true });
            });
            const zipPromise = zip.generateAsync({ type: "blob" }).then(function (content) {
                const zipUrl = URL.createObjectURL(content);
                console.log(zipUrl);
                // saveAs(content, "images.zip");
                return { url: zipUrl };
            });
            zipPromises.push(zipPromise);
        }

        Promise.all(zipPromises).then(zipUrlArr => {
            setZipUrl(JSON.stringify(zipUrlArr));
            setProgress(0);
        });
    }

    useEffect(() => {
        if (!url) return
        const downloader = new Downloader()
        const context = svgaRef.current.getContext('2d');
        // 绘制填充了背景颜色的矩形
        context.fillStyle = 'black';
        context.fillRect(0, 0, svgaRef.current.width, svgaRef.current.height);
        // 默认调用 WebWorker 解析，可配置 new Parser({ disableWorker: true }) 禁止
        const parser = new Parser({ disableWorker: true })
        const player = new Player(svgaRef.current)
            ; (async () => {
                let fileData
                try {
                    fileData = await downloader.get(url)
                } catch (error) {
                    return
                }
                const svgaData = await parser.do(fileData)
                player.set({
                    loop: 1,
                    fillMode: 'clear'
                })
                await player.mount(svgaData)
                // 获取信息
                console.log(svgaData)
                const currentFPS = svgaData.FPS
                svgaData.FPS = currentFPS - 5 // 降低播放速度，给生成序列帧时间
                player.start()
                const imgarr = []
                player
                    .$on('pause', () => {
                        console.log('pause')
                    })
                    .$on('stop', () => {
                        console.log('stop')
                    })
                    .$on('end', () => {
                        setProgress(100)
                    })
                    .$on('clear', () => {
                        console.log('clear')
                    })
                    .$on('process', (e) => {
                        setProgress(player.progress)
                        imgarr.push({
                            key: imgarr.length,
                            name: `img_${imgarr.length}`,
                            pic: svgaRef.current.toDataURL("image/jpg")
                        })
                        if (player.progress === 100) {
                            onDownloadAll(imgarr)
                        }
                    });
            })()
        return () => {
            if (!player) { return }
            player.destroy()
            downloader.destroy()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])
    return (
        <Wrapper>
            <Progress percent={Math.round(progress, 2)} showInfo={progress === 0 ? false : true} style={{ marginTop: "10px", width: "750px", display: progress === 100 ? "none" : "display" }} />
            <div id="zipUrl">{zipUrl}</div>
            <canvas className="svga-container" ref={svgaRef} />
        </Wrapper>
    );
}
const Wrapper = styled.div`
    display: grid;
    place-content: center;
    place-items: center;
    margin-top: 100px;
 
  `;

