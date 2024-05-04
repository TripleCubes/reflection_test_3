let test3_gen = Module.cwrap('test3_gen', 'number',
							 ['string']);
let get_result_code_sz = Module.cwrap(
	'get_result_code_sz', 'number');
let get_error_str_sz = Module.cwrap(
	'get_error_str_sz', 'number');
let get_result_code = Module.cwrap(
	'get_result_code', null, ['number']);
let get_error_str = Module.cwrap(
	'get_error_str', null, ['number']);

function init() {
	let input = document.querySelector('.input');
	let saved_code = localStorage.getItem('input_code');
	if (saved_code != null) {
		input.value = saved_code;
	}


	input.addEventListener('keydown', (e) => {
		if (e.key == 'Tab') {
			e.preventDefault();
			
			let start = input.selectionStart;
			let end = input.selectionEnd;

			input.value
			= input.value.substring(0, start)
			+ '\t' + input.value.substring(end);

			input.selectionStart = start + 1;
			input.selectionEnd = start + 1;
		}
	
		let saved_text = document.querySelector('.saved_text');
		saved_text.innerHTML = 'edited';
	});
}

init();

function save_input() {
	let input = document.querySelector('.input');
	localStorage.setItem('input_code', input.value);

	let saved_text = document.querySelector('.saved_text');
	saved_text.innerHTML = 'saved';
}

function compile_run_click() {
	let input = document.querySelector('.input');
	compile_and_run(input.value);

	save_input();
}

function compiled_click() {
	let compiled = document.querySelector('.compiled');
	let output = document.querySelector('.output');
	let right_label = document.querySelector('.right_label');
	compiled.style.display = 'block';
	output.style.display = 'none';
	right_label.innerHTML = 'Compiled';
}

function output_click() {
	let compiled = document.querySelector('.compiled');
	let output = document.querySelector('.output');
	let right_label = document.querySelector('.right_label');
	compiled.style.display = 'none';
	output.style.display = 'block';
	right_label.innerHTML = 'Output';
}

function copy_click() {
	let compiled = document.querySelector('.compiled');
	navigator.clipboard.writeText(compiled.innerHTML)
	.then(() => {
		let copied_text=document.querySelector('.copied_text');
		copied_text.innerHTML = 'Copied';
	});

	setTimeout(() => {
		let copied_text=document.querySelector('.copied_text');
		copied_text.innerHTML = '';
	}, 1000);
}

function clear_click() {
	let input = document.querySelector('.input');
	input.value = '';
}

console_log = console.log;
console.log = function(str) {
	console_log(str);
	let output = document.querySelector('.output');
	output.innerHTML += str + '\n';
}

function compile_and_run(str) {
	let compiled_code = compile(str);

	if (compiled_code != '') {
		run_compiled(compiled_code);
	}
}

function compile(str) {
	let result_num = test3_gen(str);
	
	let result_code_sz = get_result_code_sz();
	let error_str_sz = get_error_str_sz();

	let result_code = '';
	let error_str = '';

	for (let i = 0; i < result_code_sz + 1; i++) {
		result_code += ' ';
	}
	for (let i = 0; i < error_str_sz + 1; i++) {
		error_str += ' ';
	}

	let result_code_ptr
		= Module.stringToNewUTF8(result_code);
	let error_str_ptr
		= Module.stringToNewUTF8(error_str);

	get_result_code(result_code_ptr);
	get_error_str(error_str_ptr);

	result_code = Module.UTF8ToString(result_code_ptr);
	error_str = Module.UTF8ToString(error_str_ptr);

	Module._free(result_code_ptr);
	Module._free(error_str_ptr);

	let compiled = document.querySelector('.compiled');
	if (result_num == 1) {
		compiled.innerHTML = result_code;
		output_click();
	}
	else {
		compiled.innerHTML = error_str;
		compiled_click();
	}

	return result_code;
}

function run_compiled(str) {
	let output = document.querySelector('.output');
	output.innerHTML = '';

	let test_code = 'function test()\n'
		+ str
		+ '\nend\n'
		+ 'success, err = pcall(test)\n'
		+ 'if not success then print(err) end';

	let func = fengari.load(test_code);
	func();
}
