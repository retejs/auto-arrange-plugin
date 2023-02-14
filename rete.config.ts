/* eslint-disable @typescript-eslint/naming-convention */
import { ReteOptions } from 'rete-cli'

export default <ReteOptions>{
  input: 'src/index.ts',
  name: 'AutoArrangePlugin',
  globals: {
    'elkjs': 'ELK',
    'rete': 'Rete',
    'rete-area-plugin': 'ReteAreaPlugin'
  }
}
