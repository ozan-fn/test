import { Component } from "solid-js";

interface LabelProps {
    class?: string;
    htmlFor: string;
    children: string;
}

const Label: Component<LabelProps> = ({ class: className = "", htmlFor, children }) => (
    <label for={htmlFor} class={`text-sm font-bold ${className}`}>
        {children}
    </label>
);

export default Label;
