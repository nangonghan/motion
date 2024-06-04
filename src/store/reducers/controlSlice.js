import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const controlSlice = createSlice({
    name: "control",
    initialState: {
        format: '',
        content: '',
        params: '',
        width: 375,
        height: 812,
        animationInfo: {},
        bgColor: "#0A0B16",
        pngs: [],
        compress_format: '',
        compress_content: '',
        compress_url: '',
        compress_params: '',
        compress_width: 375,
        compress_height: 812,
        compress_animationInfo: {},
        compress_bgColor: "#1B1B2E",
        compress_pngs: [],
        isShowTab: false,
        isChangeToSource: true,
        fileName: "",
        isChangeSvgaToSequence: false,
        svgaZip: null,
        svgaAudioUrl: "",
        svgaInnerSize: 0,
        sequenceParams: {},
        compressServerParams: {},
        maskTopRatio: 0,
        maskBottomRatio: 0,
        token: "",
        recordList: []
    },
    reducers: {
        resetState: (state) => {
            state.svgaInnerSize = 0;
            state.compress_format = "";
            state.compress_content = "";
            state.compress_params = "";
            state.compress_animationInfo = {}
            state.isShowTab = false;
            state.isChangeToSource = true;
            state.sequenceParams = {}
            state.svgaAudioUrl = "";
            state.compressServerParams = {}
            state.maskTopRatio = 0;
            state.maskBottomRatio = 0;
            state.compress_url = "";
        },
        changeFormat: (state, action) => {
            state.format = action.payload;
        },
        changeContent: (state, action) => {
            state.content = action.payload;
        },
        changeParams: (state, action) => {
            state.params = action.payload;
        },
        changeWidth: (state, action) => {
            state.width = action.payload;
        },
        changeHeight: (state, action) => {
            state.height = action.payload;
        },
        changeAnimationInfo: (state, action) => {
            state.animationInfo = action.payload;
        },
        changeBackgroundColor: (state, action) => {
            state.bgColor = action.payload;
        },
        changePngs: (state, action) => {
            state.pngs = action.payload;
        },
        changeCompressFormat: (state, action) => {
            state.compress_format = action.payload;
        },
        changeCompressContent: (state, action) => {
            state.compress_content = action.payload;
        },
        changeCompressParams: (state, action) => {
            state.compress_params = action.payload;
        },
        changeCompressWidth: (state, action) => {
            state.compress_width = action.payload;
        },
        changeCompressHeight: (state, action) => {
            state.compress_height = action.payload;
        },
        changeCompressAnimationInfo: (state, action) => {
            state.compress_animationInfo = action.payload;
        },
        changeCompressBackgroundColor: (state, action) => {
            state.compress_bgColor = action.payload;
        },
        changeCompressPngs: (state, action) => {
            state.compress_pngs = action.payload;
        },
        changeIsShowTab: (state, action) => {
            state.isShowTab = action.payload;
        },
        changeIsChangeToSource: (state, action) => {
            state.isChangeToSource = action.payload;
        },
        changeFileName: (state, action) => {
            state.fileName = action.payload;
        },
        changeIsChangeSvgaToSequence: (state, action) => {
            state.isChangeSvgaToSequence = action.payload;
        },
        changeSvgaZip: (state, action) => {
            state.svgaZip = action.payload;
        },
        changeSvgaAudioUrl: (state, action) => {
            state.svgaAudioUrl = action.payload;
        },
        changeSvgaInnerSize: (state, action) => {
            state.svgaInnerSize = action.payload;
        },
        changeSequenceSize: (state, action) => {
            state.sequenceParams = action.payload;
        },
        changeCompressServerParams: (state, action) => {
            state.compressServerParams = action.payload;
        },
        changeMaskTopRatio: (state, action) => {
            state.maskTopRatio = action.payload;
        },
        changeMaskBottomRatio: (state, action) => {
            state.maskBottomRatio = action.payload;
        },
        changeToken: (state, action) => {
            state.token = action.payload;
        },
        changeRecordList: (state, action) => {
            state.recordList = action.payload;
        },
        changeCompressUrl: (state, action) => {
            state.compress_url = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
    },
});

export const {
    changeFormat,
    changeContent,
    changeParams,
    changeWidth,
    changeHeight,
    changeAnimationInfo,
    changeBackgroundColor,
    changePngs,
    changeCompressUrl,
    changeCompressFormat,
    changeCompressContent,
    changeCompressParams,
    changeCompressWidth,
    changeCompressHeight,
    changeCompressAnimationInfo,
    changeCompressBackgroundColor,
    changeCompressPngs,
    changeIsShowTab,
    changeIsChangeToSource,
    changeFileName,
    changeIsChangeSvgaToSequence,
    changeSvgaZip,
    changeSvgaInnerSize,
    resetState,
    changeSequenceSize,
    changeSvgaAudioUrl,
    changeCompressServerParams,
    changeMaskTopRatio,
    changeMaskBottomRatio,
    changeToken,
    changeRecordList

} = controlSlice.actions;

export const selectFileName = (state) => state.control.fileName
export const selectFormat = (state) => state.control.format
export const selectContent = (state) => state.control.content
export const selectParams = (state) => state.control.params
export const selectWidth = (state) => state.control.width
export const selectHeight = (state) => state.control.height
export const selectAnimationInfo = (state) => state.control.animationInfo
export const selectBgColor = (state) => state.control.bgColor
export const selectPngs = (state) => state.control.pngs
export const selectCompressUrl = (state) => state.control.compress_url
export const selectCompressFormat = (state) => state.control.compress_format;
export const selectCompressContent = (state) => state.control.compress_content;
export const selectCompressParams = (state) => state.control.compress_params;
export const selectCompressWidth = (state) => state.control.compress_width;
export const selectCompressHeight = (state) => state.control.compress_height;
export const selectCompressAnimationInfo = (state) => state.control.compress_animationInfo;
export const selectCompressBgColor = (state) => state.control.compress_bgColor;
export const selectCompressPngs = (state) => state.control.compress_pngs;
export const selectIsShowTab = (state) => state.control.isShowTab;
export const selectIsChangeToSource = (state) => state.control.isChangeToSource;
export const selectIsChangeSvgaToSequence = (state) => state.control.isChangeSvgaToSequence;
export const selectSvgaZip = (state) => state.control.svgaZip;
export const selectSequenceParams = (state) => state.control.sequenceParams;
export const selectSvgaInnerSize = (state) => state.control.svgaInnerSize;
export const selectSequenceSize = (state) => state.control.sequenceParams;
export const selectSvgaAudioUrl = (state) => state.control.svgaAudioUrl;
export const selectCompressServerParams = (state) => state.control.compressServerParams;
export const selectMaskTopRatio = (state) => state.control.maskTopRatio;
export const selectMaskBottomRatio = (state) => state.control.maskBottomRatio;
export const selectToken = (state) => state.control.token;
export const selectRecordList = (state) => state.control.recordList;
export default controlSlice.reducer;