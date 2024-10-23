interface IMailTemplateVariables {
  [key: string]: string | number;
}

export interface IParseMailTemplateDTO {
  file: string;
  variables: IMailTemplateVariables;
}
