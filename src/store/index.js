import { configureStore } from '@reduxjs/toolkit';
import controlReducer from './reducers/controlSlice';
import { thunk } from 'redux-thunk'; // 更正导入方式

function logger({ ignore }) {
    return (store) => {
        return (next) => (action) => {
            if (process.env.NODE_ENV === 'development' && !ignore.some((it) => action.type.startsWith(it))) {
                console.log(`✉️ [${action.type}]`, action.payload ?? "");
            }
            return next(action);
        };
    };
}


export default configureStore({
    reducer: {
        control: controlReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([
        thunk, // 添加 redux-thunk 中间件
        logger({
            ignore: [], // 可以在这里指定要忽略的 action 类型
        }),
    ]),
});
