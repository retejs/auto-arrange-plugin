export class AutoArrange {
    constructor(editor, margin, depth) {
        this.editor = editor;
        this.margin = margin;
        this.depth = depth;
    }

    getNodes(node, type = 'output') {
        const nodes = [];
        const key = `${type}s`;

        for (let io of node[key].values())
            for (let connection of io.connections.values())
                nodes.push(connection[type === 'input' ? 'output' : 'input'].node);

        return nodes;
    }

    getNodesTable(node, cols = [], depth = 0) {
        if (this.depth && depth > this.depth) return;
        if (!cols[depth]) cols[depth] = [];
        if (cols[depth].includes(node)) return;

        cols[depth].push(node);

        this.getNodes(node, 'output').map(n => this.getNodesTable(n, cols, depth + 1));
        this.getNodes(node, 'input').map(n => this.getNodesTable(n, cols, depth - 1));

        return cols;
    }

    nodeSize(node) {
        const el = this.editor.view.nodes.get(node).el;

        return {
            width: el.clientWidth,
            height: el.clientHeight
        }
    }

    arrange(node = this.editor.nodes[0]) {
        const table = this.getNodesTable(node);
        const normalized = Object.keys(table).sort((i1, i2) => +i1 - + i2).map(key => table[key]);
        const widths = normalized.map(col => Math.max(...col.map(n => this.nodeSize(n).width)));

        let x = 0;

        for (let [i, col] of Object.entries(normalized)) {
            const heights = col.map(n => this.nodeSize(n).height);
            const fullHeight = heights.reduce((a, b) => a + b + this.margin.y);

            let y = 0;

            x += widths[i] + this.margin.x;

            for (let [j, n] of Object.entries(col)) {
                y += heights[j] + this.margin.y;

                this.editor.view.nodes.get(n).translate(x, y - fullHeight / 2);
                this.editor.view.updateConnections({ node: n });
            }
        }
    }
}
