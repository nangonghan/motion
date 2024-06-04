// theme/index.js
import { extendTheme } from '@chakra-ui/react'
// Component style overrides
import { inputTheme } from './components/input'
import { switchTheme } from './components/switch'
import { selectTheme } from './components/select'
import { menuTheme } from './components/menu'
const overrides = {

    // colors
    colors: {
        brand: {
            bg: '#00F5B3',
            text: '#fff',
            card: '#0A99FF',
        },
    },
    // Other foundational style overrides go here
    components: {
        Input: inputTheme,
        Switch: switchTheme,
        Select: selectTheme,
        Menu: menuTheme
    },
}
// node_modules/@chakra-ui/theme/dist/components 可以在这里查看所有组件的样式
export default extendTheme(overrides)