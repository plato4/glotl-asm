import Interpreter from "../../interpreter/Interpreter";
import { Container, TextField } from "@mui/material";

interface MemoryEditorProps {
	interpreter: Interpreter;
	memSize: number;
}

export const MemoryEditor: React.FC<MemoryEditorProps> = ({ interpreter, memSize }) => {
	const memBlocks = [];
	for (let i = 0; i < memSize; i++)
		memBlocks.push(
			<TextField
				sx={{ margin: "1px", width: "30%" }}
				id="outlined-basic"
				label={["MEMORY 0 - POINTER REGISTER", "MEMORY 1 - RESULT REGISTER", "MEMORY " + i][Math.min(i, 2)]}
				variant="outlined"
				key={i}
				value={interpreter.getMemory(i)}
			/>
		);
	return (
		<Container>
			<div className="header">CPU</div>
			<Container
				sx={{
					bgcolor: "divider",
					border: "3px dotted",
					minHeight: "35rem",
				}}
			>
				<Container sx={{ margin: "3%" }}>{memBlocks}</Container>
			</Container>
		</Container>
	);
};
