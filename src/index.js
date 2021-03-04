import { AutoArrange } from './auto-arrange';

function install(editor, { margin = { x: 50, y: 50 }, depth = null, vertical = false }) {
    editor.bind('arrange');

    const ar = new AutoArrange(editor, margin, depth, vertical);
    
    editor.on('arrange', ({ node, ...options }) => ar.arrange(node, options));

    editor.arrange = node => {
        console.log(`Deprecated: use editor.trigger('arrange', { node }) instead`);
        ar.arrange(node);
    }
}

export default {
    name: 'auto-arrange',
    install
}
