import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const useModal = (props: { isLoading?: boolean }) => {
    const [modalState, setModalState] = useState<{
        component: ((props: any) => React.JSX.Element) | null;
        props: any;
        isOpen: boolean;
    }>({
        component: null,
        props: {},
        isOpen: false
    });

    useEffect(() => {
        let modalContainer = document.getElementById("global-modal-container");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.setAttribute("id", "global-modal-container");
            document.body.appendChild(modalContainer);
        }
    }, []);

    const openModal = <T,>(
        Component: (props: T) => React.JSX.Element,
        props: Omit<T, "isOpen" | "onCancel" | "isLoading">
    ) => {
        setModalState({ component: Component, props, isOpen: true });
    };

    const closeModal = () => {
        setModalState({
            component: null,
            props: {},
            isOpen: false
        });
    };

    const ModalRenderer = modalState.component
        ? createPortal(
            <modalState.component
                {...modalState.props}
                isOpen={modalState.isOpen}
                isLoading={props.isLoading ?? false}
                onCancel={
                    modalState.props.onCancel ? modalState.props.onCancel : closeModal
                }
            />,
            document.getElementById("global-modal-container") as HTMLElement
        )
        : null;

    return {
        openModal,
        closeModal,
        isOpen: modalState.isOpen,
        ModalRenderer
    };
};