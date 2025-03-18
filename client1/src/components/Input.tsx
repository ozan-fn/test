import { Component } from "solid-js";

interface InputProps {
    id: string;
    type?: string;
    class?: string;
    placeholder?: string;
    onChange?: (e: Event) => void; // Fungsi callback untuk perubahan nilai
    disabled: boolean;
    value?: string;
}

const Input: Component<InputProps> = ({ id, type = "text", class: className = "", placeholder, onChange, disabled = false, value: nValue = "" }) => (
    <input
        id={id}
        type={type}
        class={`h-10 border border-zinc-700 rounded-sm px-3 bg-zinc-900 outline-none focus:border-zinc-500 ${className}`}
        placeholder={placeholder}
        onInput={onChange} // Gunakan onInput di SolidJS untuk mendeteksi perubahan
        disabled={disabled}
        value={nValue}
    />
);

export default Input;
