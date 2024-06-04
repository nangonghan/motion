import { selectAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(selectAnatomy.keys)

const baseStyle = definePartsStyle({
    // define the part you're going to style
    field: {
        border: '1px solid',
        background: '#0D101E',
        color: '#fff',

    },
    icon: {
        color: '#4DCAFF',
    },

})

export const selectTheme = defineMultiStyleConfig({ baseStyle })