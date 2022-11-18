import { ReteOptions } from 'rete-cli'

export default <ReteOptions>{
    input: 'src/next/index.ts',
    name: 'AutoArrangePlugin',
    globals: {
        'elkjs': 'ELK'
    }
}
