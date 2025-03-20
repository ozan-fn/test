export interface Message {
	id?: string;
	status: "success" | "error" | "loading" | "warning";
	message: string;
	delete?: boolean;
}
