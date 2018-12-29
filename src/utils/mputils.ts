export function GenXml(object: {}): string {
  let xml = '<xml>';
  for (const key in object) {
      const element = object[key];
      let line = `<${key}><![CDATA[${element}]]></${key}>`;
      xml += line;
  }
  xml += '</xml>';
  return xml;
}