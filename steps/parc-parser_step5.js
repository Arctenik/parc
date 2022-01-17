
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
					let result = initResult("parser");
					
							if (!(collect(parse_ruleset(), result))) {
								badSyntax();
							}
						

							if (!(collect(match("equals"), result))) {
								badSyntax();
							}
						

							if (!(collect(parse_ruleset(), result))) {
								badSyntax();
							}
						
					return processResult(result);
					
					
				}
			

				function parse_ruleset() {
					let result = initResult("ruleset");
					
							
						if (collect(parse_rule(), result)) {
							while(collect(parse_rule(), result)) {};
							
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_rule() {
					let result = initResult("rule");
					
							
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
						
					return processResult(result);
					
					
				}
			

				function parse_ruleprops() {
					let result = initResult("ruleprops");
					collect(match("star"), result)
collect(parse_rulearrow(), result)
					return processResult(result);
					
					
				}
			

				function parse_rulearrow() {
					let result = initResult("rulearrow");
					
							
						if (collect(match("arrow"), result)) {
							
							collect(match("name"), result)
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_group() {
					let result = initResult("group");
					
							
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
						
					return processResult(result);
					
					
				}
			

				function parse_groupcontent() {
					let result = initResult();
					
							
						if (collect(parse_uncondbranch(), result)) {
							
							match("lb")
						} else
					 {
								
							
						if (collect(parse_branch(), result)) {
							
							collect(parse_groupcontenttail(), result)
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_groupcontenttail() {
					let result = initResult();
					
							
						if (match("/")) {
							
							
							if (!(collect(parse_groupcontent(), result))) {
								badSyntax();
							}
						
						} else
					 {
								
							
						if (match("lb")) {
							
							collect(parse_groupcontent(), result)
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_branch() {
					let result = initResult("branch");
					
							
						if (collect(parse_offsets(), result)) {
							
							collect(parse_expression(), result)
collect(parse_cond(), result)
collect(parse_brancharrow(), result)
						} else
					 {
								
							
						if (collect(parse_expression(), result)) {
							
							collect(parse_cond(), result)
collect(parse_brancharrow(), result)
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_offsets() {
					let result = initResult("offsets");
					
							
						if (collect(parse_offset(), result)) {
							while(collect(parse_offset(), result)) {};
							
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_uncondbranch() {
					let result = initResult("branch");
					
							
						if (collect(parse_cond(), result)) {
							
							collect(parse_brancharrow(), result)
						} else
					 {
								
							if (!(collect(parse_brancharrow(), result))) {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_cond() {
					let result = initResult("cond");
					
							
						if (match(">")) {
							
							while (collect(parse_expression(), result)) {};
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_brancharrow() {
					let result = initResult("brancharrow");
					
							
						if (collect(match("arrow"), result)) {
							
							collect(match("name"), result)
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_expression() {
					let result = initResult("expression");
					
							if (!(collect(parse_offset(), result))) {
								
							
						if (collect(parse_unmoddedexpr(), result)) {
							
							collect(parse_exprmod(), result)
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_offset() {
					let result = initResult("offset");
					
							
						if (collect(match("number"), result)) {
							
							
							if (!(collect(match("offsettype"), result))) {
								badSyntax();
							}
						

							if (!(collect(parse_literal(), result))) {
								badSyntax();
							}
						
						} else
					 {
								
							
						if (collect(match("offsettype"), result)) {
							
							
							if (!(collect(parse_literal(), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_unmoddedexpr() {
					let result = initResult();
					
							
						if (collect(match("colon"), result)) {
							
							
							if (!(collect(parse_nongroupbase(), result))) {
								badSyntax();
							}
						
						} else
					 {
								
							if (!(collect(parse_baseexpr(), result))) {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_baseexpr() {
					let result = initResult();
					
							if (!(collect(parse_nongroupbase(), result))) {
								
							if (!(collect(parse_group(), result))) {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_nongroupbase() {
					let result = initResult();
					
							if (!(collect(parse_literal(), result))) {
								
							if (!(collect(match("name"), result))) {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_literal() {
					let result = initResult();
					
							if (!(collect(match("dot"), result))) {
								
							if (!(collect(match("string"), result))) {
								
							if (!(collect(match("chars"), result))) {
								return false;
							}
						
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_exprmod() {
					let result = initResult();
					
							if (!(collect(match("star"), result))) {
								
							if (!(collect(match("plus"), result))) {
								
							if (!(collect(match("question"), result))) {
								return false;
							}
						
							}
						
							}
						
					return processResult(result);
					
					
				}
			
				
				
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
					result = parse_tokens();
				
				if (i < text.length || !result) badSyntax();
				
				return result;
				
				
				
				function parse_tokens() {
					let result = initResult();
					while (matchChars(/[ \t\r\n]/)) {};
while (parseGroup0()) {};
					return processResult(result);
					
					
						function parseGroup0() {
							
							
						if (collect(parse_grouportoken(), result)) {
							
							while (matchChars(/[ \t\r\n]/)) {};
						} else
					 {
								return false;
							}
						
							return true;
						}
					
				}
			

				function parse_grouportoken() {
					let result = initResult();
					
							if (!(collect(parse_grouptokens(), result))) {
								
							if (!(collect(parse_token(), result))) {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_grouptokens() {
					let result = initResult();
					
							
						if (collect(parse_openbracket(), result)) {
							
							while (matchChars(/[ \t\r\n]/)) {};

							if (!(collect(parse_groupcontent(), result))) {
								badSyntax();
							}
						

							if (!(collect(parse_closebracket(), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_groupcontent() {
					let result = initResult();
					while (parseGroup0()) {};
					return processResult(result);
					
					
						function parseGroup0() {
							
							
						if (collect(parse_grouportoken(), result)) {
							
							collect(parse_groupws(), result)
						} else
					 {
								return false;
							}
						
							return true;
						}
					
				}
			

				function parse_groupws() {
					let result = initResult();
					
							
						if (matchChars(/[ \t\r]/)) {
							while(matchChars(/[ \t\r]/)) {};
							parseGroup0()
						} else
					 {
								
							
						if (collect(parse_lb(), result)) {
							
							while (matchChars(/[ \t\r\n]/)) {};
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
						function parseGroup0() {
							
							
						if (collect(parse_lb(), result)) {
							
							while (matchChars(/[ \t\r\n]/)) {};
						} else
					 {
								return false;
							}
						
							return true;
						}
					
				}
			

				function parse_lb() {
					let result = initResult("lb");
					
							if (!(collect(match("\n"), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_openbracket() {
					let result = initResult();
					
							if (!(collect(matchChars(/[{(]/), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_closebracket() {
					let result = initResult();
					
							if (!(collect(matchChars(/[})]/), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_token() {
					let result = initResult();
					
							if (!(collect(parse_specialsyntax(), result))) {
								
							if (!(collect(parse_string(), result))) {
								
							if (!(collect(parse_chars(), result))) {
								
							if (!(collect(parse_number(), result))) {
								
							if (!(collect(parse_name(), result))) {
								return false;
							}
						
							}
						
							}
						
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_specialsyntax() {
					let result = initResult();
					
							if (!(collect(parse_arrow(), result))) {
								
							if (!(collect(parse_equals(), result))) {
								
							if (!(collect(parse_star(), result))) {
								
							if (!(collect(parse_plus(), result))) {
								
							if (!(collect(parse_question(), result))) {
								
							if (!(collect(parse_dot(), result))) {
								
							if (!(collect(parse_offsettype(), result))) {
								
							if (!(collect(parse_colon(), result))) {
								
							if (!(collect(matchChars(/[\/>]/), result))) {
								return false;
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_offsettype() {
					let result = initResult("offsettype");
					
							if (!(collect(matchChars(/[&!]/), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_colon() {
					let result = initResult("colon");
					
							if (!(collect(matchChars(/[:;]/), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_arrow() {
					let result = initResult("arrow");
					
							if (!(collect(match("=>"), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_equals() {
					let result = initResult("equals");
					
							
						if (collect(match("="), result)) {
							while(collect(match("="), result)) {};
							
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_star() {
					let result = initResult("star");
					
							if (!(collect(match("*"), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_plus() {
					let result = initResult("plus");
					
							if (!(collect(match("+"), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_question() {
					let result = initResult("question");
					
							if (!(collect(match("?"), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_dot() {
					let result = initResult("dot");
					
							if (!(collect(match("."), result))) {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_name() {
					let result = initResult("name");
					
							
						if (collect(matchChars(/[a-zA-Z_]/), result)) {
							
							collect(parse_nametail(), result)
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_nametail() {
					let result = initResult("nametail");
					
							
						if (collect(matchChars(/[a-zA-Z0-9_]/), result)) {
							while(collect(matchChars(/[a-zA-Z0-9_]/), result)) {};
							
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_number() {
					let result = initResult("number");
					
							
						if (collect(match("-"), result)) {
							
							
							if (collect(matchChars(/[0-9]/), result)) {
								while (collect(matchChars(/[0-9]/), result)) {};
							} else {
								return false;
							}
						
						} else
					 {
								
							
						if (collect(matchChars(/[0-9]/), result)) {
							while(collect(matchChars(/[0-9]/), result)) {};
							
						} else
					 {
								return false;
							}
						
							}
						
					return processResult(result);
					
					
				}
			

				function parse_string() {
					let result = initResult("string");
					
							
						if (collect(match("\""), result)) {
							
							while (collect(parse_stritem(), result)) {};

							if (!(collect(match("\""), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_stritem() {
					let result = initResult("stritem");
					
							
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
						
					return processResult(result);
					
					
				}
			

				function parse_chars() {
					let result = initResult("chars");
					
							
						if (collect(match("["), result)) {
							
							while (collect(parse_charsitem(), result)) {};

							if (!(collect(match("]"), result))) {
								badSyntax();
							}
						
						} else
					 {
								return false;
							}
						
					return processResult(result);
					
					
				}
			

				function parse_charsitem() {
					let result = initResult("charsitem");
					
							
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
						
					return processResult(result);
					
					
				}
			
				
				
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
	