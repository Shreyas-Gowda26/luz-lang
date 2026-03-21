<p align="center">
  <img src="img/icon.png" alt="Luz logo" width="676" height="369">
</p>

# Luz Programming Language

**Luz** is a lightweight, interpreted programming language written in Python. Designed to be simple, readable, and easy to learn.

```
name = listen("What is your name? ")
write($"Hello {name}!")

for i = 1 to 5 {
    if even(i) {
        write($"{i} is even")
    } else {
        write($"{i} is odd")
    }
}
```

## Features

- **Dynamic typing** — integers, floats, strings, booleans, lists, dictionaries, `null`
- **Format strings** — `$"Hello {name}, you are {age} years old!"`
- **Control flow** — `if / elif / else`, `while`, `for` (range and for-each), `break`, `continue`, `pass`
- **Functions** — user-defined functions with closures and return values
- **Lambdas** — `fn(x) => x * 2` and `fn(x) { body }` as first-class values
- **Object-oriented programming** — classes, inheritance (`extends`), method overriding, `super`
- **Polymorphism** — duck typing, `typeof()`, and `instanceof()`
- **Error handling** — `attempt / rescue` blocks and `alert`
- **Modules** — `import` other `.luz` files
- **Package manager** — [Ray](#package-manager-ray), installs packages from GitHub
- **Standard library** — `luz-math` included out of the box
- **Math built-ins** — `abs`, `sqrt`, `floor`, `ceil`, `round`, `clamp`, `max`, `min`, `sign`, `odd`, `even`
- **Helpful errors** — every error includes the line number
- **REPL** — interactive shell for quick experimentation
- **VS Code extension** — syntax highlighting, autocompletion, error detection, hover docs, snippets
- **Standalone installer** — no Python required

## Quick start

Requires **Python 3.8+**, no external dependencies.

```bash
git clone https://github.com/Elabsurdo984/luz-lang.git
cd luz-lang
python main.py          # open the REPL
python main.py file.luz # run a file
```

Or download the **[Windows installer](https://elabsurdo984.github.io/luz-lang/download/)** and run `luz` from anywhere.

## Package manager — Ray

Ray installs Luz packages from GitHub into `luz_modules/`:

```bash
ray init                        # create luz.json
ray install user/repo           # install a package
ray list                        # list installed packages
ray remove package-name         # remove a package
```

The standard library (`luz-math`) is included automatically with the installer.

## Standard library

`luz-math` is bundled with Luz and available without installing anything:

```
import "math"

write(PI)                        # 3.14159265358979
write(factorial(10))             # 3628800
write(round(sin(to_rad(90)), 4)) # 1.0
write(mean([1, 2, 3, 4, 5]))     # 3.0
```

Includes: constants, number theory, trigonometry, logarithms, geometry, statistics.

## VS Code extension

Install from the `vscode-luz/` folder for full language support:

- Syntax highlighting
- Autocompletion — keywords, built-ins, user-defined symbols
- Error detection — syntax errors underlined on save
- Hover documentation — descriptions for all built-in functions
- Snippets — `function`, `class`, `for`, `attempt`, and more

## Documentation

Full language reference, built-in functions, and architecture guide:
**[elabsurdo984.github.io/luz-lang](https://elabsurdo984.github.io/luz-lang/)**

## License

MIT — see [LICENSE](LICENSE) for details.
