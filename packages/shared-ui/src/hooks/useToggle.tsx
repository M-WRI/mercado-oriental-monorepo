import { useState } from "react";

export const useToggle = () => {
    const [isActive, setIsActive] = useState(false);

    const toggle = () => {
        setIsActive(!isActive);
    }

    return { isActive, toggle };
}