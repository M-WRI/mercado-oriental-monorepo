import { useCallback, useEffect, useState } from "react";

export const useComponentWidth = () => {
    const [componentWidth, setComponentWidth] = useState(0);
    const [node, setNode] = useState<HTMLDivElement | null>(null);

    const componentRef = useCallback((el: HTMLDivElement | null) => {
        setNode(el);
    }, []);

    useEffect(() => {
        if (!node) return;

        const updateWidth = () => {
            setComponentWidth(node.getBoundingClientRect().width);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(node);

        return () => observer.disconnect();
    }, [node]);

    return { componentWidth, componentRef };
}