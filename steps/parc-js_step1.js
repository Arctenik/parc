

// (remember that backslashes need to be escaped in the template string)
let sExp = `
(
	(parser
		(ruleset equals ruleset))
	
	(ruleset
		((+ rule)))
	
	(rule
		(> name ruleprops group))
	
	(ruleprops
		((? star) (? arrow)))
	
	(group
		(> "{" groupcontent "}")
		(> "(" groupcontent ")"))
	
	((groupcontent =>)
		((? (branch (* (> "/" branch))))))
	
	(branch
		((+ expression) (? cond)))
	
	(cond
		((">" (* expression))))
	
	(expression
		((/ (dot) (name) (string) (chars) (group)) (? exprmod)))
	
	((exprmod =>)
		(star) (plus) (question))
)

(
	((tokens *)
		((* (@ " \\t\\r\\n")) (* (> token (* (@ " \\t\\r\\n"))))))
	
	((token =>)
		(specialsyntax) (string) (chars) (name))
	
	((specialsyntax =>)
		(arrow) (equals) (star) (plus) (question) (dot) ((@ "{}()/>")))
	
	(arrow ("=>"))
	
	(equals ((+ "=")))
	
	(star ("*"))
	
	(plus ("+"))
	
	(question ("?"))
	
	(dot ("."))
	
	(name
		((@ "a-zA-Z_") (? nametail)))
	
	(nametail
		((+ (@ "a-zA-Z0-9_"))))
	
	(string
		(> "\\"" (* stritem) "\\""))
	
	(stritem
		(> "\\\\" .)
		((@ "^\\"")))
	
	(chars
		(> "[" (* charsitem) "]"))
	
	(charsitem
		(> "\\\\" .)
		((@ "^]")))
)
`;

function parseSExp(text) {
	let result = [],
		path = [];
	
	text.trim().replace(/\"(?:[^"\\]|\\.)*\"|[()]|[^\s()]+/g, "$& (\"\") ").split(/\s+\(""\)\s+/).forEach(token => {
		if (token === "(") {
			let arr = [];
			result.push({type: "list", value: arr});
			path.push(result);
			result = arr;
		} else if (token === ")") {
			result = path.pop();
		} else if (token[0] === "\"") {
			result.push({type: "string", value: JSON.parse(token)});
		} else if (token) {
			result.push({type: "symbol", value: token});
		}
	});
	
	return result;
}


