## jlc-pos-correction

This is a program written in javascript/node to correct the "pos" file for assembly using JLCPCB.com


[JLC instructions](https://support.jlcpcb.com/article/44-how-to-export-kicad-pcb-to-gerber-files) to fix the position file.

### Usage
*  Install package via yarn or npm
*  Run command
    - `node app.js input.pos`
*  This creates a file `input-jlc.pos` as an output
*  Here is another example with full paths on my mac: `node app.js /Users/nams/Documents/projects/supercables_electronics/pmos_board/ge
rbers/fix_jst_sh/pmos_board-top-pos.csv`


