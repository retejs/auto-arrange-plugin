import { AutoArrange } from './auto-arrange';

function install(editor, { margin = { x: 50, y: 50 }, depth = null }) {
    editor.bind('arrange');

    const ar = new AutoArrange(editor, margin, depth);
    
    editor.on('arrange', ({ node }) => ar.arrange(node));

    editor.arrange = node => {
        console.log(`Deprecated: use editor.trigger('arrange', { node }) instead`);
        ar.arrange(node);
    }
}

export default {
    name: 'auto-arrange',
    install
}