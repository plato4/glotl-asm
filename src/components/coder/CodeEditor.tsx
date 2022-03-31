import { Container, TextField } from "@mui/material";
import React from "react";

interface CodeEditorProps {
	error: boolean;
	initCode: string;
	updateCode: (code: string) => void;
}
export const CodeEditor: React.FC<CodeEditorProps> = ({ error, initCode, updateCode }) => {
	const localUpdateCode = (code: string) => {
		updateCode(code);
	};

	return (
		<Container sx={{ bgcolor: "background.paper" }}>
			<div className="header">EDITOR</div>
			<Container
				sx={{
					bgcolor: "divider",
					border: "3px dotted",
				}}
			>
				<TextField
					label="Editor"
					id="outlined-multiline-static"
					multiline
					error={error}
					minRows={4}
					maxRows={21}
					color="info"
					sx={{ marginTop: "25px", marginBottom: "15px", width: "100%" }}
					defaultValue={initCode}
					onChange={(event) => localUpdateCode(event.target.value)}
				/>
			</Container>
		</Container>
	);
};
