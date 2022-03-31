import { createTheme, Grid, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import { lex, LexerStatus, Status } from "../../interpreter";
import Interpreter from "../../interpreter/Interpreter";
import { CodeEditor } from "./CodeEditor";
import "./coder.css";
import { ControlBox } from "./ControlBox";
import { MemoryEditor } from "./MemoryEditor";

const theme = createTheme({
	palette: {
		mode: "dark",
	},
});

const MEM_SIZE = 24;
const interpreter = new Interpreter(MEM_SIZE);

export const Coder: React.FC = () => {
	const [code, setCode] = useState("");
	const [error, setError] = useState(false);
	const [redraws, setRedraws] = useState({});
	const [interpreterStatus, setInterpreterStatus] = useState("OK");
	const [timer, setTimer] = useState(0);

	const step = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		const result = interpreter.step().toString();
		setInterpreterStatus(result);

		switch (result) {
			case Status.SUCCESS.toString():
				setInterpreterStatus("OK");
				break;
			case Status.ERROR.toString():
				setInterpreterStatus("ERROR LINE " + interpreter.getMemory(0));
				clearInterval(timer);
				break;
			case Status.POINTER_OUT_OF_CODE.toString():
				setInterpreterStatus("POINTER OUT OF CODE / OR END OF PROGRAM");
				clearInterval(timer);
				break;
			case Status.UNKNOWN_INSTRUCTION.toString():
				setInterpreterStatus("UNKNOWN INSTRUCTION LINE " + interpreter.getMemory(0));
				clearInterval(timer);
				break;
		}

		setRedraws({});
	};

	const play = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		clearInterval(timer);
		setTimer(setInterval(step, 1));
	};
	const pause = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		clearInterval(timer);
	};
	const reset = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		clearInterval(timer);
		for (let i = 0; i < MEM_SIZE; i++) interpreter.setMemory(i, 0);
		setRedraws({});
		setInterpreterStatus("OK");
	};

	const initCode =
		"// Fibonacci Sequence\n// Memory location 5 and onwards will contain output\n\n// memory locations\n// #2 = array indexer\n// #3 = fib first\n// #4 = fib second\n\nSET #2 5 // initialize array index\nSET #4 1 // initialize first value\n\nLBL 0 // main loop\n\n//calculate fib\nSET >#2 #3 //stage first fib value\nADD >#2 #4 //add current value to it\n\n//step values for next round\nSET #3 #4\nSET #4 >#2\n\n//loop logic\nADD #2 1 // increment indexer\nCMP #2 24 // compare indexer limit\nJLT 0 // if not finished, main loop";

	const updateCode = (code: string) => {
		let r = lex(code);
		if (r.lexerStatus !== LexerStatus.Success) {
			setInterpreterStatus("Lexer Error on line " + r.line);
			setError(true);
		} else {
			setInterpreterStatus("OK");
			setError(false);
		}
		setCode(code);
		interpreter.setInstructions(r.instructions);
	};

	useEffect(() => updateCode(initCode), []);

	return (
		<ThemeProvider theme={theme}>
			<Grid container sx={{ bgcolor: "background.paper", marginTop: "15vh" }} columns={{ xs: 5, md: 12 }}>
				<Grid item xs={7}>
					<MemoryEditor interpreter={interpreter} memSize={MEM_SIZE} />
					<div className="footer">Status: {interpreterStatus}</div>
				</Grid>
				<Grid item xs={5}>
					<CodeEditor error={error} initCode={initCode} updateCode={updateCode}></CodeEditor>
					<ControlBox error={error} play={play} pause={pause} step={step} reset={reset} />
				</Grid>
			</Grid>
		</ThemeProvider>
	);
};
