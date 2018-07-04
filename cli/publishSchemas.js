const fs = require('fs');
const _ = require('lodash');

const CREDENTIALS_DIR = './dist/schemas/credentials';
const UCA_DIR = './dist/schemas/uca';
const PUBLISH_DIR = './dist/schemas/public';


if (!fs.existsSync(PUBLISH_DIR)) {
  fs.mkdirSync(PUBLISH_DIR);
}

const indexContent = [];

fs.readdir(CREDENTIALS_DIR, (err, list) => {
  _.forEach(list, (el) => {
    console.log(el);
    const schema = require(`../${CREDENTIALS_DIR}/${el}`);
    console.log(schema.title);
    const targetDir = _.split(schema.title, ':')[1];
    const targetFile = _.split(schema.title, ':')[2];
    if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}`)) {
      fs.mkdirSync(`${PUBLISH_DIR}/${targetDir}`);
    }
    fs.copyFileSync(`${CREDENTIALS_DIR}/${el}`, `${PUBLISH_DIR}/${targetDir}/${targetFile}.json`);
    indexContent.push({ name: el, link: `./${targetDir}/${targetFile}.json` });
  });

  fs.readdir(UCA_DIR, (err, list) => {
    _.forEach(list, (el) => {
      console.log(el);
      const schema = require(`../${UCA_DIR}/${el}`);
      console.log(schema.title);
      const targetDir = _.split(schema.title, ':')[1];
      const targetFile = _.split(schema.title, ':')[2];
      if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}`)) {
        fs.mkdirSync(`${PUBLISH_DIR}/${targetDir}`);
      }
      fs.copyFileSync(`${UCA_DIR}/${el}`, `${PUBLISH_DIR}/${targetDir}/${targetFile}.json`);
      indexContent.push({ name: `${targetDir}/${targetFile}`, link: `./${targetDir}/${targetFile}.json` });
    });
    let index = '';
    console.log(JSON.stringify(indexContent, null, 2));
    index += '<html>\n';
    index += '<head>\n';
    index += '</head>\n';
    index += '<body>\n';
    index += '<ul>\n';
    _.forEach(indexContent, (content) => {
      index += `<li><a href='${content.link}' >${content.name}</a></li>\n`;
    });
    index += '</ul>\n';
    index += '</body\n';
    index += '</html>\n';

    fs.writeFileSync(`${PUBLISH_DIR}/index.html`, index, { encoding: 'utf8' });
  });
});

