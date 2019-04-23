import { AutoArrange } from './auto-arrange';


function install(editor, { margin = { x: 50, y: 50 }, depth = null }) {

    const ar = new AutoArrange(editor, margin, depth);

    editor.arrange = ar.arrange.bind(ar);
}

export default {
    name: 'auto-arrange',
    install
}