const fs = require('fs');
const _ = require('lodash');
const shell = require('shelljs');

const CREDENTIALS_DIR = 'dist/schemas/credentials';
const UCA_DIR = 'dist/schemas/uca';
const PUBLISH_DIR = 'dist/schemas/public';


if (!fs.existsSync(PUBLISH_DIR)) {
  shell.mkdir('-p', PUBLISH_DIR);
}

const indexContent = [];

const publishUcaSchemas = () => {
  fs.readdir(UCA_DIR, (err, versionFolders) => {
    _.forEach(versionFolders, (folder) => {
      fs.readdir(`${UCA_DIR}/${folder}`, (err2, files) => {
        _.forEach(files, (file) => {
          console.log(file);
          const schemaContent = fs.readFileSync(`${UCA_DIR}/${folder}/${file}`, 'UTF-8');
          const schema = JSON.parse(schemaContent);
          console.log(schema.title);
          const schemaTitleSplit = schema.title.split(':');
          const targetDir = 'claim';
          const targetFile = file;
          if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}/${folder}`)) {
            shell.mkdir('-p', `${PUBLISH_DIR}/${targetDir}/${folder}`);
          }
          fs.copyFileSync(`${UCA_DIR}/${folder}/${file}`, `${PUBLISH_DIR}/${targetDir}/${folder}/${targetFile}.json`);
          indexContent.push({
            name: `${targetDir}/${folder}/${targetFile}`, link: `./${targetDir}/${folder}/${targetFile}.json`,
          });
        });
      });
    });
  });
};

const publishCredentialSchemas = () => {
  fs.readdir(CREDENTIALS_DIR, (err, versionFolders) => {
    _.forEach(versionFolders, (folder) => {
      fs.readdir(`${CREDENTIALS_DIR}/${folder}`, (err2, files) => {
        _.forEach(files, (file) => {
          console.log(file);
          const schemaContent = fs.readFileSync(`${CREDENTIALS_DIR}/${folder}/${file}`, 'UTF-8');
          const schema = JSON.parse(schemaContent);
          console.log(schema.title);
          const titleSplit = _.split(schema.title, '-');
          const targetDir = titleSplit[1];
          const targetFile = file;
          if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}/${folder}/`)) {
            shell.mkdir('-p', `${PUBLISH_DIR}/${targetDir}/${folder}/`);
          }
          fs.copyFileSync(`${CREDENTIALS_DIR}/${folder}/${file}`, `${PUBLISH_DIR}/${targetDir}/${folder}/${targetFile}.json`);
          indexContent.push({
            name: `${targetDir}/${folder}/${targetFile}`, link: `./${targetDir}/${folder}/${targetFile}.json`,
          });
        });
      });
    });
  });
};

const makeIndexFile = () => {
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
  index += '</body>\n';
  index += '</html>\n';

  fs.writeFileSync(`${PUBLISH_DIR}/index.html`, index, { encoding: 'utf8' });
};

const publish = () => {
  publishCredentialSchemas();
  publishUcaSchemas();
};

process.on('exit', makeIndexFile);

publish();
