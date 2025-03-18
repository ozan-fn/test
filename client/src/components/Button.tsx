import { Component, JSX } from "solid-js";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: Component<ButtonProps> = (props) => {
    return (
        <button
            {...props}
            class={`px-4 py-2 bg-zinc-100 text-zinc-900 rounded-sm shadow hover:bg-zinc-700 outline-none 
                ${props.disabled ? "opacity-90 cursor-not-allowed" : ""} ${props.class || ""}`}
        >
            {props.children}
        </button>
    );
};

export default Button;