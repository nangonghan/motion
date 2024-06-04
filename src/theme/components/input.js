import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const {
    defineMultiStyleConfig
} = createMultiStyleConfigHelpers(["field", "addon"]);

const custom = (props) => ({
    field: {
        border: "1px solid ",
        borderColor: "#0D101E",
        bg: "#0d101e",
        _hover: {
            bg: "##0d101e"
        },
        _focusVisible: {
            zIndex: 1,
            borderColor: "brand.bg",
        }
    },
    addon: {
        // 在这里定义 addon 部分的样式
    }
});

export const inputTheme = defineMultiStyleConfig({
    parts: ["field", "addon"],
    variants: { custom }
});