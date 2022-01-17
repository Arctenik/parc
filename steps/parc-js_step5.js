

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
		
		if (items[0]?.type === "offsets") {
			result.offsets = items.shift().value;
		}
		
		if (items[items.length - 1].type === "brancharrow") {
			result.arrow = items.pop().value[1]?.value || true;
		}
		
		if (items[items.length - 1]?.type === "cond") {
			result.ext = items.pop().value;
		}
		
		if (items.length) result.main = items[0];
		
		return result;
	},
	offset(items) {
		items = items.slice();
		let result = {type: "offset"};
		if (items[0].type === "number") {
			result.offset = parseInt(items.shift().value);
		}
		result.inverse = items[0].value === "!";
		result.value = items[1];
		return result;
	},
	expression(items) {
		items = items.slice();
		
		let colon = items[0].type === "colon" && items.shift(),
			[result, mod] = items;
		
		if (colon) result = {type: colon.value === ":" ? "include" : "exclude", value: result};
		
		if (mod) result = {type: mod.type, value: result};
		
		return result;
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
				
				
				function processResult(result) {
					return result.type === undefined ? result.value : [result];
				}
				
				function match(str, offset) {
					let j = i + (offset || 0);
					if (j < tokens.length && tokens[j].type === str) {
						if (offset === undefined) i++;
						return tokens[j];
					}
					return false;
				}
				
				function matchAny(offset) {
					let j = i + (offset || 0);
					if (j < tokens.length) {
						if (offset === undefined) i++;
						return tokens[j];
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
				
				
				function processResult(result) {
					if (result.type === undefined) {
						return result.value;
					} else {
						result.value = joinTokens(result.value);
						return [result];
					}
				}
				
				function joinTokens(tokens) {
					return tokens.map(t => t.value).join("");
				}
				
				function match(str, offset) {
					let j = i + (offset || 0);
					if (text.substring(j, j + str.length) === str) {
						if (offset === undefined) i += str.length;
						return {type: str, value: str};
					}
					return false;
				}
				
				function matchChars(re, offset) {
					let j = i + (offset || 0);
					if (j < text.length && re.test(text[j])) {
						if (offset === undefined) i++;
						return {type: text[j], value: text[j]};
					}
					return false;
				}
				
				function matchAny(offset) {
					let j = i + (offset || 0);
					if (j < text.length) {
						if (offset === undefined) i++;
						return {type: text[j], value: text[j]};
					}
					return false;
				}
				
				function badSyntax() {
					if (i < text.length) throw new Error("Invalid syntax at " + i);
					else throw new Error("Unexpected end of input");
				}
			}
			
			function initResult(type) {
				return {type, value: []};
			}
				
			function collect(val, result) {
				if (val === false) return false;
				if (Array.isArray(val)) result.value.push(...val);
				else result.value.push(val);
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
					let result = initResult(${rule.arrow === true || rule.star ? "" : JSON.stringify(rule.arrow || rule.name)});
					${compileGroup(rule.body)}
					return processResult(result);
					
					${extraFunctions.join("\r\n")}
				}
			`;
			
			
			function compileGroup(group) {
				let result = `return false;`;
				
				group.value.slice().reverse().forEach(branch => {
					let arrowCode = branch.arrow ? `result.type = ${branch.arrow === true ? "undefined" : JSON.stringify(branch.arrow)};` : "";
					if (branch.main || branch.offsets) {
						result = `
							${compileCondition(branch, arrowCode)} {
								${result}
							}
						`;
					} else {
						result = `
							${compileExprs(branch.ext)}
							${arrowCode}
						`;
					}
				});
				
				return result;
			}
			
			function compileCondition({offsets, main, ext = []}, bodyEnd = "") {
				let cond = "", start = "";
				if (main) {
					if (main.type === "plus") {
						cond = compileBaseExpr(main.value);
						start = `while(${cond}) {};`;
					} else {
						cond = compileBaseExpr(main);
					}
				}
				if (offsets) {
					cond = offsets.map(e => compileBaseExpr(e)).join(" && ") + (cond ? " && " : "") + cond;
				}
				if (start || ext.length || bodyEnd) {
					return `
						if (${cond}) {
							${start}
							${compileExprs(ext)}
							${bodyEnd}
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
			
			function compileBaseExpr(expr, offset) {
				let result,
					save = phase === "tokenize" && !rule.star,
					forceSave,
					offsetArg = offset === undefined ? "" : ", " + offset,
					offsetArgFirst = offset === undefined ? "" : offset;
				
				if (expr.type === "include" || expr.type === "exclude") {
					forceSave = expr.type === "include";
					expr = expr.value;
				}
				
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
				} else if (expr.type === "offset") {
					let baseResult = compileBaseExpr(expr.value, expr.offset || 0);
					result = expr.inverse ? `!(${baseResult})` : baseResult;
					save = false;
				} else if (expr.type === "name" && rules[expr.value]) {
					result = `parse_${expr.value}()`;
					save = true;
				} else if (expr.type === "string" || expr.type === "name") {
					result = `match(${JSON.stringify(expr.value)}${offsetArg})`;
					if (expr.type === "name") save = true;
				} else if (expr.type === "chars") {
					if (phase === "parse") throw "Chars expression in expression parser";
					result = `matchChars(${charsToRegExp(expr)}${offsetArg})`;
				} else if (expr.type === "dot") {
					result = `matchAny(${offsetArgFirst})`;
				} else {
					throw "wtf";
				}
				
				if (forceSave !== undefined) save = forceSave;
				
				if (save && offset === undefined) result = `collect(${result}, result)`;
				
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
	console.log(parse(parserInp.value));
	console.log(compiled = compileParser(parse(parserInp.value, transformers), {useTransformers: true}));
});

