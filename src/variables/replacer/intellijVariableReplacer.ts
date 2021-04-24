import { v4 as uuidv4 } from 'uuid';
import { VariableReplacer, VariableReplacerType } from '../../models';

export class IntellijVariableReplacer implements VariableReplacer {
  type = VariableReplacerType.intellijDynamic;
  async replace(text: string): Promise<string | undefined> {

    const variableRegex = /\{{2}(.+?)\}{2}/gu;
    let match: RegExpExecArray | null;
    let result = text;
    while ((match = variableRegex.exec(text)) !== null) {
      const [searchValue, variable] = match;

      let replacement: unknown = null;
      switch (variable.trim()) {
        case '$uuid':
          replacement = uuidv4();
          break;
        case '$timestamp':
          replacement = Date.now();
          break;
        case '$randomInt':
          replacement = Math.floor(Math.random() * 1000);
          break;
        default:
          replacement = null;
          break;
      }
      if (replacement) {
        result = result.replace(searchValue, `${replacement}`);
      }
    }
    return Promise.resolve(result);
  }
}
