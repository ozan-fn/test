import { Component, JSX } from "solid-js";

interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: Component<LabelProps> = (props) => (
	<label {...props} class={`text-sm font-bold ${props.class || ""}`}>
		{props.children}
	</label>
);

export default Label;
