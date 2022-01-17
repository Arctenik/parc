
		parse = (function() {
			function parse(text, transformers) {
				let result = parseExprs(parseTokens(text));
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
			
			function parseExprs(tokens) {
				let i = 0,
					result = parse_parser();
				
				if (i < tokens.length || !result) badSyntax();
				
				return result[0];
				
				
				
				function parse_parser() {
					let result = [];
					
							if (!(collect(parse_ruleset(), result))) {
								badSyntax();
							}
						

							if (!(collect(match("equals"), result))) {
								badSyntax();
							}
						

							if (!(collect(parse_ruleset(), result))) {
								badSyntax();
							}
						
					return [{type: "parser", value: result}];
					
					
				}
			

				function parse_ruleset() {
					let result = [];
					
							
						if (collect(parse_rule(), result)) {
							while(collect(parse_rule(), result)) {};
							
							
						} else
					 {
								return false;
							}
						
					return [{type: "ruleset", value: result}];
					
					
				}
			

				function parse_rule() {
					let result = [];
					
							
						if (collect(match("name"), result)) {
							
							
							
							if (!(collect(parse_ruleprops(), result))) {
								badSyntax();
							}
						

							if (!(collect(parse_group(), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return [{type: "rule", value: result}];
					
					
				}
			

				function parse_ruleprops() {
					let result = [];
					collect(match("star"), result)
collect(match("arrow"), result)
					return [{type: "ruleprops", value: result}];
					
					
				}
			

				function parse_group() {
					let result = [];
					
							
						if (match("{")) {
							
							
							
							if (!(collect(parse_groupcontent(), result))) {
								badSyntax();
							}
						

							if (!(match("}"))) {
								badSyntax();
							}
						
						} else
					 {
								
							
						if (match("(")) {
							
							
							
							if (!(collect(parse_groupcontent(), result))) {
								badSyntax();
							}
						

							if (!(match(")"))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
							}
						
					return [{type: "group", value: result}];
					
					
				}
			

				function parse_groupcontent() {
					let result = [];
					parseGroup0()
					return result;
					
					
						function parseGroup1() {
							
							
						if (match("/")) {
							
							
							
							if (!(collect(parse_branch(), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
							return true;
						}
					

						function parseGroup0() {
							
							
						if (collect(parse_branch(), result)) {
							
							while (parseGroup1()) {};
							
						} else
					 {
								return false;
							}
						
							return true;
						}
					
				}
			

				function parse_branch() {
					let result = [];
					
							
						if (collect(parse_expression(), result)) {
							while(collect(parse_expression(), result)) {};
							collect(parse_cond(), result)
							
						} else
					 {
								return false;
							}
						
					return [{type: "branch", value: result}];
					
					
				}
			

				function parse_cond() {
					let result = [];
					
							
						if (match(">")) {
							
							while (collect(parse_expression(), result)) {};
							
						} else
					 {
								return false;
							}
						
					return [{type: "cond", value: result}];
					
					
				}
			

				function parse_expression() {
					let result = [];
					
							
						if (parseGroup0()) {
							
							collect(parse_exprmod(), result)
							
						} else
					 {
								return false;
							}
						
					return [{type: "expression", value: result}];
					
					
						function parseGroup0() {
							
							if (!(collect(match("dot"), result))) {
								
							if (!(collect(match("name"), result))) {
								
							if (!(collect(match("string"), result))) {
								
							if (!(collect(match("chars"), result))) {
								
							if (!(collect(parse_group(), result))) {
								return false;
							}
						
							}
						
							}
						
							}
						
							}
						
							return true;
						}
					
				}
			

				function parse_exprmod() {
					let result = [];
					
							if (!(collect(match("star"), result))) {
								
							if (!(collect(match("plus"), result))) {
								
							if (!(collect(match("question"), result))) {
								return false;
							}
						
							}
						
							}
						
					return result;
					
					
				}
			
				
				
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
					result = parse_tokens();
				
				if (i < text.length || !result) badSyntax();
				
				return result;
				
				
				
				function parse_tokens() {
					let result = [];
					while (matchChars(/[ \t\r\n]/)) {};
while (parseGroup0()) {};
					return result;
					
					
						function parseGroup0() {
							
							
						if (collect(parse_token(), result)) {
							
							
							while (matchChars(/[ \t\r\n]/)) {};
						} else
					 {
								return false;
							}
						
							return true;
						}
					
				}
			

				function parse_token() {
					let result = [];
					
							if (!(collect(parse_specialsyntax(), result))) {
								
							if (!(collect(parse_string(), result))) {
								
							if (!(collect(parse_chars(), result))) {
								
							if (!(collect(parse_name(), result))) {
								return false;
							}
						
							}
						
							}
						
							}
						
					return result;
					
					
				}
			

				function parse_specialsyntax() {
					let result = [];
					
							if (!(collect(parse_arrow(), result))) {
								
							if (!(collect(parse_equals(), result))) {
								
							if (!(collect(parse_star(), result))) {
								
							if (!(collect(parse_plus(), result))) {
								
							if (!(collect(parse_question(), result))) {
								
							if (!(collect(parse_dot(), result))) {
								
							if (!(collect(matchChars(/[{}()\/>]/), result))) {
								return false;
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
					return result;
					
					
				}
			

				function parse_arrow() {
					let result = [];
					
							if (!(collect(match("=>"), result))) {
								return false;
							}
						
					return [{type: "arrow", value: joinTokens(result)}];
					
					
				}
			

				function parse_equals() {
					let result = [];
					
							
						if (collect(match("="), result)) {
							while(collect(match("="), result)) {};
							
							
						} else
					 {
								return false;
							}
						
					return [{type: "equals", value: joinTokens(result)}];
					
					
				}
			

				function parse_star() {
					let result = [];
					
							if (!(collect(match("*"), result))) {
								return false;
							}
						
					return [{type: "star", value: joinTokens(result)}];
					
					
				}
			

				function parse_plus() {
					let result = [];
					
							if (!(collect(match("+"), result))) {
								return false;
							}
						
					return [{type: "plus", value: joinTokens(result)}];
					
					
				}
			

				function parse_question() {
					let result = [];
					
							if (!(collect(match("?"), result))) {
								return false;
							}
						
					return [{type: "question", value: joinTokens(result)}];
					
					
				}
			

				function parse_dot() {
					let result = [];
					
							if (!(collect(match("."), result))) {
								return false;
							}
						
					return [{type: "dot", value: joinTokens(result)}];
					
					
				}
			

				function parse_name() {
					let result = [];
					
							
						if (collect(matchChars(/[a-zA-Z_]/), result)) {
							
							collect(parse_nametail(), result)
							
						} else
					 {
								return false;
							}
						
					return [{type: "name", value: joinTokens(result)}];
					
					
				}
			

				function parse_nametail() {
					let result = [];
					
							
						if (collect(matchChars(/[a-zA-Z0-9_]/), result)) {
							while(collect(matchChars(/[a-zA-Z0-9_]/), result)) {};
							
							
						} else
					 {
								return false;
							}
						
					return [{type: "nametail", value: joinTokens(result)}];
					
					
				}
			

				function parse_string() {
					let result = [];
					
							
						if (collect(match("\""), result)) {
							
							
							while (collect(parse_stritem(), result)) {};

							if (!(collect(match("\""), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return [{type: "string", value: joinTokens(result)}];
					
					
				}
			

				function parse_stritem() {
					let result = [];
					
							
						if (collect(match("\\"), result)) {
							
							
							
							if (!(collect(matchAny(), result))) {
								badSyntax();
							}
						
						} else
					 {
								
							if (!(collect(matchChars(/[^"]/), result))) {
								return false;
							}
						
							}
						
					return [{type: "stritem", value: joinTokens(result)}];
					
					
				}
			

				function parse_chars() {
					let result = [];
					
							
						if (collect(match("["), result)) {
							
							
							while (collect(parse_charsitem(), result)) {};

							if (!(collect(match("]"), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return [{type: "chars", value: joinTokens(result)}];
					
					
				}
			

				function parse_charsitem() {
					let result = [];
					
							
						if (collect(match("\\"), result)) {
							
							
							
							if (!(collect(matchAny(), result))) {
								badSyntax();
							}
						
						} else
					 {
								
							if (!(collect(matchChars(/[^\]]/), result))) {
								return false;
							}
						
							}
						
					return [{type: "charsitem", value: joinTokens(result)}];
					
					
				}
			
				
				
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
	