import {
    useState,
    useEffect,
    useRef,
} from "react";

import JSZip from "jszip";
import styled from "styled-components";
import { Progress } from "antd";
import { saveAs } from "file-saver";
export default function Pag(props) {
    // 拖拽上传
    const { url } = props
    const [zipUrl, setZipUrl] = useState('')
    const [progress, setProgress] = useState(0)

    const pagRef = useRef(null);

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
                // saveAs(content, "images_pag.zip");
                const zipUrl = URL.createObjectURL(content);
                console.log(zipUrl);
                return { url: zipUrl };
            });
            zipPromises.push(zipPromise);
        }

        Promise.all(zipPromises).then(zipUrlArr => {
            setZipUrl(JSON.stringify(zipUrlArr));
            setProgress(0);
        });
    }
    function pauseOneSecond() {
        // 根据浏览器的性能调整延迟时间
        return new Promise(resolve => setTimeout(resolve, 200));
    }
    async function getFrameData(progress, pagView) {
        try {

            await pagView.setProgress(progress);
            const base64png = pagRef.current.toDataURL("image/png");

            await pagView.flush();
            await pauseOneSecond()
            const obj = {
                pic: base64png,
                name: progress.toString()
            }

            return obj;
        } catch (e) {
            console.error(e)
        }
    }
    async function getPngFramesData(totalFrames, pagView) {
        const framesArr = [];

        for (let i = 0; i <= totalFrames; i++) {
            const progress = i / (totalFrames + 1);

            setProgress(Math.round(progress * 100));
            const frameData = await getFrameData(progress, pagView)

            framesArr.push(frameData);
        }

        return framesArr;
    }
    useEffect(() => {
        let pagView;
        if (!url) return;
        if (!pagRef.current) return;
        async function play(url, pagRef) {
            const PAG = await window.libpag.PAGInit();
            const buffer = await fetch(url).then((response) => response.arrayBuffer());
            const pagFile = await PAG.PAGFile.load(buffer);
            const canvas = pagRef.current;
            canvas.width = pagFile.width()
            canvas.height = pagFile.height()
            pagView = await PAG.PAGView.init(pagFile, canvas, { firstFrame: false });
            const _frameRate = pagView.frameRate
            const _duration = pagFile.duration() / 1000000
            const totalFrames = _duration * _frameRate
            const imageDatas = await getPngFramesData(totalFrames, pagView)
            onDownloadAll(imageDatas)
        }

        play(url, pagRef)


    }, [url, pagRef]);
    return (
        <Wrapper>
            <Progress percent={Math.round(progress, 2)} showInfo={progress === 0 ? false : true} style={{ marginTop: "10px", width: "750px", display: progress === 100 ? "none" : "display" }} />
            <div id="zipUrl">{zipUrl}</div>
            <canvas className="svga-container" ref={pagRef} />
        </Wrapper>
    );
}
const Wrapper = styled.div`
    display: grid;
    place-content: center;
    place-items: center;
    margin-top: 100px;
 
  `;

