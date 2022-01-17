

let transformers = {
	parser([a, , b]) {
		return [a, b];
	},
	ruleset(rules) {
		let result = {firstRule: rules[0].name, rules: {}};
		rules.forEach(rule => result.rules[rule.name] = rule);
		return result;
	},
	rule([name, props, group]) {
		let result = {name: name.value, body: group},
			prop = props.value[0];
		
		if (prop) {
			if (prop.type === "rulearrow") result.arrow = prop.value[1]?.value || true;
			else result[prop.type] = true;
		}
		
		return result;
	},
	branch(value) {
		let result = {},
			items = value.slice();
		
		if (items[0]?.type === "nots") {
			result.not = items.shift().value.map(e => e.value);
		}
		
		if (items[items.length - 1]?.type === "cond") {
			result.ext = items.pop().value;
		}
		
		if (items.length) result.main = items[0];
		
		return result;
	},
	not([value]) {
		return {type: "not", value};
	},
	expression([base, mod]) {
		return mod ? {type: mod.type, value: base} : base;
	},
	string(value) {
		return {type: "string", value: evalEscapes(value.substring(1, value.length - 1))};
	},
	chars(value) {
		value = value.substring(1, value.length - 1);
		let result = {type: "chars"};
		if (value[0] === "^") {
			result.inverse = true;
			value = value.substring(1);
		}
		value = value.replace(/\\.|-/g, s => {
			if (s === "-") return "[-]";
			else return s;
		}).split("[-]").map((piece, i) => [...(i ? ["--"] : []), ...evalEscapes(piece)]).flat();
		let items = [];
		for (let i = 0; i < value.length; ) {
			if (value[i + 1] === "--" && i + 2 < value.length) {
				items.push([value[i][0], value[i + 2][0]]);
				i += 3;
			} else {
				items.push(value[i][0]);
				i += 1;
			}
		}
		result.value = items;
		return result;
	}
};

function evalEscapes(value) {
	return value.replace(/\\(u[0-9a-fA-F]+;|.)/g, (m, code) => {
		if (code[0] === "u") return String.fromCodePoint(parseInt(code.substring(1), 16));
		else return ({t: "\t", r: "\r", n: "\n"})[code] || code;
	});
}

