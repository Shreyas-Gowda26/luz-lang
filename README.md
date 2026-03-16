# Luz Programming Language 💡

**Luz** es un lenguaje de programación interpretado, educativo y sencillo, escrito íntegramente en Python.

## Características
- **Aritmética básica**: Soporte para `+`, `-`, `*`, `/` con precedencia de operadores.
- **Variables**: Asignación dinámica de variables.
- **Strings**: Soporte para cadenas de texto, concatenación y multiplicación.
- **Estructuras de Control**: `if`, `elif`, `else`.
- **Bucles**: `while` y `for` (estilo rango).
- **Funciones Integradas**:
  - `write(...)`: Imprime en consola (como `print`).
  - `listen(prompt)`: Recibe entrada del usuario (como `input`).

## Ejemplo de Código
```luz
name = listen("¿Cómo te llamas? ")
write("Hola", name)

for i = 1 to 5 {
    if i == 3 {
        write("¡El número tres es mi favorito!")
    } else {
        write("Iteración:", i)
    }
}
```

## Instalación y Uso
1. Asegúrate de tener Python 3 instalado.
2. Clona este repositorio.
3. Ejecuta el REPL:
   ```bash
   python main.py
   ```
