import { OperatorType, ParamType } from "./Enums";

export enum Status {
	SUCCESS,
	ERROR,
	POINTER_OUT_OF_CODE,
	UNKNOWN_INSTRUCTION,
}

enum Comparison {
	ET,
	GT,
	LT,
}

type Memory = Array<number>;
type Instruction = number[];
type Instructions = Instruction[];

export default class Interpreter {
	private memory: Memory;
	private instructions?: Instructions;
	private comparison: Comparison = Comparison.ET;

	private readonly P_REGISTER = 0;
	private readonly R_REGISTER = 1;
	private readonly OPER = 0;
	private readonly PARAM1_TYPE = 1;
	private readonly PARAM1_VAL = 2;
	private readonly PARAM2_TYPE = 3;
	private readonly PARAM2_VAL = 4;

	constructor(memorySize = 5) {
		this.memory = new Array<number>();
		for (let i = 0; i < memorySize; i++) {
			this.memory.push(0);
		}
	}

	public step = (): Status => {
		if (!this.instructions) return Status.SUCCESS;
		if (this.memory[this.P_REGISTER] === undefined) return Status.ERROR;
		if (this.memory[this.P_REGISTER] >= this.instructions.length) return Status.POINTER_OUT_OF_CODE;

		let instruction = this.instructions[this.memory[this.P_REGISTER]];

		switch (instruction[0]) {
			case OperatorType.NON:

			case OperatorType.LBL:
				this.memory[this.P_REGISTER]++;
				break;
			case OperatorType.JMP:
			case OperatorType.JET:
			case OperatorType.JGT:
			case OperatorType.JLT:
				if (
					(instruction[0] === OperatorType.JLT && this.comparison === Comparison.LT) ||
					(instruction[0] === OperatorType.JGT && this.comparison === Comparison.GT) ||
					(instruction[0] === OperatorType.JET && this.comparison === Comparison.ET) ||
					instruction[0] === OperatorType.JMP
				) {
					if (!this.handleJumpInstruction(instruction)) return Status.ERROR;
				} else this.memory[this.P_REGISTER]++;
				break;
			case OperatorType.CMP:
				if (!this.handleComparison(instruction)) return Status.ERROR;
				this.memory[this.P_REGISTER]++;
				break;
			case OperatorType.ADD:
			case OperatorType.SUB:
			case OperatorType.MUL:
			case OperatorType.DIV:
			case OperatorType.SET:
				if (!this.handleSetInstruction(instruction)) return Status.ERROR;
				this.memory[this.P_REGISTER]++;
				break;
			default:
				return Status.ERROR;
		}

		return Status.SUCCESS;
	};

	private handleJumpInstruction = (instruction: Instruction): boolean => {
		if (instruction.length !== 3) return false;

		let value = instruction[this.PARAM1_VAL];
		let value_type = instruction[this.PARAM1_TYPE];
		let value_resolved = this.ResolveValue(value_type, value);
		if (value_resolved === null) return false;

		// FIND LABEL with same value_resolved
		let labels = this.instructions?.filter(
			(l) => l[0] === OperatorType.LBL && this.ResolveValue(l[this.PARAM1_TYPE], l[this.PARAM1_VAL]) === value_resolved
		);

		let label: Instruction;
		if (labels && labels.length > 0) label = labels[0];
		else return false;

		let index = this.instructions?.findIndex((l) => l === label);

		if (index === undefined) return false;

		return this.setMemory(this.P_REGISTER, index);
	};

	private handleComparison = (instruction: Instruction): boolean => {
		if (instruction.length !== 5) return false;

		let v1 = instruction[this.PARAM1_VAL];
		let v1t = instruction[this.PARAM1_TYPE];
		let v2 = instruction[this.PARAM2_VAL];
		let v2t = instruction[this.PARAM2_TYPE];

		let resolved_value1 = this.ResolveValue(v1t, v1);
		if (resolved_value1 === null) return false;
		let resolved_value2 = this.ResolveValue(v2t, v2);
		if (resolved_value2 === null) return false;

		if (resolved_value1 > resolved_value2) this.comparison = Comparison.GT;
		if (resolved_value1 < resolved_value2) this.comparison = Comparison.LT;
		if (resolved_value1 === resolved_value2) this.comparison = Comparison.ET;

		return true;
	};

	private handleSetInstruction = (instruction: Instruction): boolean => {
		if (instruction.length !== 5) return false;
		if (instruction[this.PARAM1_TYPE] === ParamType.CONST) return false;

		let v1 = instruction[this.PARAM1_VAL];
		let v1t = instruction[this.PARAM1_TYPE];
		let v2 = instruction[this.PARAM2_VAL];
		let v2t = instruction[this.PARAM2_TYPE];

		let revolved_loc1 = this.ResolveMemoryLoc(v1t, v1);
		if (revolved_loc1 === null) return false;
		let resolved_value1 = this.ResolveValue(v1t, v1);
		if (resolved_value1 === null) return false;
		let resolved_value2 = this.ResolveValue(v2t, v2);
		if (resolved_value2 === null) return false;

		switch (instruction[this.OPER]) {
			case OperatorType.SET:
				return this.setMemory(revolved_loc1, resolved_value2);

			case OperatorType.ADD:
				return this.setMemory(revolved_loc1, resolved_value1 + resolved_value2);

			case OperatorType.SUB:
				return this.setMemory(revolved_loc1, resolved_value1 - resolved_value2);

			case OperatorType.MUL:
				return this.setMemory(revolved_loc1, resolved_value1 * resolved_value2);

			case OperatorType.DIV:
				if (resolved_value2 === 0) return false;
				let val = resolved_value1 / resolved_value2;
				let r = this.setMemory(revolved_loc1, val);
				if (!r) return false;
				let frac = val % 1;
				frac = frac * Math.pow(10, frac.toString().length);
				frac = parseInt(frac.toString().substring(0, 4));
				r = this.setMemory(this.R_REGISTER, frac);
				return r;

			default:
				return false;
		}
	};

	private ResolveMemoryLoc = (value_type: number, loc: number): number | null => {
		switch (value_type) {
			case ParamType.CONST:
				return null;

			case ParamType.MEMORY:
				loc = Math.trunc(loc);
				return loc;

			case ParamType.INDIRECT:
				let r = this.getMemory(loc);
				if (r === null) return null;
				loc = Math.trunc(loc);
				return r;

			default:
				return null;
		}
	};

	private ResolveValue = (value_type: number, value: number): number | null => {
		let r: number | null = value;
		switch (value_type) {
			case ParamType.CONST:
				return r;

			case ParamType.MEMORY:
				r = this.getMemory(value);
				if (r === null) return null;
				return r;

			case ParamType.INDIRECT:
				r = this.getMemory(value);
				if (r === null) return null;
				r = this.getMemory(r);
				if (r === null) return null;
				return r;

			default:
				return null;
		}
	};

	public getMemory = (loc: number): number | null => {
		loc = Math.trunc(loc);
		if (loc < 0) return null;
		if (loc >= this.memory.length) return null;
		return this.memory[loc];
	};

	public setMemory = (loc: number, val: number): boolean => {
		loc = Math.trunc(loc);
		val = Math.trunc(val);
		if (val === Infinity) return false;
		if (isNaN(val)) return false;
		if (loc < 0) return false;
		if (loc >= this.memory.length) return false;
		this.memory[loc] = val;
		return true;
	};

	public setInstructions = (instructions: Instructions): boolean => {
		if (instructions.length >= Number.MAX_VALUE) return false;
		this.instructions = instructions;
		return true;
	};
}
