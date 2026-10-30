# Calculator Web App

A responsive, accessible calculator built with HTML5, CSS3 and vanilla JavaScript.

## Features
- Addition, subtraction, multiplication and division
- Decimal numbers, sign toggle and percentage
- Keyboard input: digits, `.`, `+`, `-`, `*`, `/`
- Enter or `=` to calculate
- Backspace to delete one character
- Escape or Delete to clear
- Division-by-zero and invalid-expression handling
- Safe expression parser using the shunting-yard algorithm (does not use `eval`)
- Responsive layout and visible keyboard focus states

## Run in VS Code
1. Extract the ZIP and open the `calculator-web-app` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **Open with Live Server**.

Or run from the project directory:
```powershell
python -m http.server 5500
```
Open `http://localhost:5500`.

## Deploy to Vercel
Push the project to GitHub, import the repository in Vercel, choose Framework Preset **Other**, leave the build command blank, and use `.` as the output directory.

## Files
- `index.html` — calculator structure
- `style.css` — responsive styling
- `script.js` — calculator logic and keyboard events
