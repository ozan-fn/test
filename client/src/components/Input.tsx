import { Component, JSX } from "solid-js";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

const Input: Component<InputProps> = (props) => (
    <input
        {...props}
        class={`h-10 border border-zinc-700 rounded-sm px-3 bg-zinc-900 outline-none focus:border-zinc-500 ${props.class || ""}`}
    />
);

export default Input;
