import handlebars from 'handlebars';
import fs from 'fs';
import { IMailTemplateProvider } from '../models/IMailTemplateProvider';
import { IParseMailTemplateDTO } from '../dtos/IParseMailTemplateDTO';

export class HandlebarsMailTemplateProvider implements IMailTemplateProvider {
  private readonly ENCODING_CHAR_SET = 'utf8';

  public async parse(data: IParseMailTemplateDTO): Promise<string> {
    const { file, variables } = data;
    const templateFileContent = await fs.promises.readFile(file, {
      encoding: this.ENCODING_CHAR_SET,
    });
    const parseTemplate = handlebars.compile(templateFileContent);

    return parseTemplate(variables);
  }
}
