const fs = require('fs');
const _ = require('lodash');
const shell = require('shelljs');

const CREDENTIALS_DIR = 'dist/schemas/credentials';
const UCA_DIR = 'dist/schemas/uca';
const CLAIM_DIR = 'dist/schemas/claim';
const PUBLISH_DIR = 'dist/schemas/public';


if (!fs.existsSync(PUBLISH_DIR)) {
  shell.mkdir('-p', PUBLISH_DIR);
}

const indexContent = [];

const publishSchemas = (dir, type) => {
  fs.readdir(dir, (err, versionFolders) => {
    _.forEach(versionFolders, (folder) => {
      fs.readdir(`${dir}/${folder}`, (err2, files) => {
        _.forEach(files, (file) => {
          console.log(file);
          const schemaContent = fs.readFileSync(`${dir}/${folder}/${file}`, 'UTF-8');
          const schema = JSON.parse(schemaContent);
          console.log(schema.title);
          const schemaTitleSplit = schema.title.split(':');
          let targetDir = type;
          
          const targetFile = file.replace(`${type}-`, '').replace(/-v.*$/, '').replace('.json', '');
          if (!fs.existsSync(`${PUBLISH_DIR}/${targetDir}/${folder}`)) {
            shell.mkdir('-p', `${PUBLISH_DIR}/${targetDir}/${folder}`);
          }
          fs.copyFileSync(`${dir}/${folder}/${file}`, `${PUBLISH_DIR}/${targetDir}/${folder}/${targetFile}.json`);
          indexContent.push({
            name: `${targetDir}/${folder}/${targetFile.replace('.schema','')}`, link: `./${targetDir}/${folder}/${targetFile}.json`,
          });
        });
      });
    });
  });
};

const publishClaimSchemas = () => {
  publishSchemas(CLAIM_DIR, 'claim');
};

const publishUcaSchemas = () => {
  publishSchemas(UCA_DIR, 'uca');
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
          const targetDir = titleSplit[1].replace(/-v.*$/, '').replace("credential-", '').replace('.json', '');
          const targetFile = file.replace("credential-", '').replace(/-v.*$/, '').replace('.json', '');
          if (!fs.existsSync(`${PUBLISH_DIR}/credential/${folder}/`)) {
            shell.mkdir('-p', `${PUBLISH_DIR}/credential/${folder}/`);
          }
          fs.copyFileSync(`${CREDENTIALS_DIR}/${folder}/${file}`, `${PUBLISH_DIR}/credential/${folder}/${targetFile}.json`);
          indexContent.push({
            name: `credential/${folder}/${targetFile.replace('.schema','')}`, link: `./credential/${folder}/${targetFile}.json`,
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
  publishClaimSchemas();
  publishUcaSchemas();
};

process.on('exit', makeIndexFile);

publish();
