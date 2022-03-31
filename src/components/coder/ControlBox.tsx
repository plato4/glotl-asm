import { Button, Container } from "@mui/material";
import React from "react";

interface ControlBoxProps {
	error: boolean;
	play: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	pause: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	step: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	reset: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export const ControlBox: React.FC<ControlBoxProps> = ({ error, play, pause, step, reset }) => {
	return (
		<Container sx={{ marginBottom: "10vh" }}>
			<Button variant="contained" color={error ? "error" : "success"} onClick={(event) => play(event)}>
				PLAY
			</Button>
			<Button variant="contained" color={error ? "error" : "success"} onClick={(event) => pause(event)}>
				PAUSE
			</Button>
			<Button variant="contained" color={error ? "error" : "success"} onClick={(event) => step(event)}>
				STEP
			</Button>
			<Button variant="contained" color={error ? "error" : "primary"} onClick={(event) => reset(event)}>
				RESET
			</Button>
		</Container>
	);
};
