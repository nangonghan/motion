
import {
    Input,
    useNumberInput,
} from '@chakra-ui/react'
export const CustomNumberInput = ({ step, defaultValue, min, max, precision, onChange, ...props }) => {
    const { getInputProps } = useNumberInput({ step, defaultValue, min, max, precision, onChange });
    const inputProps = getInputProps();
    return <Input
        {...inputProps}
        {...props}
        textAlign={"center"}
        w={"60px"}
        focusBorderColor="brand.bg"
        size="sm"
        variant={"custom"}
        borderRadius={"md"}
    />;
};