function compileParser([parserRules, tokenRules], {funcName = "parse", useTransformers} = {}) {
	console.log(parserRules, tokenRules);
	
	let resultCode = `parseExprs(parseTokens(text))`,
		firstParserRule = parserRules.rules[parserRules.firstRule],
		untypedParser = firstParserRule.arrow === true || firstParserRule.star;
	
	return `
		${funcName} = (function() {
			function parse(text${useTransformers ? ", transformers" : ""}) {
				${
					useTransformers ?
					`let result = ${resultCode};
					if (transformers) result = transform(result);
					return result;`
					: `return ${resultCode};`
				}
				
				${
					useTransformers ?
					`function transform(expr) {
						if (Array.isArray(expr)) {
							return expr.map(transform);
						} else if (expr) {
							let children = Array.isArray(expr.value) ? expr.value.map(transform) : expr.value;
							if (transformers[expr.type]) {
								return transformers[expr.type](children);
							} else {
								return {type: expr.type, value: children};
							}
						} else {
							return expr;
						}
					}`
					: ""
				}
			}
			
			function parseExprs(tokens) {
				let i = 0,
					result = parse_${parserRules.firstRule}();
				
				if (i < tokens.length || !result) badSyntax();
				
				${untypedParser ? `return result;` : `return result[0];`}
				
				
				${compileRules(parserRules.rules, "parse")}
				
				
				function match(str) {
					if (i < tokens.length && tokens[i].type === str) {
						return tokens[i++];
					}
					return false;
				}
				
				function matchAny() {
					if (i < tokens.length) {
						return tokens[i++];
					}
					return false;
				}
				
				function badSyntax() {
					if (i < tokens.length) throw new Error("Unexpected token " + JSON.stringify(tokens[i]) + " at index " + i);
					else throw new Error("Unexpected end of input");
				}
			}
			
			function parseTokens(text) {
				let i = 0,
					result = parse_${tokenRules.firstRule}();
				
				if (i < text.length || !result) badSyntax();
				
				return result;
				
				
				${compileRules(tokenRules.rules, "tokenize")}
				
				
				function joinTokens(tokens) {
					return tokens.map(t => t.value).join("");
				}
				
				function match(str) {
					if (text.substring(i, i + str.length) === str) {
						i += str.length;
						return {type: str, value: str};
					}
					return false;
				}
				
				function matchChars(re) {
					if (i < text.length && re.test(text[i])) {
						return {type: text[i], value: text[i++]};
					}
					return false;
				}
				
				function matchAny() {
					if (i < text.length) {
						return {type: text[i], value: text[i++]};
					}
					return false;
				}
				
				function badSyntax() {
					if (i < text.length) throw new Error("Invalid syntax at " + i);
					else throw new Error("Unexpected end of input");
				}
			}
				
			function collect(val, arr) {
				if (val === false) return false;
				if (Array.isArray(val)) arr.push(...val);
				else arr.push(val);
				return true;
			}
			
			
			parse.tokenize = function tokenize(text) {
				return parseTokens(text);
			}
			
			
			return parse;
		})();
	`;
	
	
	function compileRules(rules, phase) {
		return Object.values(rules).map(compileRule).join("\r\n");
		
		function compileRule(rule) {
			let extraFunctions = [],
				nextGroupId = 0;
			
			return `
				function parse_${rule.name}() {
					let result = [];
					${compileGroup(rule.body)}
					${
						rule.arrow === true || rule.star
							? `return result;`
							: `return [{type: ${JSON.stringify(rule.arrow || rule.name)}, value: ${phase === "tokenize" ? `joinTokens(result)` : `result`}}];`
					}
					
					${extraFunctions.join("\r\n")}
				}
			`;
			
			
			function compileGroup(group) {
				let result = `return false;`;
				
				group.value.slice().reverse().forEach(branch => {
					if (branch.main || branch.not) {
						result = `
							${compileCondition(branch)} {
								${result}
							}
						`;
					} else {
						result = compileExprs(branch.ext);
					}
				});
				
				return result;
			}
			
			function compileCondition({not, main, ext = []}) {
				let cond = "", start = "";
				if (main) {
					if (main.type === "plus") {
						cond = compileBaseExpr(main.value);
						start = `while(${cond}) {};`;
					} else {
						cond = compileBaseExpr(main);
					}
				}
				if (not) {
					cond = "!(" + not.map(e => compileBaseExpr(e, false)).join(" || ") + ")" + (cond ? " && " : "") + cond;
				}
				if (start || ext.length) {
					return `
						if (${cond}) {
							${start}
							${compileExprs(ext)}
						} else
					`;
				} else {
					return `if (!(${cond}))`;
				}
			}
			
			function compileExprs(exprs) {
				return exprs.map(expr => {
					if (expr.type === "plus") {
						let cond = compileBaseExpr(expr.value);
						return `
							if (${cond}) {
								while (${cond}) {};
							} else {
								return false;
							}
						`;
					} else if (expr.type === "star") {
						return `while (${compileBaseExpr(expr.value)}) {};`;
					} else if (expr.type === "question") {
						return compileBaseExpr(expr.value);
					} else {
						return `
							if (!(${compileBaseExpr(expr)})) {
								badSyntax();
							}
						`;
					}
				}).join("\r\n");
			}
			
			function compileBaseExpr(expr, allowSave = true) {
				let result, save = phase === "tokenize" && !rule.star;
				if (expr.type === "group") {
					let id = nextGroupId++;
					extraFunctions.push(`
						function parseGroup${id}() {
							${compileGroup(expr)}
							return true;
						}
					`);
					result = `parseGroup${id}()`;
					save = false;
				} else if (expr.type === "not") {
					result = `!(${compileBaseExpr(expr.value, false)})`;
					save = false;
				} else if (expr.type === "name" && rules[expr.value]) {
					result = `parse_${expr.value}()`;
					save = true;
				} else if (expr.type === "string" || expr.type === "name") {
					result = `match(${JSON.stringify(expr.value)})`;
					if (expr.type === "name") save = true;
				} else if (expr.type === "chars") {
					if (phase === "parse") throw "Chars expression in expression parser";
					result = `matchChars(${charsToRegExp(expr)})`;
				} else if (expr.type === "dot") {
					result = `matchAny()`;
				} else {
					throw "wtf";
				}
				if (save && allowSave) result = `collect(${result}, result)`;
				return result;
			}
			
			function charsToRegExp(expr) {
				return "/[" + (expr.inverse ? "^" : "") + expr.value.map(range => {
					if (!Array.isArray(range)) range = [range];
					return range.map(c => {
						let n = c.codePointAt(0);
						if (n === 0x7f || n < 0x20) {
							let special = ({
								"\t": "\\t",
								"\r": "\\r",
								"\n": "\\n"
							})[c];
							return special || "\\x" + n.toString(16).padStart(2, "0");
						} else {
							return "[]^-/\\".includes(c) ? "\\" + c : c;
						}
					}).join("-");
				}).join("") + "]/";
			}
		}
	}
}


function transformExprs(root, transformers) {
	console.log(root);
	
	return transform(root);
	
	function transform(expr) {
		if (expr) {
			let children = Array.isArray(expr.value) ? expr.value.map(transform) : expr.value;
			if (transformers[expr.type]) {
				return transformers[expr.type](children);
			} else {
				return {type: expr.type, value: children};
			}
		} else {
			return expr;
		}
	}
}



//console.log(compileParser(transformExprs(convertSExp(sExp), transformers), {useTransformers: true}));

convertButton.addEventListener("click", () => {
	console.log(parse.tokenize(parserInp.value));
	console.log(compiled = compileParser(parse(parserInp.value, transformers), {useTransformers: true}));
});

