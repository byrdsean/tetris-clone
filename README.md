# Tetris Clone

<!-- This is a tetris clone written in HTML, CSS and Typescript/Javascript. -->
This is a tetris clone written in HTML, CSS and Javascript.

## Compilation instructions (using NPM)
### Sass
1. In root, install Sass compiler: 
    ```
    npm install -g sass
    ```
2. Start compilation of sass to css:
    ```
    sass styles/sass:styles --watch
    ```
     Run the sass compiler on files in ~/styles/sass, and output to ~/styles.

     "--watch" will keep the compiler running and watches for changes

### Node modules

To restore any missing node modules, run this command in the root of the project:
```
npm install
```

<!-- ### Typescript
1. Install Typescript compiler
    ```
    npm install -g typescript
    ```
2. Create tsconfig.json
    ```
    tsc --init
    ```
3. Set the following attributes to the tsconfig.json file
    ```
    "module": "system",
    "outFile": "./scripts/tetris-logic.js",
    "rootDir": "./scripts/typescript/",
    ```
4. Start compilation of typescript to javascript:
    ```
    tsc --project ./ --watch
    ```

    "--watch" will keep the compiler running and watches for changes -->

## Build commands
You can add multiple commands to package.json that will execute when you build the project.

<!-- To add the typescript and javascript commands:
1. In package.json, in the "scripts" section, add:
    ```
    "build": "tsc --project ./ && sass styles/sass:styles"
    ```

    This will run the typescript compiler, then sass compiler (in that order).

2. Run this command to build:
    ```
    npm run build
    ``` -->

To add the sass commands:
1. In package.json, in the "scripts" section, add:
    ```
    "build": "sass styles/sass:styles"
    ```

    This will run the sass compiler.

2. Run this command to build:
    ```
    npm run build
    ```

## Future Improvements
1. Add ability to pause game.
2. Update UI displaying points.
3. Make html mobile responsive.
4. When level is completed, display message that user needs to press "Enter" to start next level.
5. Re-style overall UI.