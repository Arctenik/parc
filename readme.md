A simple parser generator

The "steps" folder shows steps in the devepment (perhaps an excessive number of them); the main point of interest is the bootstrapping at the beginning

This is not intended for practical purposes but I might continue using it for stuff so I'm gonna provide a bit of documentation here 

## Syntax

### Rulesets

A parser is separated into an expression parser ruleset and a token parser ruleset (in that order), delineated by a sequence of any number of equals signs; the token parser operates on a sequence of characters, and the expression parser operates on the sequence of tokens output by the token parser

Each ruleset consists of a sequence of rules; the first rule listed is the initial rule used when parsing

### Rules

A rule consists of a name, optional rule properties, and a group expression; for example:
```
groupcontent => {
	uncondbranch > "lb"?
	branch > groupcontenttail?
}
```
(`=>` is a rule property that affects return type)

### Rule properties

The two rule properties, which are both optional, are return mode and return type

The default return mode is select-return for expression rules, and full-return for token rules

An asterisk placed after the rule name will set the mode to select-return, and the return type to adaptive

After the rule name and the optional asterisk there can be a return type expression, consisting of `=>` followed by a name; an arrow without a name indicates an adaptive return type, an arrow with a name sets the return type to that name, and if there's no return type expression, the return type is the rule name

The return mode determines which expressions from the body of the rule are collected in the result; in select-return mode strings and character sets are not returned, while in full-return mode they are (other kinds of expressions may or may not be returned, but aren't affected by return mode)

For a return type that's specific rather than adaptive, the results of the expressions matched and collected in the rule body are combined into an object marked with the given type; in the expression parser these results are listed in an array, while in the token parser the results' values are concatenated into a single string

For adaptive return type, the collected return expressions are each returned individually instead of being combined into one object

Also, on the subject of types - in the token parser, an expression without an assigned type will have a type equal to the sequence of matched characters (e.g. an adaptive-return rule containing a string match will return a token with a type equal to the matched string)

### Group expressions

A group expression consists of either parentheses or curly brackets enclosing a sequence of branches, each pair of branches being separated by either a line break or a slash

Branches represent different paths that the parser can take; each branch consists of:
* A "predictable" expression
* An optional conditional expression
* An optional return type expression (using the same syntax as described previously)

A predictable expression is one where you can determine whether it matches without moving forward in the input; in practice this is defined as zero or more offset-match expressions followed by an optional individual expression of any type

A conditional expression consists of a greater-than symbol followed by any sequence of zero or more individual expressions

If the predictable expression is empty, a conditional expression must be present (though it may also be empty, consisting only of a greater-than symbol); additionally, only the final branch may have an empty predictable expression

Matching a rule proceeds as follows:
* The branches are gone through in order
* Each branch tries to match its predictable expression; if the predictable expression succeeds and the branch has no conditional expression, the branch has successfully matched; if the predictable expression succeeds and the branch does have a conditional expression, then the conditional expression attempts to match, causing the branch to successfully match if it succeeds and causing a syntax error otherwise
* If a branch successfully matches, then its matched expressions are returned according to the rule properties and any return type expressions present in the branch
* If a branch doesn't match (and doesn't give an error), then the next branch tries to match

### Individual expressions

A literal expression (string, character set, or wildcard) can be prefixed with a number (which may be omitted for 0) and either an ampersand or an exclamation point, to produce an offset match or an inverse offset match respectively (neither of which will produce output or change the parser's position in the input); e.g. in a token rule, `-1&"a"` matches if the previous character is "a", and `2!"z"` matches if there is NOT a "z" two characters ahead

A non-group expression can be prefixed with a colon to include it in output, or a semicolon to remove it from output

An expression can be suffixed with a question mark for an optional match, an asterisk to match zero or more times, or a plus sign to match one or more times

A group can be used as an expression and behaves equivalently to an adaptive-return rule, with the exception that any return type expressions in the group will affect the return type of the containing rule

A name (i.e. a sequence of characters in the set `[a-zA-Z_]`) produces output by default; it matches against a rule if a rule with that name exists in the current ruleset, and matches like a string otherwise

A string in an expression rule matches a token with that type, and in a token rule matches that sequence of characters; strings are enclosed in double-quotes, and may contain certain escape sequences: `\t` for tab, `\r` for carriage return, `\n` for line feed, `\u<hex digits>;` for the character with hexadecimal unicode value `<hex digits>`, and `\<any other character>` for `<any other character>`

A character set (only valid in a token rule) matches a single character from a given set, written as square brackets enclosing a list of characters and character ranges; a character range consists of two characters separated by a dash, and matches any characters in the range between those two (inclusive); a carat may be placed after the openining bracket to invert the set; and escape sequences may be used in the same way as with strings

A wildcard, written as a period, produces output by default and matches any single token or character (for expression and token rules respectively)

### Summary of differences between token and expression parsers

- A token rule matches against a sequence of characters, while an expression rule matches against a sequence of tokens
- A string in a token rule matches multiple characters, while a string in an expression rule matches a single token's type (these also apply to names that don't refer to rules)
- Character sets can only be used in token rules
- A token rule only returns tokens, while an expression rule may return matched tokens without an enclosing expression; a matched string in a token rule returns a token with a type equal to the matched string
- Tokens returned by a token rule may end up concatenated by a specific-return rule, or may end up ultimately getting returned as separate tokens by an adaptive-return initial rule (on the other hand, objects returned by expression rules will (in theory - see below) always be collected as separate objects within an expression)
- The initial rule of a token parser should be adaptive-return, while the intial rule of an expression parser should be specific-return (though these may not enforced, or may be implicitly encouraged, e.g. parc-js returning only the first expression returned by the initial rule)
- Token rules are full-return by default, while expression rules are select-return

### Summary of when matches are included in output

- An offset match never produces output
- A name or group always produces output unless excluded with a semicolon (or at least, has the potential to produce output; groups as well as names that refer to rules will return according to the contents of the group/rule)
- Anything else returns according to the colon/semicolon prefix if present, or the return mode of the containing rule otherwise

## parc-js

The global variable `parc`, or `module.exports` if available, contains the `compileParser` function, which has two properties -- `compileParser`, storing the function itself, and `parse`, the parser for the parc language

`compileParser` takes two arguments, the parser source code and the variable/property name to store the parser in (the latter may be omitted, in which case just an expression representing the parser is returned)

The compiled parser is a function with three properties:
* `parse` -- the function itself
* `tokenize` -- takes input code and applies only the token parser
* `getLocationInfo` -- takes two arguments: an index representing a location in the code, and the code itself; returns an object describing that location in the code, with properties `index`, `line`, and `indexInLine` (all zero-based)

The `parse` function takes input code and an optional "tansformers" object; if the latter is present, the result expressions are modified recursively according to the functions contained in the object

Each result object has three properties -- `index`, `type`, and `value`

The transformers object contains functions indexed by expression/token type; when an object of the given type is encountered, its value is passed to that function, which should return a new object (also i don't seem to have a way of retaining the index information oops)
