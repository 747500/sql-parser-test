// import { Parser, AST } from 'node-sql-parser';

import pkg from 'node-sql-parser';
const { Parser, AST } = pkg;

const parserOps = { database: 'postgresql'};

const query = `
SELECT
	somefunc(
        engineering_networks.realizaciya,
        engineering_networks.company = 'blah-blah'
        AND
        engineering_networks.obem_realizacii_tip = 'uslugi'
      ) AS var0,
      If(var0 > 0, '2', '1') AS fontColor
     FROM engineering_networks AS engineering_networks
     WHERE
     	engineering_networks.company = 'blah-blah' AND
        engineering_networks.month IN ('April') AND
        engineering_networks.year IN ('2024')
     LIMIT 1;
`;

const parser = new Parser()
const ast = parser.astify(query, parserOps);
const queryRe = parser.sqlify(ast, parserOps);

//console.log(ast);
console.log(queryRe);

