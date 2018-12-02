class AutoArrange {
    constructor(editor, margin) {
        this.editor = editor;
        this.margin = margin;
    }

    getOutputNodes(node) {
        const nodes = [];

        for(let output of node.outputs.values())
            for(let connection of output.connections.values())
                nodes.push(connection.input.node);
            
        return nodes;
    }

    arrangeOutputs(node = this.editor.nodes[0]) {
        this.getOutputNodes(node).map(n => {
            const offsetX = this.margin.x + this.editor.view.nodes.get(node).el.clientWidth;

            n.position[0] = node.position[0] + offsetX;
            // console.log(n)
            this.editor.view.nodes.get(n).update();
            this.editor.view.updateConnections({ node: n });
            this.arrangeOutputs(n);
        });
    }

    arrange(node) {
        this.arrangeOutputs(node)
    }
}

function install(editor, { margin = { x: 50, y: 50 } }) {

    const ar = new AutoArrange(editor, margin);

    editor.arrange = ar.arrange.bind(ar);
}

export default {
    name: 'auto-arrange',
    install
}