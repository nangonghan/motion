import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(menuAnatomy.keys)

// define the base component styles
const baseStyle = definePartsStyle({
    // define the part you're going to style
    button: {
        // this will style the MenuButton component
        fontSize: 'sm',
        bg: '#0D101E',
        color: 'gray.200',
        paddingTop: "1",
        paddingLeft: "3",
        paddingRight: "1",
        border: "1px solid #0D101E",
        _hover: {
            borderColor: 'white',
        },
    },
    list: {
        // this will style the MenuList component
        py: '4',
        borderRadius: 'xl',
        border: 'none',
        bg: '#0D101E',
    },
    item: {
        // this will style the MenuItem and MenuItemOption components
        color: 'gray.200',
        bg: '#0D101E',
        _hover: {
            bg: '#1A1D31',
        },
        _focus: {
            bg: '#0D101E',
        },
    },
    groupTitle: {
        // this will style the text defined by the title prop
        // in the MenuGroup and MenuOptionGroup components
        textTransform: 'uppercase',
        color: 'white',
        textAlign: 'center',
        letterSpacing: 'wider',
        opacity: '0.7',
    },
    command: {
        // this will style the text defined by the command
        // prop in the MenuItem and MenuItemOption components
        opacity: '0.8',
        fontFamily: 'mono',
        fontSize: 'sm',
        letterSpacing: 'tighter',
        pl: '4',
    },
    divider: {
        // this will style the MenuDivider component
        my: '4',
        borderColor: 'white',
        borderBottom: '2px dotted',
    },
})
// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle })