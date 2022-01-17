
			parc.parse = (function() {
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
						result = parse_parser();
					
					if (i < tokens.length || !result) badSyntax();
					
					return result[0];
					
					
					
					function parse_parser() {
						let result = initResult(i, "parser");
						
								
								if (!(collect(parse_ruleset(), result))) {
									badSyntax();
								}
							

								if (!(match("equals"))) {
									badSyntax();
								}
							

								if (!(collect(parse_ruleset(), result))) {
									badSyntax();
								}
							
								
							
						return processResult(result);
						
						
					}
				

					function parse_ruleset() {
						let result = initResult(i, "ruleset");
						
								
							if (collect(parse_rule(), result)) {
								while(collect(parse_rule(), result)) {};
								
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_rule() {
						let result = initResult(i, "rule");
						
								
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
						let result = initResult(i, "ruleprops");
						
								collect(match("star"), result)
collect(parse_arrow(), result)
								
							
						return processResult(result);
						
						
					}
				

					function parse_group() {
						let result = initResult(i, "group");
						
								
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
						let result = initResult(i);
						
								
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
						let result = initResult(i);
						
								
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
						let result = initResult(i, "branch");
						
								
							if (collect(parse_offsets(), result)) {
								
								collect(parse_expression(), result)
collect(parse_cond(), result)
collect(parse_arrow(), result)
								
							} else
						 {
									
								
							if (collect(parse_expression(), result)) {
								
								collect(parse_cond(), result)
collect(parse_arrow(), result)
								
							} else
						 {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
					}
				

					function parse_offsets() {
						let result = initResult(i, "offsets");
						
								
							if (collect(parse_offset(), result)) {
								while(collect(parse_offset(), result)) {};
								
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_uncondbranch() {
						let result = initResult(i, "branch");
						
								
							if (collect(parse_cond(), result)) {
								
								collect(parse_arrow(), result)
								
							} else
						 {
									
								if (!(collect(parse_arrow(), result))) {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
					}
				

					function parse_cond() {
						let result = initResult(i, "cond");
						
								
							if (match(">")) {
								
								while (collect(parse_expression(), result)) {};
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_arrow() {
						let result = initResult(i, "arrow");
						
								
							if (match("=>")) {
								
								collect(match("name"), result)
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_expression() {
						let result = initResult(i, "expression");
						
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
						let result = initResult(i, "offset");
						
								
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
						let result = initResult(i);
						
								
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
						let result = initResult(i);
						
								if (!(collect(parse_nongroupbase(), result))) {
									
								if (!(collect(parse_group(), result))) {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
					}
				

					function parse_nongroupbase() {
						let result = initResult(i);
						
								if (!(collect(parse_literal(), result))) {
									
								if (!(collect(match("name"), result))) {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
					}
				

					function parse_literal() {
						let result = initResult(i);
						
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
						let result = initResult(i);
						
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
						result = parse_tokens();
					
					if (i < text.length || !result) badSyntax();
					
					return result;
					
					
					
					function parse_tokens() {
						let result = initResult(i);
						
								collect(parse_anyws(), result)
while (parseGroup0()) {};
								
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								
							if (collect(parse_grouportoken(), result)) {
								
								collect(parse_anyws(), result)
								
							} else
						 {
									return false;
								}
							
								return true;
							}
						
					}
				

					function parse_grouportoken() {
						let result = initResult(i);
						
								if (!(collect(parse_grouptokens(), result))) {
									
								if (!(collect(parse_token(), result))) {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
					}
				

					function parse_grouptokens() {
						let result = initResult(i);
						
								
							if (collect(parse_openbracket(), result)) {
								
								collect(parse_anyws(), result)

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
						let result = initResult(i);
						
								while (parseGroup0()) {};
								
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								
							if (collect(parse_grouportoken(), result)) {
								
								collect(parse_ws(), result)
								
							} else
						 {
									return false;
								}
							
								return true;
							}
						
					}
				

					function parse_ws() {
						let result = initResult(i);
						
								
							if (parse_linews()) {
								while(parse_linews()) {};
								parseGroup0()
								
							} else
						 {
									
								
							if (collect(parse_lb(), result)) {
								
								collect(parse_anyws(), result)
								
							} else
						 {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								
							if (collect(parse_lb(), result)) {
								
								collect(parse_anyws(), result)
								
							} else
						 {
									return false;
								}
							
								return true;
							}
						
					}
				

					function parse_lb() {
						let result = initResult(i, "lb");
						
								if (!(collect(match("\n"), result))) {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_linews() {
						let result = initResult(i, "linews");
						
								
							if (parseGroup0()) {
								while(parseGroup0()) {};
								
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								if (!(collect(matchChars(/[ \t\r]/), result))) {
									
								if (!(collect(parse_comment(), result))) {
									return false;
								}
							
								}
							
								return true;
							}
						
					}
				

					function parse_comment() {
						let result = initResult(i, "comment");
						
								
							if (collect(match("//"), result)) {
								
								while (collect(matchChars(/[^\n]/), result)) {};
								
							} else
						 {
									
								
							if (collect(match("/*"), result)) {
								
								while (parseGroup0()) {};

								if (!(collect(match("*/"), result))) {
									badSyntax();
								}
							
								
							} else
						 {
									return false;
								}
							
								}
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								if (!(!(match("*/", 0)) && collect(matchAny(), result))) {
									return false;
								}
							
								return true;
							}
						
					}
				

					function parse_anyws() {
						let result = initResult(i);
						
								
							if (parseGroup0()) {
								while(parseGroup0()) {};
								
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
							function parseGroup0() {
								
								if (!(matchChars(/[ \t\r\n]/))) {
									
								if (!(parse_comment())) {
									return false;
								}
							
								}
							
								return true;
							}
						
					}
				

					function parse_openbracket() {
						let result = initResult(i);
						
								if (!(collect(matchChars(/[{(]/), result))) {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_closebracket() {
						let result = initResult(i);
						
								if (!(collect(matchChars(/[})]/), result))) {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_token() {
						let result = initResult(i);
						
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
						let result = initResult(i);
						
								if (!(collect(match("=>"), result))) {
									
								
							if (collect(match("="), result)) {
								while(collect(match("="), result)) {};
								
								result.type = "equals";
							} else
						 {
									
								
							if (collect(match("*"), result)) {
								
								
								result.type = "star";
							} else
						 {
									
								
							if (collect(match("+"), result)) {
								
								
								result.type = "plus";
							} else
						 {
									
								
							if (collect(match("?"), result)) {
								
								
								result.type = "question";
							} else
						 {
									
								
							if (collect(match("."), result)) {
								
								
								result.type = "dot";
							} else
						 {
									
								
							if (collect(matchChars(/[&!]/), result)) {
								
								
								result.type = "offsettype";
							} else
						 {
									
								
							if (collect(matchChars(/[:;]/), result)) {
								
								
								result.type = "colon";
							} else
						 {
									
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
				

					function parse_name() {
						let result = initResult(i, "name");
						
								
							if (collect(matchChars(/[a-zA-Z_]/), result)) {
								
								collect(parse_nametail(), result)
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_nametail() {
						let result = initResult(i, "nametail");
						
								
							if (collect(matchChars(/[a-zA-Z0-9_]/), result)) {
								while(collect(matchChars(/[a-zA-Z0-9_]/), result)) {};
								
								
							} else
						 {
									return false;
								}
							
						return processResult(result);
						
						
					}
				

					function parse_number() {
						let result = initResult(i, "number");
						
								
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
						let result = initResult(i, "string");
						
								
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
						let result = initResult(i, "stritem");
						
								
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
						let result = initResult(i, "chars");
						
								
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
						let result = initResult(i, "charsitem");
						
								
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
					let i = code.indexOf("\n"),
						prevI = -1,
						j = 0;
					
					while (i < index && i !== -1) {
						prevI = i;
						i = code.indexOf("\n", i + 1);
						j++;
					}
					
					return {index, line: j, indexInLine: index - prevI - 1};
				}
				
				
				parse.tokenize = function tokenize(text) {
					return parseTokens(text);
				}
				
				parse.getLocationInfo = getLocationInfo;
				
				
				return parse;
			})();
		