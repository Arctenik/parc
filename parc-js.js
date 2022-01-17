

(function() {
	
	let parse=function(){function a(a,d){function e(a){if(Array.isArray(a))return a.map(e);if(a){let b=Array.isArray(a.value)?a.value.map(e):a.value;return d[a.type]?d[a.type](b):{type:a.type,value:b}}return a}let f=b(c(a),a);return d&&(f=e(f)),f}function b(a,b){function c(){let a=d(C,"parser");return e(g(),a)||B(),A("equals")||B(),e(g(),a)||B(),z(a)}function g(){let a=d(C,"ruleset");if(e(h(),a))for(;e(h(),a););else return!1;return z(a)}function h(){let a=d(C,"rule");if(e(A("name"),a))e(j(),a)||B(),e(k(),a)||B();else return!1;return z(a)}function j(){let a=d(C,"ruleprops");return e(A("star"),a),e(r(),a),z(a)}function k(){let a=d(C,"group");if(A("{"))e(l(),a)||B(),A("}")||B();else if(A("("))e(l(),a)||B(),A(")")||B();else return!1;return z(a)}function l(){let a=d(C);if(e(p(),a))A("lb");else if(e(n(),a))e(m(),a);else return!1;return z(a)}function m(){let a=d(C);if(A("/"))e(l(),a)||B();else if(A("lb"))e(l(),a);else return!1;return z(a)}function n(){let a=d(C,"branch");if(e(o(),a))e(s(),a),e(q(),a),e(r(),a);else if(e(s(),a))e(q(),a),e(r(),a);else return!1;return z(a)}function o(){let a=d(C,"offsets");if(e(t(),a))for(;e(t(),a););else return!1;return z(a)}function p(){let a=d(C,"branch");if(e(q(),a))e(r(),a);else if(!e(r(),a))return!1;return z(a)}function q(){let a=d(C,"cond");if(A(">"))for(;e(s(),a););else return!1;return z(a)}function r(){let a=d(C,"arrow");if(A("=>"))e(A("name"),a);else return!1;return z(a)}function s(){let a=d(C,"expression");if(!e(t(),a))if(e(u(),a))e(y(),a);else return!1;return z(a)}function t(){let a=d(C,"offset");if(e(A("number"),a))e(A("offsettype"),a)||B(),e(x(),a)||B();else if(e(A("offsettype"),a))e(x(),a)||B();else return!1;return z(a)}function u(){let a=d(C);if(e(A("colon"),a))e(w(),a)||B();else if(!e(v(),a))return!1;return z(a)}function v(){let a=d(C);return!!(e(w(),a)||e(k(),a))&&z(a)}function w(){let a=d(C);return!!(e(x(),a)||e(A("name"),a))&&z(a)}function x(){let a=d(C);return!!(e(A("dot"),a)||e(A("string"),a)||e(A("chars"),a))&&z(a)}function y(){let a=d(C);return!!(e(A("star"),a)||e(A("plus"),a)||e(A("question"),a))&&z(a)}function z(c){return void 0===c.type?c.value:(c.index=a[c.index]?a[c.index].index:b.length,[c])}function A(b,c){let d=C+(c||0);return!!(d<a.length&&a[d].type===b)&&(void 0===c&&C++,a[d])}function B(){if(C<a.length){let{line:c,indexInLine:d}=f(a[C].index,b);throw new Error("Unexpected"+(a[C].type===a[C].value?"":" "+a[C].type)+" token "+JSON.stringify(a[C].value)+" at line "+(c+1)+" character "+(d+1))}else throw new Error("Unexpected end of input")}let C=0,D=c();return(C<a.length||!D)&&B(),D[0]}function c(a){function b(){function a(){if(e(c(),b))e(n(),b);else return!1;return!0}let b=d(F);for(e(n(),b);a(););return z(b)}function c(){let a=d(F);return!!(e(g(),a)||e(q(),a))&&z(a)}function g(){let a=d(F);if(e(o(),a))e(n(),a),e(h(),a)||E(),e(p(),a)||E();else return!1;return z(a)}function h(){function a(){if(e(c(),b))e(j(),b);else return!1;return!0}let b=d(F);for(;a(););return z(b)}function j(){function a(){if(e(k(),b))e(n(),b);else return!1;return!0}let b=d(F);if(l()){for(;l(););a()}else if(e(k(),b))e(n(),b);else return!1;return z(b)}function k(){let a=d(F,"lb");return!!e(B("\n"),a)&&z(a)}function l(){function a(){return!!(e(C(/[ \t\r]/),b)||e(m(),b))}let b=d(F,"linews");if(a())for(;a(););else return!1;return z(b)}function m(){function a(){return!B("*/",0)&&e(D(),b)}let b=d(F,"comment");if(e(B("//"),b))for(;e(C(/[^\n]/),b););else if(e(B("/*"),b)){for(;a(););e(B("*/"),b)||E()}else return!1;return z(b)}function n(){function a(){return!!(C(/[ \t\r\n]/)||m())}let b=d(F);if(a())for(;a(););else return!1;return z(b)}function o(){let a=d(F);return!!e(C(/[{(]/),a)&&z(a)}function p(){let a=d(F);return!!e(C(/[})]/),a)&&z(a)}function q(){let a=d(F);return!!(e(r(),a)||e(v(),a)||e(x(),a)||e(u(),a)||e(s(),a))&&z(a)}function r(){let a=d(F);if(!e(B("=>"),a))if(e(B("="),a)){for(;e(B("="),a););a.type="equals"}else if(e(B("*"),a))a.type="star";else if(e(B("+"),a))a.type="plus";else if(e(B("?"),a))a.type="question";else if(e(B("."),a))a.type="dot";else if(e(C(/[&!]/),a))a.type="offsettype";else if(e(C(/[:;]/),a))a.type="colon";else if(!e(C(/[\/>]/),a))return!1;return z(a)}function s(){let a=d(F,"name");if(e(C(/[a-zA-Z_]/),a))e(t(),a);else return!1;return z(a)}function t(){let a=d(F,"nametail");if(e(C(/[a-zA-Z0-9_]/),a))for(;e(C(/[a-zA-Z0-9_]/),a););else return!1;return z(a)}function u(){let a=d(F,"number");if(e(B("-"),a)){if(e(C(/[0-9]/),a))for(;e(C(/[0-9]/),a););else return!1;}else if(e(C(/[0-9]/),a))for(;e(C(/[0-9]/),a););else return!1;return z(a)}function v(){let a=d(F,"string");if(e(B("\""),a)){for(;e(w(),a););e(B("\""),a)||E()}else return!1;return z(a)}function w(){let a=d(F,"stritem");if(e(B("\\"),a))e(D(),a)||E();else if(!e(C(/[^"]/),a))return!1;return z(a)}function x(){let a=d(F,"chars");if(e(B("["),a)){for(;e(y(),a););e(B("]"),a)||E()}else return!1;return z(a)}function y(){let a=d(F,"charsitem");if(e(B("\\"),a))e(D(),a)||E();else if(!e(C(/[^\]]/),a))return!1;return z(a)}function z(a){return void 0===a.type?a.value:(a.value=A(a.value),[a])}function A(a){return a.map(a=>a.value).join("")}function B(b,c){let d=F+(c||0);return a.substring(d,d+b.length)===b&&(void 0===c&&(F+=b.length),{type:b,value:b,index:d})}function C(b,c){let d=F+(c||0);return!!(d<a.length&&b.test(a[d]))&&(void 0===c&&F++,{type:a[d],value:a[d],index:d})}function D(b){let c=F+(b||0);return!!(c<a.length)&&(void 0===b&&F++,{type:a[c],value:a[c],index:c})}function E(){if(F<a.length){let{line:b,indexInLine:c}=f(F,a);throw new Error("Invalid syntax at line "+(b+1)+" character "+(c+1))}else throw new Error("Unexpected end of input")}let F=0,G=b();return(F<a.length||!G)&&E(),G}function d(a,b){return{type:b,value:[],index:a}}function e(a,b){return!1!==a&&(Array.isArray(a)?b.value.push(...a):b.value.push(a),!0)}function f(a,b){let c=b.indexOf("\n"),d=-1,e=0;for(;c<a&&-1!==c;)d=c,c=b.indexOf("\n",c+1),e++;return{index:a,line:e,indexInLine:a-d-1}}return a.parse=a,a.tokenize=function(a){return c(a)},a.getLocationInfo=f,a}();
	
	
	let transformers = {
		parser(parts) {
			return parts;
		},
		ruleset(rules) {
			let result = {firstRule: rules[0].name, rules: {}};
			rules.forEach(rule => result.rules[rule.name] = rule);
			return result;
		},
		rule([name, props, group]) {
			let result = {name: name.value, body: group};
			
			props.value.forEach(prop => {
				if (prop.type === "arrow") result.arrow = prop.value[0]?.value || true;
				else result[prop.type] = true;
			});
			
			return result;
		},
		branch(value) {
			let result = {},
				items = value.slice();
			
			if (items[0]?.type === "offsets") {
				result.offsets = items.shift().value;
			}
			
			if (items[items.length - 1].type === "arrow") {
				result.arrow = items.pop().value[0]?.value || true;
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

	function compileParser(source, funcName) {
		let [parserRules, tokenRules] = parse(source, transformers),
			firstParserRule = parserRules.rules[parserRules.firstRule],
			untypedParser = firstParserRule.arrow === true || firstParserRule.star;
		
		return `
			${funcName ? funcName + " = " : ""}(function() {
				function parse(text, transformers) {
					let result = parseExprs(parseTokens(text), text);
					if (transformers) result = transform(result);
					return result;
					
					function transform(expr) {
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
					}
				}
				
				function parseExprs(tokens, text) {
					let i = 0,
						result = parse_${parserRules.firstRule}();
					
					if (i < tokens.length || !result) badSyntax();
					
					${untypedParser ? `return result;` : `return result[0];`}
					
					
					${compileRules(parserRules.rules, "parse")}
					
					
					function processResult(result) {
						if (result.type === undefined) {
							return result.value;
						} else {
							result.index = tokens[result.index] ? tokens[result.index].index : text.length;
							return [result];
						}
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
						if (i < tokens.length) {
							let {line, indexInLine} = getLocationInfo(tokens[i].index, text);
							throw new Error("Unexpected" + (tokens[i].type === tokens[i].value ? "" : " " + tokens[i].type) + " token " + JSON.stringify(tokens[i].value) + " at line " + (line + 1) + " character " + (indexInLine + 1));
						} else {
							throw new Error("Unexpected end of input");
						}
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
							return {type: str, value: str, index: j};
						}
						return false;
					}
					
					function matchChars(re, offset) {
						let j = i + (offset || 0);
						if (j < text.length && re.test(text[j])) {
							if (offset === undefined) i++;
							return {type: text[j], value: text[j], index: j};
						}
						return false;
					}
					
					function matchAny(offset) {
						let j = i + (offset || 0);
						if (j < text.length) {
							if (offset === undefined) i++;
							return {type: text[j], value: text[j], index: j};
						}
						return false;
					}
					
					function badSyntax() {
						if (i < text.length) {
							let {line, indexInLine} = getLocationInfo(i, text);
							throw new Error("Invalid syntax at line " + (line + 1) + " character " + (indexInLine + 1));
						} else {
							throw new Error("Unexpected end of input");
						}
					}
				}
				
				function initResult(index, type) {
					return {type, value: [], index};
				}
					
				function collect(val, result) {
					if (val === false) return false;
					if (Array.isArray(val)) result.value.push(...val);
					else result.value.push(val);
					return true;
				}
				
				function getLocationInfo(index, code) {
					let i = code.indexOf("\\n"),
						prevI = -1,
						j = 0;
					
					while (i < index && i !== -1) {
						prevI = i;
						i = code.indexOf("\\n", i + 1);
						j++;
					}
					
					return {index, line: j, indexInLine: index - prevI - 1};
				}
				
				
				parse.parse = parse;
				
				parse.tokenize = function tokenize(text) {
					return parseTokens(text);
				}
				
				parse.getLocationInfo = getLocationInfo;
				
				
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
						let result = initResult(i${rule.arrow === true || rule.star ? "" : ", " + JSON.stringify(rule.arrow || rule.name)});
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
								${compileExprs(branch.ext || [])}
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
						save = true;
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
	
	
	compileParser.compileParser = compileParser;
	compileParser.parse = Object.assign(
		function(text, tf = transformers) {
			return parse(text, tf);
		},
		parse
	);
	
	if (typeof module === "undefined") parc = compileParser;
	else module.exports = compileParser;
})();

