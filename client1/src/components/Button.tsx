import { Component, JSX } from "solid-js";

interface ButtonProps {
    type?: "button" | "submit" | "reset";
    class?: string;
    onClick?: () => void;
    disabled?: boolean;
    children: string | JSX.Element;
}

const Button: Component<ButtonProps> = ({ type = "button", class: className = "", onClick, disabled = false, children }) => (
    <button type={type} class={`px-4 py-2 bg-zinc-100 text-zinc-900 rounded-sm shadow hover:bg-zinc-700 outline-none ${disabled ? "opacity-70 cursor-not-allowed" : ""} ${className}`} onClick={onClick} disabled={disabled}>
        {children}
    </button>
);

export default Button;
