import {
    useState,
    useEffect,
    useRef,
} from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import JSZip from "jszip";
import styled from "styled-components";
import { Progress } from "antd";
import { saveAs } from "file-saver";
export default function Lottie(props) {
    // 拖拽上传
    const { url } = props
    console.log(url)
    const [zipUrl, setZipUrl] = useState('')
    const [progress, setProgress] = useState(0)
    const [isLoad, setIsLoad] = useState(false);
    const lottieRef = useRef(null);


    function svgString2Image(base64svg, width, height, format = "png") {
        return new Promise((resolve, reject) => {
            if (!base64svg || !width || !height) {
                reject(new Error('Invalid arguments'));
                return;
            }

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            const image = new Image();

            image.onload = function () {
                context.clearRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                const pngData = canvas.toDataURL("image/" + format);
                resolve(pngData);
            };

            image.onerror = function () {
                reject(new Error('Image loading failed'));
            };

            image.src = base64svg;
        });
    }

    async function getFrameData(frameNum) {
        try {
            lottieRef.current.setSeeker(frameNum, false);

            const source_svg_code = lottieRef.current.container.innerHTML;
            const lottieName = lottieRef.current.state.animationData.nm
            const canvasWidth = lottieRef.current.state.animationData.w;
            const canvasHeight = lottieRef.current.state.animationData.h;
            const base64svg = "data:image/svg+xml;base64," + window.btoa(source_svg_code);

            const base64png = await svgString2Image(base64svg, canvasWidth, canvasHeight);
            // console.log("base64png", base64png)
            const obj = {
                pic: base64png,
                name: lottieName + '_' + frameNum.toString()
            }

            return obj;
        } catch (e) {
            console.error(e)
        }

    }
    async function getPngFramesData() {

        const totalFrames =
            lottieRef.current.state.animationData.op -
            lottieRef.current.state.animationData.ip;
        const framesArr = [];
        console.log(totalFrames)
        for (let i = 0; i <= totalFrames; i++) {
            const progress = (i * 100) / (totalFrames + 1);

            setProgress(Math.round(progress));
            const frameData = await getFrameData(i)

            framesArr.push(frameData);
        }

        return framesArr;
    }
    async function getZipUrl() {

        const framesData = await getPngFramesData();
        const chunkSize = 50;
        let globalIndex = 0;
        const zipPromises = [];

        for (let i = 0; i < framesData.length; i += chunkSize) {
            let zip = new JSZip();
            let img = zip.folder(`xxx_${i / chunkSize}`);
            framesData.slice(i, i + chunkSize).forEach((item) => {
                img.file(`${String(globalIndex++).padStart(8, '0')}.png`, item["pic"].split(',')[1], { base64: true });
            });
            const zipPromise = zip.generateAsync({ type: "blob" }).then(function (content) {
                const zipUrl = URL.createObjectURL(content);
                // saveAs(content, "images_lottie.zip")
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
        if (!isLoad) return
        getZipUrl()
    }, [isLoad])
    return (
        <Wrapper>
            <Progress percent={Math.round(progress, 2)} showInfo={progress === 0 ? false : true} style={{ marginTop: "10px", width: "750px", display: progress === 100 ? "none" : "display" }} />
            <div id="zipUrl">{zipUrl}</div>
            <Player
                ref={lottieRef}

                onEvent={(event) => {
                    if (event === "load") setIsLoad(true);
                }}
                autoplay
                loop={1}
                src={url}
                style={{
                    height: "100%",
                    width: "100%",
                    opacity: 1
                }}
            />
        </Wrapper>
    );
}
const Wrapper = styled.div`
    display: grid;
    place-content: center;
    place-items: center;
    margin-top: 100px;
 
  `;