function convertSExp(text) {
	let ruleSets = parseSExp(text);
	console.log(ruleSets);
	ruleSets = ruleSets.map(set => ({type: "ruleset", value: set.value.map(convertRule)}));
	ruleSets.splice(1, 0, null);
	return {
		type: "parser",
		value: ruleSets
	}
	
	function convertRule({value: rule}) {
		let name, mod;
		if (rule[0].type === "symbol") {
			name = rule[0].value;
		} else {
			name = rule[0].value[0].value;
			mod = rule[0].value[1].value;
		}
		
		return {
			type: "rule",
			value: [
				{type: "name", value: name},
				{type: "ruleprops", value: mod ? [{type: mod === "*" ? "star" : "arrow"}] : []},
				convertGroup(rule.slice(1))
			]
		};
	}
	
	function convertGroup(group) {
		return {
			type: "group",
			value: group.map(convertBranch)
		};
	}
	
	function convertBranch({value: branch}) {
		let value = [];
		if (branch[0].type === "symbol" && branch[0].value === ">") {
			value.push(convertExpr(branch[1]));
			value.push({type: "cond", value: branch.slice(2).map(convertExpr)});
		} else {
			value.push(...branch.map(convertExpr));
		}
		return {type: "branch", value};
	}
	
	function convertExpr(expr) {
		if (expr.type === "string") {
			return makeExpr({type: "string", value: JSON.stringify(expr.value)});
		} else if (expr.type === "symbol") {
			if (expr.value === ".") return makeExpr({type: "dot"});
			return makeExpr({type: "name", value: expr.value});
		} else {
			let first = expr.value[0];
			if (first.type === "symbol") {
				let mod = ({"*": "star", "+": "plus", "?": "question"})[first.value];
				if (mod) {
					return makeExpr(convertExpr(expr.value[1]), mod);
				} else if (first.value === "@") {
					return makeExpr({type: "chars", value: "[" + expr.value[1].value.replace(/[\\\]]/g, "\\$&") + "]"});
				} else if (first.value === "/") {
					return makeExpr(convertGroup(expr.value.slice(1)));
				}
			}
			return makeExpr(convertGroup([expr]));
		}
	}
	
	function makeExpr(base, mod) {
		if (base.type !== "expression") base = {type: "expression", value: [base]};
		return {...base, value: [...base.value, ...(mod ? [{type: mod}] : [])]};
	}
}



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
			mod = props.value[0]?.type;
		
		if (mod) result[mod] = true;
		
		return result;
	},
	branch(value) {
		if (value[value.length - 1]?.type === "cond") return {main: value.slice(0, value.length - 1), ext: value[value.length - 1].value};
		return {main: value};
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
	
	analyzeRules(tokenRules);
	analyzeRules(parserRules);
	
	let resultCode = `parseExprs(parseTokens(text))`,
		firstParserRule = parserRules.rules[parserRules.firstRule],
		untypedParser = firstParserRule.arrow || firstParserRule.star;
	
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
					if (i < tokens.length) throw new Error("Unexpected token " + JSON.stringify(tokens[i]));
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
						rule.arrow || rule.star
							? `return result;`
							: `return [{type: ${JSON.stringify(rule.name)}, value: ${phase === "tokenize" ? `joinTokens(result)` : `result`}}];`
					}
					
					${extraFunctions.join("\r\n")}
				}
			`;
			
			
			function compileGroup(group) {
				let branches = [];
				for (let branch of group.value) {
					branches.push(branch);
					if (!branch.conditional) {
						break;
					}
				}
				
				let result = `return false;`;
				
				branches.reverse().forEach(branch => {
					if (branch.conditional) {
						result = `
							${compileCondition(branch.main, branch.ext || [])} {
								${result}
							}
						`;
					} else {
						result = compileExprs([...branch.main, ...(branch.ext || [])]);
					}
				});
				
				return result;
			}
			
			function compileCondition(exprs, body) {
				let cond, start;
				if (exprs[0].type === "plus") {
					cond = compileBaseExpr(exprs[0].value);
					start = `while(${cond}) {};`;
				} else {
					cond = compileBaseExpr(exprs[0]);
					start = "";
				}
				if (start || exprs.length > 1 || body.length > 0) {
					return `
						if (${cond}) {
							${start}
							${compileExprs(exprs.slice(1))}
							${compileExprs(body)}
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
			
			function compileBaseExpr(expr) {
				let result, save;
				if (expr.type === "group") {
					let id = nextGroupId++;
					extraFunctions.push(`
						function parseGroup${id}() {
							${compileGroup(expr)}
							return true;
						}
					`);
					result = `parseGroup${id}()`;
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
				if (phase === "tokenize" && expr.type !== "group" && !rule.star) save = true;
				if (save) result = `collect(${result}, result)`;
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
	
	function analyzeRules({rules}) {
		let delayedExprs = [];
		
		for (let rule of Object.values(rules)) {
			if (rule.boolable === undefined) {
				Object.assign(rule, analyzeExpr(rule.body));
			}
		}
		
		delayedExprs.forEach(e => analyzeExpr(e));
		
		
		function analyzeExpr(expr) {
			if (expr.type === "group") {
				let predictable = true,
					boolable = true;
				for (let branch of expr.value) {
					let firstResult;
					if (branch.main[0]) {
						firstResult = analyzeExpr(branch.main[0]);
						if (!firstResult.predictable) {
							if (branch.ext) {
								throw ["Non-predictable condition", branch];
							} else {
								branch.predictable = false;
								branch.boolable = false;
							}
						}
					} else {
						firstResult = {predictable: true, boolable: true};
					}
					
					for (let expr of branch.main.slice(1)) {
						if (!(expr.type === "star" || expr.type === "question")) {
							if (branch.ext) {
								throw ["Non-predictable condition", branch];
							} else {
								branch.predictable = false;
								branch.boolable = false;
							}
						}
						delayedExprs.push(expr);
					}
					
					if (!firstResult.boolable || branch.ext) branch.boolable = false;
					if (branch.ext) delayedExprs.push(...branch.ext);
					if (branch.predictable === false) predictable = false;
					else branch.predictable = true;
					if (branch.boolable === false) boolable = false;
					else branch.boolable = true;
					branch.conditional = (branch.predictable && branch.main[0] && branch.main[0].type !== "star" && branch.main[0].type !== "question");
				}
				return {predictable, boolable};
			} else if (expr.type === "plus" || expr.type === "star" || expr.type === "question") {
				let result = analyzeExpr(expr.value);
				if (result.predictable) {
					return result;
				} else {
					throw ["Non-predictable expression in repetition", expr];
				}
			} else if (expr.type === "name") {
				let rule = rules[expr.value];
				if (rule) {
					if (rule.boolable === undefined) {
						Object.assign(rule, analyzeExpr(rule.body));
					}
					return {boolable: rule.boolable, predictable: rule.predictable};
				} else {
					return {boolable: true, predictable: true};
				}
			} else if (expr.type === "string" || expr.type === "chars" || expr.type === "dot") {
				return {boolable: true, predictable: true};
			} else {
				console.log(expr);
				throw "wtf";
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
	console.log(compileParser(parse(parserInp.value, transformers), {useTransformers: true}));
});

